import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { IndexPage } from "./App";
import * as serviceWorker from "./serviceWorker";
import { audioPath } from './audioCtx';
import { setContext, MembraneSynth } from 'tone';
// import { MembraneSynth } from 'tone/Tone/instrument';

function App() {
  const [latestUserEvent, setLatestUserEvent] = useState(null);
  useEffect(() => {
    window.addEventListener("keydown", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("keypress", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("keyup", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("mousedown", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("mouseup", (e) => setLatestUserEvent(e), { capture: true });
  }, []);

  return ReactDOM.createPortal(
    <IndexPage windowUserEvent={latestUserEvent} />,
    document.getElementsByTagName("body")[0]
  );
}
ReactDOM.render(<App />, document.getElementById("root"));

window.addEventListener("audioCtxGot", function ({ detail }) {
  const { ctx, masterGain, analyser } = detail;
  setContext(ctx);
  const drums = new MembraneSynth()
  drums.toDestination();
  var beat = 0;
  window.addEventListener("keydown", function () {
    drums.triggerAttackRelease(beat++ % 4 === 0 ? "2C" : '3C', "8n");
    beat++;
  })
}, { once: true })

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

// audioWorker.register();
