import { useRef, useEffect, useCallback, useReducer } from "react";
export type MsgState = {
  lastMessage: string;
  messages: string[];
};
const initialState: MsgState = {
  lastMessage: "",
  messages: new Array(12).fill(""),
};
function reducer(prevState: MsgState, data: string): MsgState {
  prevState.lastMessage = data;
  prevState.messages.push(data);
  prevState.messages.shift();
  return prevState;
}

export function useChannel<T>(name: string): [MsgState, MsgState[]] {
  const [messageState, dispatch] = useReducer(reducer, initialState);

  let channel = useRef(new BroadcastChannel(name));
  function postMessage(msg: string) {
    channel.current.postMessage(msg);
  }

  useEffect(() => {
    channel.current.onmessage = function ({ data }) {
      dispatch(data);
    };
    return function cleanup() {
      channel.current && channel.current.close();
    };
  }, [name]);
  return [messageState, postMessage];
}
