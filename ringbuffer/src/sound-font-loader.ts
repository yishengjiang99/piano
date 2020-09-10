import { FilterCenterFocusSharp } from "@material-ui/icons";
import * as loadAudio from "audio-loader";
import * as fetch from "node-fetch";

const sfUrl = (setname, fontname) =>
  `https://gleitz.github.io/midi-js-soundfonts/${setname}/${fontname}-mp3.js`;

const sfNames = (setname) =>
  fetch(`https://gleitz.github.io/midi-js-soundfonts/${setname}/names.json`)
    .then((res) => res.json())
    .catch((e) => console.error(e));

const { createWritableStream } = require("fs");

export async function loadSFSet(setname, fonts) {
  const repo = {};
  for (const name of fonts) {
    try {
      repo[name] = await loadAudio(sfUrl(setname, name));
    } catch (e) {
      name;
      console.error(e);
    }
  }
}
