import React from "react";
import ReactDOM from "react-dom";
import { IndexPage } from "./App";
import * as serviceWorker from "./serviceWorker";
ReactDOM.render(<IndexPage />, document.getElementById("root"));

const channel = new BroadcastChannel("useEvent");

function setLatestUserEvent(e: Event) {
  channel.postMessage({ type: e.type, time: e.timeStamp });
}
window.addEventListener("keydown", setLatestUserEvent);
window.addEventListener("keypress", setLatestUserEvent);
window.addEventListener("keyup", setLatestUserEvent);
window.addEventListener("mousedown", setLatestUserEvent);
window.addEventListener("mouseup", setLatestUserEvent);

serviceWorker.register();
