import { useEffect, useRef, useReducer, useState } from "react";

export const useReverb = (ctx) => {
  const [reverb, setReverb] = useState(null);
  const [options, setOptions] = useState({});
  useEffect(() => {
    if (!reverb) {
      ctx.audioContext
        .addModule("./reverb")
        .then((_) => {
          setReverb(new AudioWorkletNode(ctx, "DattorroReverb", options));
        })
        .catch((e) => console.error(e));
    }
  }, [ctx, options, reverb]);

  function setParameter(param, value) {
    reverb.parameters.setValueAtTime(value, 0);
  }
  return [reverb, setParameter];
};
