import { useState, useEffect, useRef, useReducer } from "react";
import { useEventListener } from "./useEventListener";
export function useAudioContext() {
  const [ctx, setCtx] = useState(new OfflineAudioContext(2, 44100 * 40, 44100));
  const devnull = () => {};

  let chainCursor = useRef(ctx.destination);
  function addFilter(audioNode) {
    audioNode.connect(chainCursor.current);
    if (inputRef.current) {
      inputRef.diconnect(chainCursor.current);
      inputRef.connect(audioNode);
    }
    chainCursor.current = audioNode;
  }

  let inputRef = useRef();

  useEffect(() => {
    if (!inputRef.current && ctx) {
      inputRef.current = new GainNode(ctx, { gain: 0.8 });
    }
  }, ctx);
  useEffect(() => {
    if (!ctx) ctx = new AudioContext();
  });
  function connectInput(audioNode) {
    audioNode.connect(inputRef.current);
  }
  return [ctx, addFilter, connectInput];
}
