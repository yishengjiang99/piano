import { noteToMajorTriad, noteToMinorTriad, melody } from "./sound-keys.js";
import { TheContext } from "./redux/store";

export function Envelope(adsr, audioParam) {
  const [attack, decay, sustain, release] = adsr;
  var attackStart, releaseStart;
  var extended = [];
  const trigger = () => {
    attackStart = ctx.currentTime;
    audioParam.setValueCurveAtTime([0, 1.0], ctx.currentTime, attack);
    audioParam.setValueCurveAtTime([1.0, sustain * 1.0], ctx.currentTime + attack, decay);
    audioParam.setTargetAtTime(0.0000001, ctx.currentTime + attack + decay, release);
  };
  const triggerRelease = () => {
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
  if (noteCache[notefreq]) return noteCache[notefreq];
  ctx = ctx || new AudioContext();
  const freqmultiplierindex = [0, 0.25, 0.5, 1, 2, 4];
  if (notefreq <= 0 || isNaN(notefreq)) {
    alert(notefreq);
  }

  const outputGain = new GainNode(ctx, { gain: 0 });
  var chords = noteToMajorTriad(notefreq, octave);

  chords
    .map((freq, idx) => {
      console.log(freq);
      return new OscillatorNode(ctx, {
        type: _settings.osc3[idx],
        frequency: freq,
        detune: _settings.detune[idx],
      });
    })
    .map((osc, idx) => {
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
