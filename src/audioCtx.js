import { noteToMajorTriad, noteToMinorTriad, melody } from "./sound-keys.js";
import { TheContext } from "./redux/store";

export function Envelope(adsr, audioParam) {
  const [attack, decay, sustain, release] = adsr;
  var attackStart, releaseStart;
  var extended = [];
  var state = "init",
    shape;
  const trigger = () => {
    attackStart = ctx.currentTime;
    state = "attacking";
    audioParam.setValueCurveAtTime([0, 1.0], ctx.currentTime, attack);
    audioParam.setValueCurveAtTime([1.0, sustain * 1.0], ctx.currentTime + attack, decay);
    audioParam.setTargetAtTime(0.0000001, ctx.currentTime + attack + decay, release);
    audioParam.setValueAtTime(0, ctx.currentTime + attack + decay + 3);
  };
  const triggerRelease = () => {
    state = "releasing";
    audioParam.cancelScheduledValues(0);
    releaseStart = ctx.currentTime;
    audioParam.setTargetAtTime(0.0000001, ctx.currentTime, release);
  };
  const hold = () => {
    if (attackStart + attack > ctx.currentTime) return;
    extended.push(ctx.currentTime);
    audioParam.cancelScheduledValues(0);

    audioParam.linearRampToValueAtTime(sustain * 1.0, ctx.currentTime + decay);
  };
  return {
    trigger,
    triggerRelease,
    hold,
    triggerEnvelope: ({ attackStart, releaseStart, extended }) => {
      var peak = 1.0;
      var attacked = releaseStart - attackStart;

      if (attacked < attack) {
        peak = attacked / attack;
      }

      var sustainedTime = extended.length ? extended[extended.length - 1] : decay;

      audioParam.setValueCurveAtTime([0, peak], ctx.currentTime, attacked);
      audioParam.setValueCurveAtTime(
        [peak, sustain * peak],
        ctx.currentTime + attacked,
        sustainedTime
      );
      audioParam.setTargetAtTime(0.0000001, ctx.currentTime + attacked + sustainedTime, release);
    },
    cloneShape: () => {
      return { attackStart, releaseStart, extended };
    },
  };
}
export let _settings = {
  osc3: ["sine", "square", "sine"],
  chords: [1, 2, 4],
  gains: [0.5, 0.2, 0.1],
  adsr: [0.01, 0.2, 0.8, 0.3],
  detune: [0, 2, 2],
  delay: [0, 0, 1],
  lpf: 1600,
  hpf: 70,
};
let ctx;
let masterGain, compressor, analyser;

export function updateSettings(newsetts) {
  _settings = newsetts;
}

export function getContext() {
  ctx = ctx || new AudioContext();
  if (ctx.state === "paused") ctx.resume();
  masterGain = masterGain || new GainNode(ctx, { gain: 1 });
  compressor = new DynamicsCompressorNode(ctx, {
    threshold: -60,
    radio: 4,
  });
  analyser = new AnalyserNode(ctx, { fftSize: 1024, smoothingTimeConstant: 0.2 });
  masterGain.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(ctx.destination);
  return ctx;
}

export async function ensureAudioCtx() {
  if (ctx == null || ctx.state === "paused") {
    const audioCtx = await getContext();
    ctx = audioCtx;
  }
  return ctx;
}
let noteCache = {};
export function getNote(notefreq, octave = 3) {
  return getNotes([notefreq]);
}

export const AudioParamProxy = function(audioParam, label) {
  new Proxy(audioParam, {
    label: label,
    get: () => audioParam.value,
    set: (value)=>{
      const _opts={
        min: audioParam.minValue,
        max: audioParam.maxValue
      }

      if(value < _opts.min || value > _opts.max) return false;
      
      audioParam.setValueAtTime(value, 0);
      
      return true;
    }
  });
}





export const VolumeProxy = (gainParam, label) => new Proxy(gainParam,
  {
    label: ()=>  label,
    get: () =>  gainParam.value,
    set: (value)=>{
    const _opts = {  min: 0, max:2 };

    if(value < _opts.min || value > _opts.max) return false;
    gainParam.setValueAtTime(value, 0);
    return true;
   }
});
const accel = 1;

export const EQProxy = (filterChain,label ) => new Proxy(filterChain, {
  label: label, 
    get:          ()=> { aggregateFrequencyResponse(filterChain) },
    bass:         filterChain.filter(biquad=>biquad.frequency<400), 
    treble:       filterChain.filter(biquad=>biquad.frequency>900), 
    moreBass:     filterChain.filter(biquad=>biquad.frequency<400).map(bass=>bass.gain.linearRampToValueAtTime(bass.gain.value*1.03 * accel)),
    lessBass:     filterChain.filter(biquad=>biquad.frequency<400).map(bass=>bass.gain.linearRampToValueAtTime(bass.gain.value*0.96 * accel)),
    moreTreble:   filterChain.filter(biquad=>biquad.frequency>700).map(treb=>treb.gain.linearRampToValueAtTime(treb.gain.value*1.03 * accel)),
    lessTreble:   filterChain.filter(biquad=>biquad.frequency>700).map(treb=>treb.gain.linearRampToValueAtTime(treb.gain.value*0.96 * accel)),
});

