import { useEffect, useState, useRef, useReducer } from "react";
import { EQ_PRESETS } from "./presets.js";
const initialState = EQ_PRESETS["conversation"];
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
  }, EQ_PRESETS["conversation"]);

  function updateEq(inddex, value) {
    dispatch("update", { inddex, value });
  }

  function usePreset(presetName) {
    if (!EQ_PRESETS[presetName]) return false;
    dispatch("preset", EQ_PRESETS[presetName]);
  }

  return [processor, updateEq, usePreset];
};
