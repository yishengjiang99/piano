import React, { useContext, useReducer } from "react";

export const actions = {
  NEW_NOTE: 1,
  DELETE_NOTE: 2,
  UPDATE_SEEK: 3,
  UPDATE_SETTINGS: 4,
  UPDATE_OCTAVE: 5,
};
let _dispatch;
export const createActor = (type, payload) => {
  return _dispatch({ type, payload });
};
export const initialState = {
  tracks: {},
  trackLength: 1,
  events: [],
  seek: 0,
  octave: 3,
  settings: {
    osc3: {
      waveForms: ["triangle", "sine", "sine"],
      chords: [1, 2, 4],
      gains: [1, 0.4, 0.5],
      detune: [0, 2, 2],
      delay: [0, 0, 1],
    },
    LFOs: [
      {
        amp: { depth: 0, frequency: 0 },
      },
      {
        lpf: { depth: 0, frequency: 40 },
      },
    ],
    adsr: [0.02, 0.2, 0.8, 0.3],
    filters: {
      LPF: 50,
      HPF: 1500,
      bandPass: [
        { frequency: 100, Q: 1, gain: 1 },
        { frequency: 200, Q: 1, gain: 1 },
        { frequency: 300, Q: 1, gain: 1 },
        { frequency: 400, Q: 1, gain: 1 },
        { frequency: 600, Q: 1, gain: 1 },
        { frequency: 800, Q: 1, gain: 1 },
      ],
    },
    gainStages: {
      mixMaster: 1,
      preAmp: 1,
      postCompression: 1,
    },
    compression: {
      threshold: -10,
      ratio: 6,
      velocity: 3,
    },
    noiseGate: {
      threshold: -80,
      tau: 2,
    },
  },
};
export const TheContext = React.createContext();
export const ContextProvider = TheContext.Provider;

export function connect(mapStateToProps, mapDispatchToProps) {
  return function (Component) {
    return function (p) {
      const { state, dispatch } = useContext(TheContext);
      _dispatch = dispatch;
      const stateToProps = mapStateToProps(state);
      const dispatchToProps = mapDispatchToProps(dispatch);
      const props = { ...p, ...stateToProps, ...dispatchToProps };

      return <Component {...props} />;
    };
  };
}
export function reducer(state, action) {
  let _tracks = state.tracks;
  switch (action.type) {
    case actions.NEW_NOTE:
      let note = action.payload;
      if (!_tracks[note.bar]) {
        _tracks[note.bar] = [];
      }
      _tracks[note.bar][note.index] = note;
      return { tracks: _tracks, trackLength: Math.max(state.trackLength, note.bar) };
      break;
    case actions.DELETE_NOTE:
      if (!_tracks[note.bar] || _tracks[note.bar][note.index])
        throw new Error("attempt to delete key not exist");
      _tracks[note.bar][note.index] = null;
      return state;
      break;
    case actions.UPDATE_SEEK:
      return {
        seek: action.payload || 0,
      };
      break;
    case "update_octave":
      if (action.value > 6 || action.value < 1) {
        return state;
      }
      return {
        octave: action.value,
      };
    default:
      if (action.type.startsWith("update_")) {
      }
      return state;
  }
}
export const state = ContextProvider.value;
