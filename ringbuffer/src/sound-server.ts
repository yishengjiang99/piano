import { resolve } from "path";
import { createServer } from "net";
import { execSync } from "child_process";
import * as fs from "fs";
import { WebAudioContext, OfflineAudioContext } from "../web-audio-engine/build/web-audio-engine";

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

const notes = Buffer.from("awsedftgyhj");
createServer((socket) => {
  let note;
  Readable(oscillator).pipe("../fifo/1");

  socket.on("data", (d) => (note = notes.indexOf(d[0])) > -1 && (
    oscilators[note].pipe(socket);
   )
}).listen({
  host: "localhost",
  port: "3001",
});
