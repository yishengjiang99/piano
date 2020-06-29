import { useState, useRef, useEffect, useContext, createContext } from "react";

export function Envelope(adsr, audioParam) {
  const [attack, decay, sustain, release] = adsr;
  const trigger = () => {
    const time = ctx.currentTime;
    audioParam.setValueCurveAtTime([0, 1.0], ctx.currentTime, attack);
    audioParam.setValueCurveAtTime(
      [1.0, sustain * 1.0],
      ctx.currentTime + attack,
      decay
    );
    audioParam.setTargetAtTime(
      0.0000001,
      ctx.currentTime + attack + decay,
      release
    );
  };
  const triggerRelease = () => {
    const time = ctx.currentTime;
    audioParam.setTargetAtTime(0.0000001, ctx.currentTime, release);
  };
  const hold = () => {
    audioParam.linearRampToValueAtTime(sustain * 1.0, ctx.currentTime + decay);
  };
  return {
    trigger,
    triggerRelease,
    hold,
  };
}
let _settings = {
  osc3: ["sine", "sine", "sine"],
  chords: [1, 2, 4],
  gains: [1, 0.25, 0.1],
};
let ctx;
let masterGain;

export function updateSettings(newsetts) {
  _settings = newsetts;
}

export function getContext() {
  ctx = ctx || new AudioContext();
  if (ctx.state === "paused") ctx.resume();
  masterGain = masterGain || new GainNode(ctx, { gain: 1 });
  masterGain.connect(ctx.destination);
  return ctx;
}

export function getNote(notefreq, octave = 3) {
  ctx = ctx || new AudioContext();
  const freqmultiplierindex = [0, 0.25, 0.5, 1, 2, 4];
  const baseFreq = notefreq * freqmultiplierindex * octave;
  if (notefreq <= 0 || isNaN(notefreq)) {
    alert(notefreq);
  }
  const outputGain = new GainNode(ctx, { gain: 0 });
  var chord = 
  var _oscs = [0, 1, 2]
    .map(
      (idx) =>
        new OscillatorNode(ctx, {
          type: _settings.osc3[idx],
          frequency: _settings.chords[idx] * baseFreq,
        })
    )
    .map((osc, idx) => {
      var _gain = new GainNode(ctx, { gain: _settings.gains[idx] });
      osc.connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
      _gain.connect(outputGain);
      osc.start(0);
    });
  outputGain.connect(this.masterGain);
  var gainEnvelope = new Envelope(this.adsr, outputGain.gain);
  return gainEnvelope;
}
