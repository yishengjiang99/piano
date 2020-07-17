<<<<<<< HEAD:src/processors/useReverb.js
import { useState, useEffect } from "react";
export const useReverb = (ctx, options) => {
  const [reverb, setReverb] = useState(null);
=======
import { useEffect, useRef, useReducer, useState } from "react";

export const useReverb = (ctx) => {
  const [reverb, setReverb] = useState(null);
  const [options, setOptions] = useState({});
>>>>>>> b6ba5d72658e9e6a90e0a675fbe4074de8f260d2:src/react-audio-hooks/useReverb.js
  useEffect(() => {
    if (!reverb) {
      ctx.audioContext
        .addModule("./reverb")
        .then((_) => {
          setReverb(new AudioWorkletNode(ctx, "DattorroReverb", options));
        })
        .catch((e) => console.error(e));
    }
<<<<<<< HEAD:src/processors/useReverb.js
    return function cleanup() {
      //reverb = null;
    };
  }, []);
=======
  }, [ctx, options, reverb]);
>>>>>>> b6ba5d72658e9e6a90e0a675fbe4074de8f260d2:src/react-audio-hooks/useReverb.js

  function setParameter(param, value) {
    reverb.parameters.setValueAtTime(value, 0);
  }
  return [reverb, setParameter];
};
