import { useState, useEffect, useRef, useReducer } from "react";

export function useAudioContext(container = window) {
  const [ctx, setCtx] = useState(null);
  const activateAudio = useCallback(() => {
    if (!ctx) setCtx(new AudioContext());
  }, [ctx]);

  useEffect(() => {
    if (!ctx && container.ctx) {
      setCtx(container.ctx);
    } else {
      container.addEventListener(
        "mouseenter" | "keydown" | "drag",
        activateAudio
      );
    }
  }, [ctx, container, activateAudio]);
}

export function useAudioContextExtended() {
  const ctx = useAudioContext();
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
