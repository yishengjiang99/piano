export const useReverb = (ctx, options) => {
  const [reverb, setReverb] = userState(null);
  useEffect(() => {
    if (!reverb) {
      ctx.audioContext
        .addModule("./reverb")
        .then((_) => {
          setProcessor(new AudioWorkletNode(ctx, "DattorroReverb", options));
        })
        .catch((e) => console.error(e));
    }
    return function cleanup() {
      processor = null;
    };
  }, []);

  function setParameter(param, value) {
    reverb.parameters.setValueAtTime(value, 0);
  }
  return [reverb, setParameter];
};
