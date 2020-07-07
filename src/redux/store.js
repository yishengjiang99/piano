import React, { useContext, useReducer } from "react";
import constants from "../constants.js";

export const actions = {
  NEW_NOTE: 1,
  DELETE_NOTE: 2,
  UPDATE_SEEK: 3,
  UPDATE_SETTINGS: 4,
  UPDATE_OCTAVE: 5,
  SYNC_BACKEND: 6,
};
let _dispatch;

export const createActor = (type, payload) => {
  return _dispatch({ type, payload });
};
export const initialState = {
  upstreamSync: null,
  tracks: {},
  trackLength: 1,
  events: [],
  seek: 0,
  octave: 3,
  tmpBuffer: [],
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
      return {
        tracks: _tracks,
        trackLength: Math.max(state.trackLength, note.bar),
      };
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
    case action.SYNC_BACKEND:
      let _upstreamSync = state.upstreamSync;

      try {
        const newEvent = action.payload;
        _upstreamSync.send(newEvent);
        _upstreamSync.send("commit");
      } catch (e) {
        alert(e.message);
      }
      return {
        upstreamSync: _upstreamSync,
        tmpBuffer: [],
      };
      break;
    default:
      return state;
  }
}
