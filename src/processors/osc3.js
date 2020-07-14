import { useEffect, useRef, useReducer } from "react";
import { useAudioContext } from "./AudioContextExt";
import { useOsc3 } from "./useOsc3";

let noteCache = {};

export function useOsc3() {
  const [ctx, addToChain, addInput] = useAudioContext();
  const [applyEnvelope, setAdsr, triggerAttackRelease, scheduleAttackRelease] = useEnvelope();
  const [_settings, setSettings] = useState({
    types: ["sine", "sine", "sine"],
    chords: [1, 1, 1],
    gains: [0.6, 0.4, 0.2],
    detune: [0, 2, 2],
    delay: [0, 0, 1],
  });
  let noteCache = {};
  function getNote(notefreq) {
    if (noteCache[notefreq] && noteCache[notefreq].state !== "attacking")
      return noteCache[notefreq];
    const chords = noteToMajorTriad(notefreq);
    let outputGain = new GainNode(ctx, { gain: 1 });
    const freq = notefreq;
    var oscs = chords
      .map((notefreq, idx) => {
        console.log(notefreq);
        return new OscillatorNode(ctx, {
          type: _settings.types[idx],
          frequency: notefreq,
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
    return applyEnvelope(outputGain);
  }
  function playNote(freq) {
    getNote(freq).triggerAttackRelease();
  }
  function playNoteAt(freq, secondsLater) {
    getNote(freq).scheduleAttackRelease(ctx.currentTime + secondsLater);
  }
  return [getNote, playNote, setSettings]; //, playNote, triggerAttackRelease, );
}
