import React from "react";
import ReactDOM from "react-dom";
import { IndexPage } from "./App";
import * as serviceWorker from "./serviceWorker";
import { ContextProvider, initialState, reducer } from "./redux/store.js";
import { useReducer } from "react";

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <ContextProvider value={{ state, dispatch }}>
      <React.StrictMode>
        <IndexPage />
      </React.StrictMode>
    </ContextProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

// window.redux = function () {
//   var track = "";
//   function addNote(note) {
//     this.track += "\n#" + note.frequnency + "@" + note.bar + "## " + JSON.stringify(note);
//   }
//   function remoteNote(thenote) {
//     track.replace(thenote.frequency);
//   }
//   function listNotes() {
//     return track.split("\n").map((str) => str.split("## ")[1]);
//   }

//   return {
//     track,
//     addNote,
//     removeNote,
//     listNotes,
//   };
// };
// // const store = new Proxy(window.reduxStorage, function get(target, attribute) {
// //   if (store[attribute]) {
// //     return target[attribute];
// //   }
// // });
