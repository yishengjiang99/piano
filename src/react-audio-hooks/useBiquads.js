import { useState, useEffect, useRef, useReducer } from "react";
<<<<<<< HEAD:src/processors/useBiquads.js
import { useAudioContext } from "./index";

=======
import { useAudioContext } from "./";
>>>>>>> b6ba5d72658e9e6a90e0a675fbe4074de8f260d2:src/react-audio-hooks/useBiquads.js
export const useBiquads = (preset = null) => {
  const [ctx, addToChain, inputCursor] = useAudioContext();

  const initialState = {
    refs: [],
    checksum: 0,
  };
<<<<<<< HEAD:src/processors/useBiquads.js
  const referenceArray = useRef();
=======
  const filters = [];

>>>>>>> b6ba5d72658e9e6a90e0a675fbe4074de8f260d2:src/react-audio-hooks/useBiquads.js
  const [filterChain, dispatch] = useReducer((state, action) => {
    if (action.type == "add" && action.params) {
      const filter = new BiquadFilterNode(ctx, action.params);
      addToChain(filter);
      filters.push(filter);
    }
    if (action.type == "edit") {
      if (!action.index || !action.attribute || !action.value)
        throw "index is required";
      filters[action.index][action.attribute].setValueAtTime(
        action.value,
        ctx.currentTime
      );
    }
    return {
      refs: filters,
      checksum: filters
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
