<<<<<<< HEAD
import {useRef, useEffect, useCallback, useReducer} from "react";
export function useChannel(name, size = 5) {
  const [messageState, dispatch] = useReducer(
    (state, data) => {
      state.lastMessage = data;
      state.messages[state.cursor % size] = data;
      state.cursor++;
      return state;
    },
    {
      lastMessage: null,
      messages: new Array(size).fill(),
      cursor: 0
=======
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
>>>>>>> master
    }
  );

  let channel = useRef(new BroadcastChannel(name));
  function postMessage(msg) {
    channel.current.postMessage(msg);
  }

  useEffect(() => {


    channel.current.onmessage = function ({data}) {
      dispatch(data);
    };
    return function cleanup() {
      channel.current && channel.current.close();
      channel = null;
    };
  }, [name]);
  return [{
    lastMessage: messageState.lastMessage,
    messages: messageState.cursor > size ? messageState.messages.slice(0, messageState.cursor % size - 1)
      .concat(["*" + messageState.messages[messageState.cursor % size - 1]])
      .concat(messageState.messages.slice(messageState.cursor % size - 1)) : messageState.messages.slice(0, messageState.cursor + 1)
  }, postMessage];
}
