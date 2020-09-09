import initAudioSources from './audio_sources'; //sounds';

export let ctx;
export let masterGain;
export let _settings = {
  osc3: ["sine", "sine", "sine"],
  overtone: [0.8, 0.3, 0.1],
  detune: [0, 1, 2],
  delay: [0, 1, 1],
  LPF: { frequency: 2000, Q: 3 },
  HPF: { frequency: 60, Q: 3 },

  eqHZs: [62.5, 125, 250, 500, 1000],
  adsr: [0.02, 0.2, 0.5, 0.2, 1.4],
  LFO1: { frequeycy: 60, target: null },
  LFO2: { frequeycy: 60, target: null },
  compression: { threshold: -50, ratio: 5, preAmp: 1, postAmp: 1 },
};
export let passthrough;
export let noteCache;

let keyCounter = 0, fftTimer = null;
let compressor, analyser, preAmp, postAmp;

export let instruments = {};
const activeNotes = {};
const wschannel = new BroadcastChannel("wschannel");
wschannel.onmessage = handleWs;

async function handleWs({ data }) {
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
    await getContext();
    data.instrument = data.instrument || "piano";

    const { freq, index, time, type, instrument } = data;
    switch (type) {
      case "keydown":
      case "keypress":
        if (activeNotes[index]) activeNotes[index].hold();
        else {
          const note = instruments[instrument](freq);
          activeNotes[index] = note;
          note.trigger();
          if (keyCounter < 0 || fftTimer === null) {
            fftTimer = requestAnimationFrame(fftLoop);
          }
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




export async function getContext() {
  if (ctx && postAmp) return ctx;

  ctx = ctx || new AudioContext();
  if (ctx.state === "paused") ctx.resume();

  masterGain = masterGain || new GainNode(ctx, { gain: 1 });
  const sounds = await initAudioSources(ctx, masterGain, _settings);

  Object.keys(sounds).map(functionName => {
    instruments[functionName] = sounds[functionName];
  })


  passthrough = await require("./load-processor").loadProcessor(ctx, "pass-through");
  compressor = new DynamicsCompressorNode(ctx, {
    threshold: _settings.compression.threshold,
    radio: 4,
  });
  analyser = new AnalyserNode(ctx, { fftSize: 256, smoothingTimeConstant: 0.1 });
  preAmp = new GainNode(ctx, { gain: 1 });
  postAmp = new GainNode(ctx, { gain: 1 });
  masterGain
    .connect(preAmp)
    .connect(compressor)
    .connect(postAmp)
    .connect(analyser)
    // .connect(passthrough)
    .connect(ctx.destination);

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
