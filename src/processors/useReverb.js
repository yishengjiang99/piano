import { useState, useEffect } from "react";
export const useReverb = (ctx, options) => {
  const [reverb, setReverb] = useState(null);
  useEffect(() => {
    if (!reverb) {
      ctx.audioContext
        .addModule("./reverb")
        .then((_) => {
          setReverb(new AudioWorkletNode(ctx, "DattorroReverb", options));
        })
        .catch((e) => console.error(e));
    }
    return function cleanup() {
      //reverb = null;
    };
  }, []);

  function setParameter(param, value) {
    reverb.parameters.setValueAtTime(value, 0);
  }
  return [reverb, setParameter];
};
