import { noteToMajorTriad, noteToMinorTriad, melody, SAMPLE_RATE } from "./sound-keys.js";

const MIN_RAMP_TIME = 0.000244140625;
let keyCounter = 0,
  fftTimer = null;

export function Envelope(adsr, audioParam) {
  const [attack, decay, sustain, release] = adsr;
  var attackStart, releaseStart;
  var extended = [];
  var state = "init",
    shape;
  const trigger = () => {
    keyCounter += 3000;
    attackStart = ctx.currentTime;
    state = "attacking";
    audioParam.linearRampToValueAtTime(1.0, ctx.currentTime + attack);
    audioParam.setTargetAtTime(1 - sustain, ctx.currentTime + attack, decay);
    audioParam.setTargetAtTime(0.001, ctx.currentTime + attack + decay, release);
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
  osc3: ["sine", "sine", "square"],
  harmonicity: [0.5, 0.2, 0.1],
  detune: [0, 2, 2],
  delay: [0, 0, 1],
  lpf: [1600],
  hpf: [70],
  adsr: [0.01, 0.2, 0.8, 0.3],
};

const ch = new BroadcastChannel("wschannel");
ch.onmessage = function ({ data }) {
  if (data.cmd && data.cmd === "updateSetting") {
    console.log("ctx got msg " + JSON.stringify(data));
    const { key, idx, value } = data;
    _settings[key][idx] = value;
  }
};
const fftc = new BroadcastChannel("fftc");
let ctx;
let masterGain, compressor, analyser;

export function getContext() {
  if (ctx) return ctx;
  ctx = new AudioContext({ sampleRate: SAMPLE_RATE });

  if (ctx.state === "paused") ctx.resume();
  masterGain = masterGain || new GainNode(ctx, { gain: 1 });
  compressor = new DynamicsCompressorNode(ctx, {
    threshold: -60,
    radio: 4,
  });
  analyser = new AnalyserNode(ctx, { fftSize: 1024, smoothingTimeConstant: 1.0 });
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
  analyser.getByteTimeDomainData(dataArray);
  const ndataArray = dataArray.map((v) => Math.abs(v - 127));
  const rmns = ndataArray.reduce((sum, val) => (sum += val * val), 0);
  if (rmns > 0) {
    fftc.postMessage({
      time: ctx.currentTime,
      dataArray: ndataArray,
      minDecibels: analyser.minDecibels,
      binCount: analyser.frequencyBinCount,
      sampleRate: ctx.sampleRate,
      rmns: rmns,
    });
  }
  keyCounter -= 10;

  if (keyCounter < 0) {
    cancelAnimationFrame(fftTimer);
    fftTimer = null;
    return;
  } else {
    fftTimer = requestAnimationFrame(fftLoop);
  }
};

export const VolumeProxy = (gainParam, label) =>
  new Proxy(gainParam, {
    label: () => label,
    get: () => gainParam.value,
    set: (value) => {
      const _opts = { min: 0, max: 2 };

      if (value < _opts.min || value > _opts.max) return false;
      gainParam.setValueAtTime(value, 0);
      return true;
    },
  });
const accel = 1;

export const EQProxy = (filterChain, label) =>
  new Proxy(filterChain, {
    label: label,
    get: () => {
      aggregateFrequencyResponse(filterChain);
    },
    bass: filterChain.filter((biquad) => biquad.frequency < 400),
    treble: filterChain.filter((biquad) => biquad.frequency > 900),
    moreBass: filterChain
      .filter((biquad) => biquad.frequency < 400)
      .map((bass) => bass.gain.linearRampToValueAtTime(bass.gain.value * 1.03 * accel)),
    lessBass: filterChain
      .filter((biquad) => biquad.frequency < 400)
      .map((bass) => bass.gain.linearRampToValueAtTime(bass.gain.value * 0.96 * accel)),
    moreTreble: filterChain
      .filter((biquad) => biquad.frequency > 700)
      .map((treb) => treb.gain.linearRampToValueAtTime(treb.gain.value * 1.03 * accel)),
    lessTreble: filterChain
      .filter((biquad) => biquad.frequency > 700)
      .map((treb) => treb.gain.linearRampToValueAtTime(treb.gain.value * 0.96 * accel)),
  });

const aggregateFrequencyResponse = () => "";
const activeSounds = {};

export function getNotes(freqs, octave = 3) {
  freqs.sort();
  const hashkey = (freqs[0] * 4 + freqs[1] && freqs[1] * 2) || (0 + freqs[3] && freqs[3] * 1);
  if (noteCache[hashkey] && noteCache[hashkey].state !== "attacking") return noteCache[hashkey];
  ctx = ctx || new AudioContext();

  const outputGain = new GainNode(ctx, { gain: 0 });

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
      var _gain = new GainNode(ctx, { gain: _settings.harmonicity[idx] });
      var delay = new DelayNode(ctx, { delay: _settings.delay[idx] });
      osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
      _gain.connect(outputGain);
      osc.start(0);
    });
  outputGain.connect(masterGain);
  var gainEnvelope = new Envelope(_settings.adsr, outputGain.gain);
  return gainEnvelope;
}
