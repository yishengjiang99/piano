import { loadSFSet, sfNames } from "./sound-font-loader";
import { createServer } from "http";
import { loadMidi, midiTrackGenerator } from "./convert-midi";
let fontPlayer, tracks;
async function init() {
  return [await loadSFSet("FatBoy", await sfNames("FatBoy")), await loadMidi("./OnlineMid.mid")];
}
init()
  .then(([fontPlayer, tracks]) => {
    createServer(async (req, res) => {
      if (req.url.includes("fontplayer")) {
        res.end(JSON.stringify(fontPlayer));
      }
      for await (const note of midiTrackGenerator(tracks)) {
        res.write(JSON.stringify(note));
      }
      res.end();
    }).listen(3000);
  })
  .catch(console.error);
