import React, { useContext, useReducer } from "react";

export const actions = {
  NEW_NOTE: 1,
  DELETE_NOTE: 2,
  UPDATE_SEEK: 3,
};
export const initialState = {
  tracks: {},
  events: [],
  seek: 0,
  octave: 3,
  settings: {
    osc3: ["triangle", "sine", "sine"],
    chords: [1, 2, 4],
    gains: [1, 0.4, 0.5],
    adsr: [0.02, 0.2, 0.8, 0.3],
    detune: [0, 2, 2],
    delay: [0, 0, 1],
    lpf: 1600,
    hpf: 70,
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
  switch (action.type) {
    case actions.NEW_NOTE:
      let note = action.payload;
      if (!_tracks[note.bar]) {
        _tracks[note.bar] = [];
      }
      _tracks[note.bar][note.index] = note;
      return { tracks: _tracks };
      break;
    case actions.DELETE_NOTE:
      if (!_tracks[note.bar] || _tracks[note.bar][note.index])
        throw new Error("attempt to delete key not exist");
      _tracks[note.bar][note.index] = null;
      return state;
    case actions.UPDATE_SEEK:
      return {
        seek: action.payload,
      };
    default:
      return state;
  }
}
