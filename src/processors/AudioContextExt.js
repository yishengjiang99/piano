import { useState, useEffect} from "react";


const _getAudioCtx = () =>{
  let ctx = null;
  return ()=>{
    if(ctx) return ctx;
    ctx = new AudioContext();
    return ctx;
  }
}
export function useAudioContext() {
  const [ctx, setCtx] = useState(null);
  const [inputNode, setInputNode] = useState(null);
  const [chainCursor, setChainCursor] = useState(null);

  useEffect(() => {
    if (ctx !== null) {
      setInputNode(new GainNode(ctx, { gain: 1.0 }));
      setChainCursor(ctx.destination);
    }
  }, [ctx]);

  useEffect(() => {
    if (inputNode && chainCursor) {
      if (inputNode.numberOfOutputs > 0) inputNode.disconnect();
      inputNode.connect(chainCursor);
    }
  }, [inputNode, chainCursor]);

  function addFilter(audioNode) {
    audioNode.connect(chainCursor);
    setChainCursor(audioNode);
  }

  function connectInput(audioNode) {
    audioNode.connect(inputNode);
  }
  return [ctx, setCtx, addFilter, connectInput];
}
