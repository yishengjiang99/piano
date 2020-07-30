import React from "react";
import ReactDOM from "react-dom";
import { IndexPage } from "./App";
import * as serviceWorker from "./serviceWorker";
import LeftNav from "./left-nav";
function App() {
  return <IndexPage />;
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
