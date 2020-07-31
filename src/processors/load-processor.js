const loadProcessor = async function (ctx, processorName) {
  try {
    switch (processorName) {
      case "pass-through":
      case "PassThrough":
        await ctx.audioWorklet.addModule("pass-through.js");
        return new AudioWorkletNode(ctx, "pass-through");
      default:
        break;
    }
  } catch (e) {
    alert(e.message);
  }
};

export const VolumeProxy = (gainParam, label) =>
  new Proxy(gainParam, {
    label: () => label,
    get: () => gainParam.value,
    set: (value) => {
      const _opts = { min: 0, max: 2 };

      if (value < _opts.min || value > _opts.max) return false;
      gainParam.setValueAtTime(value, 0);
      return true;
    },
  });
const accel = 1;

export const EQProxy = (filterChain, label) =>
  new Proxy(filterChain, {
    label: label,
    get: () => {
      aggregateFrequencyResponse(filterChain);
    },
    bass: filterChain.filter((biquad) => biquad.frequency < 400),
    treble: filterChain.filter((biquad) => biquad.frequency > 900),
    moreBass: filterChain
      .filter((biquad) => biquad.frequency < 400)
      .map((bass) => bass.gain.linearRampToValueAtTime(bass.gain.value * 1.03 * accel)),
    lessBass: filterChain
      .filter((biquad) => biquad.frequency < 400)
      .map((bass) => bass.gain.linearRampToValueAtTime(bass.gain.value * 0.96 * accel)),
    moreTreble: filterChain
      .filter((biquad) => biquad.frequency > 700)
      .map((treb) => treb.gain.linearRampToValueAtTime(treb.gain.value * 1.03 * accel)),
    lessTreble: filterChain
      .filter((biquad) => biquad.frequency > 700)
      .map((treb) => treb.gain.linearRampToValueAtTime(treb.gain.value * 0.96 * accel)),
  });

const aggregateFrequencyResponse = () => "";

export default loadProcessor;
