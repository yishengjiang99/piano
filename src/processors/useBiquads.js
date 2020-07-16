import { useState, useEffect, useRef, useReducer } from "react";
import { useAudioContext } from "./index";

export const useBiquads = (preset = null) => {
  const [ctx, addToChain, inputCursor] = useAudioContext();

  const initialState = {
    refs: [],
    checksum: 0,
  };
  const referenceArray = useRef();
  const [filterChain, dispatch] = useReducer((state, action) => {
    if (action.type == "add" && action.params) {
      const filter = new BiquadFilterNode(ctx, action.params);
      addToChain(filter);
      referenceArray.push(filter);
    }
    if (action.type == "edit") {
      if (!action.index || !action.attribute || !action.value) throw "index is required";
      referenceArray[action.index][action.attribute].setValueAtTime(action.value, ctx.currentTime);
    }
    return {
      refs: referenceArray,
      checksum: referenceArray
        .map((ref) => ref.current.parameters)
        .reduce((sum, parameter, idx) => {
          sum += parameter.value << idx;
        }, 0),
    };
  }, initialState);

  function addFilter(frequency, type, Q, gain) {
    dispatch({ type: "add", params: { frequency, type, Q, gain } });
  }
  function editFilter(idx, attribute, value) {
    dispatch({ type: "edit", ...{ idx, attribute, value } });
  }

  return [filterChain, addFilter, editFilter];
};
