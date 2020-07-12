import React, { useContext, useReducer } from "react";
import constants from "../constants.js";

export const actions = {
  NEW_NOTE: 1,
  DELETE_NOTE: 2,
  UPDATE_SEEK: 3,
  UPDATE_SETTINGS: 4,
  UPDATE_OCTAVE: 5,
  SYNC_BACKEND: 6,
  NOW_PLAYING: 7,
  SYNC_KEYBOARD: 8,
};

// export const createActor = (type, payload) => {
//   return _dispatch({ type, payload });
// };
export const initialState = {
  ws: null,
  tracks: [],
  trackLength: 1,
  events: [],
  seek: -1,
  files: [],
  octave: 3,
  tmpBuffer: [],
  settings: {
    osc3: {
      types: ["sine", "sine", "sine"],
      chords: [1, 1, 1],
      gains: [0.6, 0.4, 0.2],
      detune: [0, 2, 2],
      delay: [0, 0, 1],
    },
    compression: {
      threshold: -80,
      ratio: 12,
    },
    gainStages: {
      mixer: 1,
      preamp: 1,
      post_compression: 1,
    },
    filters: {
      lpf: { frequency: 1600, Q: 2, gain: 1 },
      hpf: { frequency: 54, Q: 2, gain: 1 },
      bandpass: [[50, 1, 1][(100, 1, 1)], [200, 1, 1], [300, 1, 1], [400, 1, 1]],
    },
  },
};
export const TheContext = React.createContext();
export const ContextProvider = TheContext.Provider;

export function connect(mapStateToProps, mapDispatchToProps) {
  return function (Component) {
    return function (p) {
      const { state, dispatch } = useContext(TheContext);
      const stateToProps = mapStateToProps(state);
      const dispatchToProps = mapDispatchToProps(dispatch);
      const props = { ...p, ...stateToProps, ...dispatchToProps };

      return <Component {...props} />;
    };
  };
}
export function reducer(state, action) {
  let _tracks = state.tracks;
  if (typeof action.type === "unknown") {
    alert("sss");
  }

  switch (action.type) {
    case actions.NEW_NOTE:
      let note = action.payload;
      return {
        tracks: [...state.tracks, note],
        trackLength: Math.max(state.trackLength, note.bar),
      };
      break;
    case actions.DELETE_NOTE:
      _tracks[action.barIndex][action.noteIndex] = null;
      return state;
      break;
    case actions.UPDATE_SEEK:
      return {
        seek: action.payload,
      };
      break;
    case action.SYNC_BACKEND:
      return state;
      break;
    case action.SYNC_KEYBOARD:
      break;
    default:
      return state;
  }
}
