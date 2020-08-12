import { noteToMajorTriad, SAMPLE_RATE } from "./sound-keys.js";
function loadBuffer(freq) {

}
let keyCounter = 0,
  fftTimer = null;

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
  osc3: ["sine", "sine", "square"],
  overtone: [0.8, 0.3, 0.1],
  detune: [0, 0, 5],
  delay: [0, 1, 1],
  LPF: { frequency: 2000, Q: 3 },
  HPF: { frequency: 60, Q: 3 },

  eqHZs: [62.5, 125, 250, 500, 1000],
  adsr: [0.02, 0.5, 0.1, 0.03, 1.0],
  LFO1: { frequeycy: 60, target: null },
  LFO2: { frequeycy: 60, target: null },
  compression: { threshold: -50, ratio: 5, preAmp: 1, postAmp: 1 },
};

const activeNotes = {};

const ch = new BroadcastChannel("wschannel");
ch.onmessage = async function ({ data }) {
  if (data.cmd && data.cmd === "updateSetting") {
    const { key, idx, value } = data;
    _settings[key][idx] = value;
    value = parseFloat(value);
    if (key == 'compression') {
      if (idx === 'threshold') {
        compressor.threshold
          .setValueAtTime(value, ctx.currentTime);
      }
      if (idx === 'ratio') {
        compressor.ratio.setValueAtTime(value, ctx.currentTime);

      }
      if (idx === 'preAmp') {
        preAmp.gain.setValueAtTime(value, ctx.currentTime);

      }
      if (idx === 'postAmp') {
        postAmp.gain.setValueAtTime(value, ctx.currentTime);

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
      //case 'kick': kick(); break;
      default:
        break;
    }
  }
};

const fftc = new BroadcastChannel("fftc");
let ctx;
let masterGain, compressor, analyser, preAmp, postAmp, LPF, HPF;
let LFO1, LFO2, EQ;
let passThrough;

export async function getContext() {
  if (ctx) return ctx;

  ctx = new AudioContext({ sampleRate: SAMPLE_RATE });

  if (ctx.state === "paused") ctx.resume();
  masterGain = masterGain || new GainNode(ctx, { gain: 1 });
  compressor = new DynamicsCompressorNode(ctx, {
    threshold: -10,
    radio: 4,
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
  // LFO1 = new OscillatorNode(ctx, { frequency: _settings.LFO1.frequency });
  // LFO2 = new OscillatorNode(ctx, { frequency: _settings.LFO2.frequency });
  // EQ = [62.5, 125, 250, 500, 1000].map(
  //   (hz) => new BiquadFilterNode(ctx, { type: "peaking", frequency: hz, Q: 1, gain: 1 })
  // );
  // EQ[0].connect(EQ[1]);
  // EQ[1].connect(EQ[2]);
  // EQ[2].connect(EQ[3]);
  // EQ[3].connect(EQ[4]);
  analyser = new AnalyserNode(ctx, { fftSize: 256, smoothingTimeConstant: 0.1 });
  preAmp = new GainNode(ctx, { gain: 1 });
  postAmp = new GainNode(ctx, { gain: 1 });
  LFO1.connect(masterGain.gain);
  masterGain
    .connect(preAmp)
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
export let noteCache = {};

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
noteCache = {};
export function getNote(freq) {
  //(freqs, octave = 3) {
  ensureAudioCtx();
  const hashkey = freq;
  if (noteCache[hashkey] && ctx.currentTime - noteCache[hashkey].started > 5)
    return noteCache[hashkey];

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
      var _gain = new GainNode(ctx, { gain: _settings.overtone[idx] });
      var delay = new DelayNode(ctx, { delay: _settings.delay[idx] });
      osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
      _gain.connect(outputGain);
      osc.start(0);
    });
  outputGain.connect(masterGain);
  var gainEnvelope = new Envelope(_settings.adsr, outputGain.gain);
  return gainEnvelope;
}
