import { useEffect, setAudioContext, useState, useRef, useReducer } from "react";
import { useAudioContext } from "./AudioContextExt";
import { EQ_PRESETS, initialState } from "./presets.js";
const presets = EQ_PRESETS;
export const useEQ = (ctx) => {
  const [processor, setProcessor] = useState({
    script: null,
    state: { inputSPL: null, outputSPL: null },
  });

  useEffect(() => {
    if (!processor) {
      ctx.audioContext
        .addModule("./winam-eq.js")
        .then((_) => {
          setProcessor(new AudioWorkletNode(ctx, "band_pass_lfc"));
        })
        .catch((e) => console.error(e));
    }

    return function cleanup() {
      processor = null;
    };
  }, []);

  useEffect(() => {
    if (processor) {
      processor.onmessage = (e) => {
        if (e.data.gainupdates_processed) {
          e.data.gainupdates_processed.forEach((gain, index) => {});
        }
        if (e.data.spl_in) {
          processor.setState({ spl_in: e.data.spl_in });
        }
        if (e.data.spl_out) {
          processor.setState({ spl_out: e.data.spl_out });
        }
      };
    }
  }, [processor]);

  const [settings, dispatch] = useReducer((prevstate, { type, payload }) => {
    if (type == "change") {
      const { index, value } = payload;
      processor.port.postMessage({ gainUpdate: { index, value } });
    } else if (type == "preset") {
      const presetName = payload;
      const values = EQ_PRESETS[payload].gains;
      processor.port.postMessage({ gainUpdates: EQ_PRESETS[payload].gains });
    }
  }, EQ_PRESETS.default);

  function updateEq(index, value) {
    dispatch("update", { index, value });
  }

  function usePreset(presetName) {
    if (!presets[presetName]) return false;
    dispatch("preset", presetName);
  }

  return [processor, updateEq, usePreset];
};
