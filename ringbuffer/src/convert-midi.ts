import { Midi } from "@tonejs/midi";

function sigfig(num, sigdig) {
  const mask = 10 << sigdig;

  return Math.floor(num * mask) / mask;
}
const sleep = async (ms) => await new Promise((resolve) => setTimeout(resolve, ms));

export async function loadMidi(filename) {
  const midi = await new Midi(require("fs").readFileSync(filename));
  return midi.tracks.map((track) =>
    track.notes.map((note) => [
      sigfig(note.time, 3),
      note.midi,
      sigfig(note.duration, 3),
      sigfig(note.velocity, 3),
      track.instrument.number,
    ])
  );
}

export async function* midiTrackGenerator(tracks) {
  const start = process.hrtime();

  const hrdiff = (h1, h2) => h2[0] - h1[0] + (h2[1] - h1[1]) * 1e-9;
  while (true) {
    const time = hrdiff(start, process.hrtime());
    let next = null;
    for (const track of tracks) {
      if (track.length === 0) continue;

      if (track[0][0] <= time) {
        yield [time].concat(track[0]);
        track.shift();
        next = 0;
      } else {
        next = null === next ? track[0][0] - time : Math.min(track[0][0] - time, next);
      }
    }
    await sleep(next * 1000);
  }
}

async function run() {
  const filename =
    process.argv[2] || require("path").resolve(__dirname, "../db/midiFiles/OnlineMid.mid");
  const tracks = await loadMidi(filename);
  const counterIterator = midiTrackGenerator(tracks);
  (async (iterator) => {
    for await (const item of midiTrackGenerator(tracks)) {
      item && console.log(item);
    }
  })(counterIterator);
}
