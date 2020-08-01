import {noteToMajorTriad, noteToMinorTriad, melody, SAMPLE_RATE} from "./sound-keys.js";

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
    triggerEnvelope: ({attackStart, releaseStart, extended}) => {
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
      return {attackStart, releaseStart, extended};
    },
  };
}

export let _settings = {
  osc3: ["sine", "triangle", "square"],
  harmonicity: [0.5, 0.2, 0.1],
  detune: [0, 2, 2],
  delay: [0, 0, 1],
  LPF: {frequency: 2000, Q: 3},
  HPF: {frequency: 60, Q: 3},

  eqHZs: [62.5, 125, 250, 500, 1000],
  adsr: [0.01, 0.2, 0.1, 0.3, 1.0],
  LFO1: {frequeycy: 60, target: null},
  LFO2: {frequeycy: 60, target: null},
};

const ch = new BroadcastChannel("wschannel");
const activeNotes = {};
ch.onmessage = function ({data}) {
  if (data.cmd && data.cmd === "updateSetting") {
    const {key, idx, value} = data;
    _settings[key][idx] = value;
  }

  if ((data.cmd && data.cmd === "keyboard") || data.cmd === "playback") {
    let i = 0;
    console.log("data", data);
    const {freq, index, time, type} = data;
    switch (type) {
      case "keydown":
        const note = getNote(freq);
        activeNotes[index] = {
          start: time,
          note: note,
        };
        note.trigger();
        break;
      case "keypress":
        // if (activeNotes[index]) activeNotes[index].triggerRelease();
        break;
      case "keyup":
        activeNotes[index] && activeNotes[index].triggerRelease();
        break;
      default: break;
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
  ctx = new AudioContext({sampleRate: SAMPLE_RATE});

  if (ctx.state === "paused") ctx.resume();
  masterGain = masterGain || new GainNode(ctx, {gain: 1});
  compressor = new DynamicsCompressorNode(ctx, {
    threshold: -60,
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
  LFO1 = new OscillatorNode(ctx, {frequency: _settings.LFO1.frequency});
  LFO2 = new OscillatorNode(ctx, {frequency: _settings.LFO2.frequency});
  EQ = [62.5, 125, 250, 500, 1000].map(
    (hz) => new BiquadFilterNode(ctx, {type: "peaking", frequency: hz, Q: 1, gain: 1})
  );
  EQ[0].connect(EQ[1]);
  EQ[1].connect(EQ[2]);
  EQ[2].connect(EQ[3]);
  EQ[3].connect(EQ[4]);
  analyser = new AnalyserNode(ctx, {fftSize: 256, smoothingTimeConstant: 0.1});
  preAmp = new GainNode(ctx, {gain: 1});
  postAmp = new GainNode(ctx, {gain: 1});

  masterGain.connect(HPF);
  masterGain.connect(EQ[0])
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
let noteCache = {};
export function getNote(notefreq) {
  return getNotes([notefreq]);
}

export const AudioParamProxy = function (audioParam, label) {
  new Proxy(audioParam, {
    label: label,
    get: () => audioParam.value,
    set: (value) => {
      const _opts = {
        min: audioParam.minValue,
        max: audioParam.maxValue,
      };

      if (value < _opts.min || value > _opts.max) return false;

      audioParam.setValueAtTime(value, 0);

      return true;
    },
  });
};

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

export function getNotes(freqs, octave = 3) {
  ensureAudioCtx();
  freqs.sort();
  const hashkey = freqs[0]; // * 4 + freqs[1] && freqs[1] * 2) || (0 + freqs[3] && freqs[3] * 1);
  if (noteCache[hashkey] && noteCache[hashkey].state !== "attacking") return noteCache[hashkey];
  ctx = ctx || new AudioContext();

  const outputGain = new GainNode(ctx, {gain: 0});

  var chords =
    freqs.length == 1
      ? noteToMajorTriad(freqs[0])
      : freqs.length == 2
        ? noteToMajorTriad(freqs[0]).concat(noteToMinorTriad(freqs[1]))
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
      var _gain = new GainNode(ctx, {gain: _settings.harmonicity[idx]});
      var delay = new DelayNode(ctx, {delay: _settings.delay[idx]});
      osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
      _gain.connect(outputGain);
      osc.start(0);
    });
  outputGain.connect(masterGain);
  var gainEnvelope = new Envelope(_settings.adsr, outputGain.gain);
  return gainEnvelope;
}
