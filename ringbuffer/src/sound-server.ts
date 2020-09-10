import { loadSFSet } from "./sound-font-loader";

const ctx = new WebAudioContext();
const keyboardKeys = "awsedftgyhj".split("");
const oscilators = [...keyboardKeys.keys()]
  .map((key) => key + 60)
  .map((midi) => {
    Math.pow(2, (midi - 69) / 12) * 440;
  })
  .map((freq) => {
    let oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = freq;
    oscillator.gain = 0;
  });