const aggregateFrequencyResponse = ()=> "";
const activeSounds = {};
export function getNotes(freqs, octave = 3) {
  freqs.sort();
  const hashkey = (freqs[0] * 4 + freqs[1] && freqs[1] * 2) || (0 + freqs[3] && freqs[3] * 1);
  if (noteCache[hashkey] && noteCache[hashkey].state !== "attacking") return noteCache[hashkey];
  ctx = ctx || new AudioContext();

  const outputGain = new GainNode(ctx, { gain: 0 });

  var chords =
    freqs.length == 1
      ? noteToMajorTriad(freqs[0], octave)
      : freqs.length == 2
      ? noteToMajorTriad(freqs[0], octave).concat(noteToMinorTriad(freqs[1], octave))
      : freqs.length == 3
      ? freqs
      : freqs.slice(0, 3);

  chords
    .map((freq, idx) => {
      return new OscillatorNode(ctx, {
        type: _settings.osc3[idx],
        frequency: freq,
        detune: _settings.detune[idx],
      });
    })
    .map((osc, idx) => {
      idx = idx % 3;
      var _gain = new GainNode(ctx, { gain: _settings.gains[idx] });
      var delay = new DelayNode(ctx, { delay: _settings.delay[idx] });
      osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
      _gain.connect(outputGain);
      osc.start(0);
    });
  outputGain.connect(masterGain);
  var gainEnvelope = new Envelope(_settings.adsr, outputGain.gain);
  return gainEnvelope;
}


var audioContext = null;
var unlocked = false;
var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var current16thNote;        // What note is currently last scheduled?
var tempo = 120.0;          // tempo (in beats per minute)
var lookahead = 25.0;       // How frequently to call scheduling function 
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps 
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
var noteLength = 0.05;      // length of "beep" (in seconds)
var canvas,                 // the canvas element
    canvasContext;          // canvasContext is the canvas' context 2D
var last16thNoteDrawn = -1; // the last "box" we drew on the screen
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages


// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();

function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;    // Notice this picks up the CURRENT 
                                          // tempo value to calculate beat length.
    nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    current16thNote++;    // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function scheduleNote( beatNumber, time ) {
    // push the note on the queue, even if we're not playing.
    notesInQueue.push( { note: beatNumber, time: time } );

    if ( (noteResolution==1) && (beatNumber%2))
        return; // we're not playing non-8th 16th notes
    if ( (noteResolution==2) && (beatNumber%4))
        return; // we're not playing non-quarter 8th notes

    // create an oscillator
    var osc = audioContext.createOscillator();
    osc.connect( audioContext.destination );
    if (beatNumber % 16 === 0)    // beat 0 == high pitch
        osc.frequency.value = 880.0;
    else if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
        osc.frequency.value = 440.0;
    else                        // other 16th notes = low pitch
        osc.frequency.value = 220.0;

    osc.start( time );
    osc.stop( time + noteLength );
}

function scheduler() {
    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
        scheduleNote( current16thNote, nextNoteTime );
        nextNote();
    }
}

function play() {
    if (!unlocked) {
      // play silent buffer to unlock the audio
      var buffer = audioContext.createBuffer(1, 1, 22050);
      var node = audioContext.createBufferSource();
      node.buffer = buffer;
      node.start(0);
      unlocked = true;
    }

    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
        current16thNote = 0;
        nextNoteTime = audioContext.currentTime;
        timerWorker.postMessage("start");
        return "stop";
    } else {
        timerWorker.postMessage("stop");
        return "play";
    }
}

function resetCanvas (e) {
    // resize the canvas - but remember - this clears the canvas too.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //make sure we scroll to the top left.
    window.scrollTo(0,0); 
}

function draw() {
    var currentNote = last16thNoteDrawn;
    var currentTime = audioContext.currentTime;

    while (notesInQueue.length && notesInQueue[0].time < currentTime) {
        currentNote = notesInQueue[0].note;
        notesInQueue.splice(0,1);   // remove note from queue
    }

    // We only need to draw if the note has moved.
    if (last16thNoteDrawn != currentNote) {
        var x = Math.floor( canvas.width / 18 );
        canvasContext.clearRect(0,0,canvas.width, canvas.height); 
        for (var i=0; i<16; i++) {
            canvasContext.fillStyle = ( currentNote == i ) ? 
                ((currentNote%4 === 0)?"red":"blue") : "black";
            canvasContext.fillRect( x * (i+1), x, x/2, x/2 );
        }
        last16thNoteDrawn = currentNote;
    }

    // set up to draw again
    requestAnimFrame(draw);
}

function init(){
    var container = document.createElement( 'div' );

    container.className = "container";
    canvas = document.createElement( 'canvas' );
    canvasContext = canvas.getContext( '2d' );
    canvas.width = window.innerWidth; 
    canvas.height = window.innerHeight; 
    document.body.appendChild( container );
    container.appendChild(canvas);    
    canvasContext.strokeStyle = "#ffffff";
    canvasContext.lineWidth = 2;

    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.

    audioContext = new AudioContext();

    // if we wanted to load audio files, etc., this is where we should do it.

    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas;

    requestAnimFrame(draw);    // start the drawing loop.

    timerWorker = new Worker("js/metronomeworker.js");

    timerWorker.onmessage = function(e) {
        if (e.data == "tick") {
            // console.log("tick!");
            scheduler();
        }
        else
            console.log("message: " + e.data);
    };
    timerWorker.postMessage({"interval":lookahead});
}

window.addEventListener("load", init );