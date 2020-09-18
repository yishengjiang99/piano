import * as fetch from "node-fetch";
import { createWriteStream } from "fs";
const sfUrl = (setname, fontname) =>
  `https://gleitz.github.io/midi-js-soundfonts/${setname}/${fontname}-mp3.js`;

export const sfNames = (setname) =>
  fetch(`https://gleitz.github.io/midi-js-soundfonts/${setname}/names.json`)
    .then((res) => res.json())
    .catch((e) => console.error(e));

const { createWritableStream } = require("fs");
type SetName = "FatBoy";
type FontName =
  | "accordion"
  | "acoustic_bass"
  | "acoustic_grand_piano"
  | "acoustic_guitar_nylon"
  | "acoustic_guitar_steel"
  | "agogo"
  | "alto_sax"
  | "applause"
  | "bagpipe"
  | "banjo"
  | "baritone_sax"
  | "bassoon";

export async function loadSFSet(setname: SetName, fonts: FontName[]) {
  const repo = {};
  for (const name of fonts) {
    try {
      fetch(sfUrl(setname, name))
        .then((resp) => resp.body.pipe(createWriteStream("../db/" + setname + "_" + name + ".js")))
        .catch(console.error);
    } catch (e) {
      console.error(e);
    }
  }

  return repo;
}
