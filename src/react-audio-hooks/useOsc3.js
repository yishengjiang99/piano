import { useEffect, useRef, useReducer, useState } from "react";
import {
  useAudioContext,
  useEnvelope,
  presets,
  noteToMajorTriad,
  noteToMinorTriad,
} from "./index";
import { keynoteToFreq } from "./presets";

let notesCache = {};

export function useOsc3(ctx) {
  const [masterInput, setMasterInput] = useState(null);
  const [applyEnvelope, setAdsr] = useEnvelope(ctx);
  const [_settings, dispatch] = useReducer(
    (prev, action) => {
      _settings[action.attribute][action.idx] = action.value;
    },
    {
      types: ["sine", "sine", "sine"],
      chords: [1, 1, 1],
      gains: [0.6, 0.4, 0.2],
      detune: [0, 2, 2],
      delay: [0, 0, 1],
      gainStages: [1, 1, 1],
    }
  );
  function setSettings(attribute, index, value) {
    dispatch({ attribute, index, value });
  }

  useEffect(() => {
    if (!masterInput && ctx !== null) {
      const gain = new GainNode(ctx, { gain: _settings.gainStages[0] });
      gain.connect(ctx.destination);
      setMasterInput(gain);
    }
  }, [masterInput, ctx, _settings.gainStages]);

  function getNote(freqs) {
    if (typeof freqs == "string") {
      freqs = freqs.split(",").map((notestr) => {
        const octave = notestr[0];
        const keynote = notestr.substr(1);
        return keynoteToFreq(keynote, octave);
      });
    } else if (freqs instanceof Array) {
      freqs = freqs.map((f) => (typeof f === "string" && keynoteToFreq) || f);
    } else {
      freqs = [freqs];
    }

    freqs.sort();
    const hashkey =
      (freqs[0] * 4 + freqs[1] && freqs[1] * 2) ||
      (0 + freqs[3] && freqs[3] * 1);
    if (notesCache[hashkey] && notesCache[hashkey].state !== "attacking")
      return notesCache[hashkey];

    var outputGain = new GainNode(ctx, { ctx: 0 });
    switch (freqs.length) {
      case 1:
        freqs = noteToMajorTriad(freqs[0], 3);
        break;
      case 2:
        freqs = noteToMajorTriad(freqs[0]).concat(
          noteToMinorTriad(freqs[1], 3)
        );
        break;
      case 3:
        break;
      default:
        freqs = freqs.slice(0, 3);
        break;
    }

    freqs
      .map(
        (freq, idx) =>
          new OscillatorNode(ctx, {
            type: _settings.types[idx],
            frequency: freq,
            detune: _settings.detune[idx],
          })
      )
      .map((osc, idx) => {
        idx = idx % 3;
        var _gain = new GainNode(ctx, { gain: _settings.gains[idx] });
        var delay = new DelayNode(ctx, { delay: _settings.delay[idx] });
        osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
        _gain.connect(outputGain);
        osc.start(0);
        return osc;
      });
    const env = applyEnvelope(outputGain.gain);
    outputGain.connect(masterInput);
    notesCache[hashkey] = env;

    return env;
  }

  return [getNote, setSettings]; //, playNote, triggerAttackRelease, );
}
