import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { IndexPage } from "./App";
import * as serviceWorker from "./serviceWorker";

function App() {
  const [latestUserEvent, setLatestUserEvent] = useState(null);
  useEffect(() => {
    window.addEventListener("keydown", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("keypress", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("keyup", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("mouse", (e) => setLatestUserEvent(e), { capture: true });
    window.addEventListener("mouseup", (e) => setLatestUserEvent(e), { capture: true });
  }, []);

  return ReactDOM.createPortal(
    <IndexPage windowUserEvent={latestUserEvent} />,
    document.getElementsByTagName("body")[0]
  );
}
ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();

// audioWorker.register();
