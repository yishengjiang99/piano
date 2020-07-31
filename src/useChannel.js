import { useState, useRef, useEffect, useCallback, useReducer } from "react";
var cursor = 0;
export function useChannel(name, size = 5) {
  const [messageState, dispatch] = useReducer(
    (prevState, data) => {
      const newMsg = data;
      const list = prevState.messages || new Array(size);
      return {
        lastMessage: newMsg,
        messages: list,
      };
    },
    {
      lastMessage: null,
      messages: new Array(size),
    }
  );

  let channel = useRef(new BroadcastChannel(name));
  function postMessage(msg) {
    channel.current.postMessage(msg);
  }

  useEffect(() => {
    channel.current.onmessage = function ({ data }) {
      dispatch(data);
    };
    return function cleanup() {
      channel.current && channel.current.close();
      channel = null;
    };
  }, [name]);
  return [messageState, postMessage];
}
