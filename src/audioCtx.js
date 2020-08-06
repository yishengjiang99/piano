import { noteToMajorTriad, SAMPLE_RATE } from "./sound-keys.js";
import {loadProcessor} from './load-processor';
let keyCounter = 0, init=false;
let fftTimer = null;
let ctx;
let masterGain, compressor, analyser, preAmp, postAmp, LPF, HPF;
let LFO1, LFO2, EQ, passThrough;
let waveShape, periodicWave;
export let noteCache = {};

function loadWaveShape(url){
  fetch(url).then(res=>res.json()).then(json=> waveShape = json);
  noteCache={}; //reset existing oscs on nerxt note;
}
loadWaveShape("/wave-table/Piano.json");

const ch = new BroadcastChannel("wschannel");
ch.onmessage = async function ({ data }) {
  if (data.cmd && data.cmd === "updateSetting") {
    const { key, idx, value } = data;
    _settings[key][idx] = value;
    value = parseFloat(value);
    if(key=='compression'){
      if(idx==='threshold'){
        compressor.threshold
        .setValueAtTime(value,ctx.currentTime);
      }
      if(idx==='ratio'){
        compressor.ratio        .setValueAtTime(value,ctx.currentTime);

      }
      if(idx==='preAmp'){
        preAmp.gain        .setValueAtTime(value,ctx.currentTime);

      }
      if(idx==='postAmp'){
        postAmp.gain        .setValueAtTime(value,ctx.currentTime);

      }
    }
  }
  if (data.cmd && (data.cmd === "keyboard" || data.cmd === "playback")) {
    const ctx = await getContext();
    console.log("data", data);
    const { freq, index, time, type } = data;
    switch (type) {
      case "keydown":
        const note = getNote(freq);
        console.log(note);
        activeNotes[index] = note;

        note.trigger();
        break;
      case "keypress":
        if (activeNotes[index]) activeNotes[index].hold();
        else {
          const note = getNote(freq);
          activeNotes[index] = note;
          note.trigger();
        }
        break;
      case "keyup":
        //  activeNotes[index] && activeNotes[index].triggerRelease();
        activeNotes[index] = null;
        break;
      case 'kick': kick(); break;
      default:
        break;
    }
  }
};

const fftc = new BroadcastChannel("fftc");

const activeNotes = {};
export function Envelope(adsr, audioParam) {
  const [attack, decay, sustain, release] = adsr;
  var attackStart, releaseStart;
  var extended = [];
  var state = "init",
    shape;
  const trigger = (multiplier = 1) => {
    keyCounter += 3000;
    attackStart = ctx.currentTime;
    state = "attacking";
    audioParam.setValueCurveAtTime([0, multiplier], ctx.currentTime, attack);
    audioParam.setValueCurveAtTime(
      [multiplier, sustain * multiplier],
      ctx.currentTime + attack,
      decay
    );
    audioParam.setTargetAtTime(0.0000001, ctx.currentTime + attack + decay, release);
    audioParam.setValueAtTime(0, ctx.currentTime + attack + decay + 3);
    if (keyCounter < 0 || fftTimer === null) {
      fftTimer = requestAnimationFrame(fftLoop);
    }
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

    //audioParam.linearRampToValueAtTime(sustain * 1.0, ctx.currentTime + decay);
  };
  return {
    toString:()=>`${audioParam.value} ${attackStart}`,
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
  osc3: ["sine", "sine", "sine"],
  overtone: [0.8, 0.3, 0.1],
  detune: [0, 0, 5],
  delay: [0, 1, 1],
  LPF: { frequency: 2000, Q: 3 },
  HPF: { frequency: 60, Q: 1 },
  compression: {threshold:-50, ratio:5, preAmp: 1, postAmp:1},
  eqHZs: [62.5, 125, 250, 500, 1000],
  adsr: [0.01, 0.04, 0.5, 0.4, 1.0],
  LFO1: { frequeycy: 60, target: null },
  LFO2: { frequeycy: 60, target: null },
};


export function getNote(freq) {
  //(freqs, octave = 3) {
  ensureAudioCtx();
  const hashkey = freq;
  if (noteCache[hashkey] && ctx.currentTime - noteCache[hashkey].started > 5)
    return noteCache[hashkey];
  if(!periodicWave && waveShape){
    periodicWave = ctx.createPeriodicWave([waveShape.real, waveShape.image]);
  }
  const outputGain = new GainNode(ctx, { gain: 0 });
  var chords = noteToMajorTriad(freq); // _settings.overtone.map((multiplier) => freqs * multiplier);
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
     // if(idx==1 && periodicWave) osc.setPeriodicWave(periodicWave)

      var _gain = new GainNode(ctx, { gain: _settings.overtone[idx] });
      var delay = new DelayNode(ctx, { delay: _settings.delay[idx] });
      osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
      _gain.connect(outputGain);
      osc.start(0);
    });
  outputGain.connect(masterGain);
  var gainEnvelope = new Envelope(_settings.adsr, outputGain.gain);
  noteCache[freq]=gainEnvelope;
  return gainEnvelope;
}


