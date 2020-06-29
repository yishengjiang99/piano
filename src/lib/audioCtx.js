import { useState, useRef, useEffect, useContext, createContext } from "react";

function Envelope(adsr, audioParam) {
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

class AudioCtx {
  static get ctx() {
    return this._ctx;
  }
  static get settings() {
    return this._settings;
  }

  constructor() {
    this._ctx = new AudioContext();
    this.masterGain = new GainNode(this._ctx);
    this.masterGain.connect(this._ctx.destination);
    this.adsr = [0.1, 0.1, 0.7, 0.5];
    this._settings = {
      osc3: ["sine", "sine", "sine"],
      chords: [1, 2, 4],
      gains: [1, 0.25, 0.1],
    };
  }
  getNote(notefreq, octave = 3) {
    const freqmultiplierindex = [0, 0.25, 0.5, 1, 2, 4];

    const baseFreq = notefreq * freqmultiplierindex * octave;
    const outputGain = new GainNode(ctx, { gain: 0 });
    this._oscs = [0, 1, 2]
      .map(
        (idx) =>
          new OscillatorNode(ctx, {
            type: this._settings.osc3[idx],
            frequency: this._settings.chords[idx] * baseFreq,
          })
      )
      .map((osc, idx) => {
        var _gain = new GainNode(ctx, { gain: this._settings.gains[idx] });
        osc.connect(_gain); //new GainNode(ctx, { gain: this._settings.gains[idx] }))
        _gain.connect(outputGain);
        osc.start(0);
      });
    outputGain.connect(this.masterGain);
    var gainEnvelope = new Envelope(this.adsr, outputGain.gain);
    return gainEnvelope;
  }
}

let ctx;
const getAudioContext = () => {
  if (ctx) return ctx;
  ctx = new AudioCtx();
  return ctx;
};

export default getAudioContext;
