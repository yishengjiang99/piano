import React from "react";
import ReactDOM from "react-dom";
import { IndexPage } from "./App";
import * as serviceWorker from "./serviceWorker";
import { createStore } from "redux";

import { Provider } from "react-redux";
const initialState = {
  tracks: {},
  userEvents: [],
  settings: {},
};
const store = createStore(function (state = initialState, action) {
  switch (action.type) {
    case "keyup":
    case "keypress":
    case "keydown":
      return state.userEvents.concat({
        time: action.time,
        noteIndex: action.index,
        freq: action.freq,
      });
    case "notePlayed":
      return state.tracks[action.bar].concat(action.note);
    case "change_setting":
      return (state.settings = { ...state.settings, ...action.change });
    case "delete":
      delete state.tracks[action.bar][action.note.noteIndex];
      return;
  }
});
ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <IndexPage />
    </React.StrictMode>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

window.redux = function () {
  window.reduxStorage = window.reduxStorage || {
    track: {},
    trackLength: 0,
    settings: {},
  };
  let store = window.reduxStorage;
  return {
    store: window.reduxStorage,
    addNoteToTrack: (note) => {
      const _track = window.reduxStorage.track;
      if (!_track[note.bar]) _track[note.bar] = {};
      _track[note.bar][note.index] = note;
      store.track = _track; // { track: _track });
      if (note.bar > store.trackLength) store.trackLength = note.bar;
    },
    getStoragedValue: (key) => {
      return window.reduxStorage[key];
    },
    getTrack: () => [store.track, store.trackLength],
    mapDispatchToProps: () => alert("fuck off"),
  };
};
