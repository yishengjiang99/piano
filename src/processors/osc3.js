import { useState, useEffect, useRef } from "react";
import { useEnvelope } from "./index";
import { noteToMajorTriad, noteToMinorTriad } from "./presets";

export function useOsc3([ctx, setCtx, addFilter, connectInput]) {
  const [volumeOut, setVolumeOut] = useState(null);
  const [applyEnvelope] = useEnvelope();
  const [_settings, updateSettings] = useState({
    types: ["sine", "sine", "sine"],
    chords: [1, 1, 1],
    gains: [0.6, 0.4, 0.2],
    detune: [0, 2, 2],
    delay: [0, 0, 1],
  });
  useEffect(() => {
    if (ctx !== null) {
      setVolumeOut(new GainNode(ctx, { gain: 1 }));
    }
  }, [ctx]);
  useEffect(() => {
    if (volumeOut && ctx) connectInput(volumeOut);
  }, [connectInput, ctx, volumeOut]);

  let noteCache = {};

  function getNote(freqs) {
    const _ctx = ctx || new AudioContext();

    freqs.sort();
    const hashkey = (freqs[0] * 4 + freqs[1] && freqs[1] * 2) || (0 + freqs[3] && freqs[3] * 1);
    if (noteCache[hashkey] && noteCache[hashkey].state !== "attacking") return noteCache[hashkey];
    const outputGain = new GainNode(_ctx, { gain: 0 });
    let chords;
    switch (freqs.length) {
      case 1:
        chords = noteToMajorTriad(freqs[0]);
        break;
      case 2:
        chords = noteToMajorTriad(freqs[0]).concat(noteToMinorTriad(freqs[1]));
        break;
      case 3:
        chords = freqs;
        break;
      default:
        chords = freqs.slice(0, 3);
        break;
    }

    chords
      .map((notefreq, idx) => {
        return new OscillatorNode(_ctx, {
          type: _settings.types[idx],
          frequency: notefreq,
          detune: _settings.detune[idx],
        });
      })
      .map((osc, idx) => {
        idx = idx % 3;
        var _gain = new GainNode(_ctx, { gain: _settings.gains[idx] });
        var delay = new DelayNode(_ctx, { delay: _settings.delay[idx] });
        osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
        _gain.connect(outputGain);
        osc.start(0);
        return osc;
      });
    outputGain.connect(volumeOut);
    return applyEnvelope(outputGain.gain);
  }

  return [getNote, updateSettings]; //, playNote, triggerAttackRelease, );
}
