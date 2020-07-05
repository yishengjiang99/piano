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
