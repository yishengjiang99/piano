import { readCsvTransform, ReadLineTransform, loadSFSet, convertMidi } from "./index";
import { createServer } from "http";
import { resolve } from "path";
const midifile = convertMidi(resolve(__dirname, "../db/midiFiles/OnlineMidi.mid"));
const notebuffers = loadSFSet("FatBoy", ["acoustic_grand_piano"]);

let midiFile;
convertMidi(resolve(__dirname, "../db/midiFiles/OnlineMidi.mid")).then((readable) => {
  midiFile = readable;
});

async function initServer() {
  const midiFile1 = await convertMidi(resolve(__dirname, "../db/midiFiles/OnlineMidi.mid"));
  const notebuffers = loadSFSet("FatBoy", ["acoustic_grand_piano", "clarnet"]);
}
