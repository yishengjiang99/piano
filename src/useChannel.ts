const { BroadcastChannel } = require("broadcast-channel");

import { useRef, useEffect, createContext, useReducer } from "react";
export type MsgState<T = {}> = {
  lastMessage: T | null;
  messages: T[];
};
function reducer<T>(prevState: MsgState<T>, data: T): MsgState<T> {
  prevState.lastMessage = data;
  prevState.messages.push(data);
  prevState.messages.shift();
  return prevState;
}
type R<T> = (prevState: MsgState<T>, msg: T) => MsgState<T>;

export function useChannel<T = {}>(name: string): [MsgState<T>, (msg: T) => void] {
  const [messageState, dispatch] = useReducer<R<T>>(reducer, {
    lastMessage: null,
    messages: [],
  });

  let channel = useRef(new BroadcastChannel(name));
  function postMessage(msg: T) {
    channel.current.postMessage(msg);
  }

  useEffect(() => {
    channel.current.onmessage = function (e: MessageEvent) {
      dispatch(e.data);
    };
    return function cleanup() {
      channel.current && channel.current.close();
    };
  }, [name]);
  return [messageState, postMessage];
}
const CounterStepContext = createContext(1);

export const useChannelContext = () => {};