export function attachBuffer(buffer){
  let bn = new AudioBufferSourceNode(ctx,{
    loop:true,
    playbackRate:1
  })
  bn.connect(masterGain);
}
export function attachNode(node){
  node.connect(masterGain);
}
export async function getContext() {
  if (ctx) return ctx;
  ctx = new AudioContext();
  if (ctx.state === "paused") ctx.resume();

  masterGain = new GainNode(ctx);
  compressor = new DynamicsCompressorNode(ctx, {
    threshold: _settings.compression.threshold,
    radio: _settings.compression.ratio,
  });
  LPF = new BiquadFilterNode(ctx, {
    type: "lowpass",
    frequency: _settings.LPF.frequency,
    Q: _settings.LPF.Q,
  });
  HPF = new BiquadFilterNode(ctx, {
    type: "highpass",
    frequency: _settings.HPF.frequency,
    Q: _settings.HPF.Q,
  });
  LFO1 = new OscillatorNode(ctx, { frequency: _settings.LFO1.frequency });

  analyser = new AnalyserNode(ctx, { fftSize: 256, smoothingTimeConstant: 0.1 });
  preAmp = new GainNode(ctx, { gain: _settings.compression.preAmp });
  postAmp = new GainNode(ctx, { gain:  _settings.compression.postAmp });
  // LFO1.connect(masterGain.gain);
  // LFO1.start()
  // passThrough = await loadProcessor(ctx,'pass-through');
  
  var splitter = ctx.createChannelSplitter(2);
  var merger = ctx.createChannelMerger(2);
  var headTurnDelay = ctx.createDelay(1);
  var headTurnGain = ctx.createGain(2);

  masterGain.connect(splitter);
  splitter.connect(headTurnDelay,0).connect(headTurnGain,0).connect(merger,0,0);
  splitter.connect(merger,1,1)
  merger.connect(preAmp);


  preAmp
    .connect(compressor)
    .connect(postAmp)
    .connect(analyser)
    .connect(ctx.destination);

  return ctx;
}

export async function ensureAudioCtx() {
  if (ctx == null || ctx.state === "paused") {
    const audioCtx = await getContext();
    ctx = audioCtx;
  }
  return ctx;
}



const fftLoop = () => {
  const dataArray = new Uint8Array(analyser.fftSize);
  analyser.getByteFrequencyData(dataArray);
  fftc.postMessage({
    time: ctx.currentTime,
    dataArray: dataArray,
    minDecibels: analyser.minDecibels,
    binCount: analyser.frequencyBinCount,
    sampleRate: ctx.sampleRate,
  });
  keyCounter -= 10;

  if (keyCounter < 0) {
    cancelAnimationFrame(fftTimer);
    fftTimer = null;
    return;
  } else {
    fftTimer = requestAnimationFrame(fftLoop);
  }
};

function kick() {

  var osc = ctx.createOscillator();
  var osc2 = ctx.createOscillator();
  var gainOsc = ctx.createGain();
  var gainOsc2 = ctx.createGain();

  osc.type = "triangle";
  osc2.type = "sine";

  gainOsc.gain.setValueAtTime(1.5, ctx.currentTime);
  gainOsc.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  gainOsc2.gain.setValueAtTime(1.5, ctx.currentTime);
  gainOsc2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
 
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc2.frequency.setValueAtTime(50, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.connect(gainOsc);
  osc2.connect(gainOsc2);
  gainOsc.connect(masterGain);
  gainOsc2.connect(masterGain);

  osc.start(ctx.currentTime);
  osc2.start(ctx.currentTime);

  osc.stop(ctx.currentTime + 0.5);
  osc2.stop(ctx.currentTime + 0.5);

};