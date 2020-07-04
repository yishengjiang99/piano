import { noteToMajorTriad, noteToMinorTriad, melody } from "./sound-keys.js";
// import { split_band } from "https://dsp.grepawk.com/splitband.js";
// // import { DrawEQ } from "https://dsp.grepawk.com/lib/draw.js";
import { useState, useEffect, createRef } from "react";
import React from "react";
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
  osc3: ["triangle", "sine", "sine"],
  chords: [1, 2, 4],
  gains: [1, 0.4, 0.5],
  adsr: [0.02, 0.2, 0.8, 0.3],
  detune: [0, 2, 2],
  delay: [0, 0, 1],
  lpf: 1600,
  hpf: 70,
};
let ctx;
let masterGain, analyserNode, LPF, HPF, LSF, HSF, Peak1, Peak2, Peak3, Peak4;
let dynamicsCompression, postGain, scriptProcessor;

export function updateSettings(newsetts) {
  _settings = newsetts;
}

export function getContext() {
  ctx = ctx || new AudioContext();
  masterGain = masterGain || new GainNode(ctx, { gain: 1 });
  if (ctx.state === "paused") ctx.resume();
  scriptProcessor = ctx.createScriptProcessor(1024, 2, 2);

  dynamicsCompression = new DynamicsCompressorNode(ctx, { threshold: -4, ratio: 5 });
  postGain = new GainNode(ctx, { gain: 1 });
  analyserNode = new AnalyserNode(ctx);

  masterGain
    .connect(dynamicsCompression)
    // .connect(analyserNode)
    // .connect(scriptProcessor)
    .connect(ctx.destination);
  return {
    ctx,
    masterGain,
    dynamicsCompression,
    postGain,
    analyserNode,
    scriptProcessor,
  };
}

export const TagView = (props) => {
  const { ctx, analyserNode, scriptProcessor } = getContext();

  scriptProcessor.onaudioprocess = (e) => {
    // The output buffer contains the samples that will be modified and played
    var inputBuffer = e.inputBuffer;

    var outputBuffer = e.outputBuffer;
    var buffer = [];
    var cnt = {};
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);

      // Loop through the 4096 samples
      for (var sample = 0; sample < inputBuffer.length; sample++) {
        // make output equal to the same as the input
        outputData[sample] = inputData[sample];
        if (sample == 0) continue;
        cnt[sample / 30] = cnt[sample / 30] || 0;
        cnt[sample / 30]++;
      }
    }
    requestAnimationFrame(function () {
      setRawSample(cnt);
    });
  };
  const [rawSample, setRawSample] = useState(null);
  const [fftArray, setFftArray] = useState(new Uint8Array(props.fftSize));
  const [timeArray, setTimeArray] = useState(new Uint8Array(props.fftSize));

  const canvasRef = createRef();
  const hudRef = createRef();

  const arrSum = (arr) => arr.map((d) => arrSum + d).reduce((arrSum = 0));

  useEffect(() => {}, [fftArray, timeArray]);
  const _canvasClick = (e) => {
    console.log("canvs");
  };
  useEffect(() => {
    let ctxx = canvasRef.current.getContext("2d");
    for (const k in rawSample) {
    }
  }, [rawSample]);
  return (
    <div
      style={{
        height: 720,
        width: 1500,
        backgroundColor: "light-gray",
        position: "relative",
        height: 400,
        width: 480,
      }}
    >
      {JSON.stringify(rawSample)};
      <canvas style={{ position: "absolute" }} ref={canvasRef} onClick={(e) => {}}></canvas>
      <canvas style={{ position: "absolute" }} ref={hudRef} onClick={(e) => {}}></canvas>
    </div>
  );
};

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
  var chords = _settings.chords.map((c) => notefreq);

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
