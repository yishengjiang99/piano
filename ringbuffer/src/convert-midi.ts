import { mainModule } from "process";
import { PassThrough, Readable } from "stream";
const { Midi } = require("@tonejs/midi");

function sigfig(num, sigdig) {
  const mask = 10 << sigdig;

  return Math.floor(num * mask) / mask;
}

export async function loadMidi(filename) {
  const midi = await new Midi(require("fs").readFileSync(filename));
  return midi.tracks.map((track) =>
    track.notes.map((note) =>
      [note.time, note.midi, note.duration, note.velocity].map((n) => sigfig(n, 4))
    )
  );
}

export function midiReader(tracks) {
  let lastTick = null;
  let time = 0;
  const hrdiff = (h1, h2) => h2[0] - h1[0] + (h2[1] - h1[1]) * 1e-9;
  return new Readable({
    // objectMode: true,
    read() {
      if (!lastTick) lastTick = process.hrtime();
      const now = process.hrtime();
      time += hrdiff(lastTick, now);
      lastTick = now;
      this.push(time + "");

      // let done = true;
      // for (const track of tracks) {
      //   if (!track[0]) continue;
      //   done = false;
      //   if (track[0][0] < time) {
      //     this.push(track[0].join(","));
      //     track.shift();
      //   }
      // }
    },
  });
}

// function(){
//   while (done) {
//     if (!lastTick) lastTick = new Date().getUTCMilliseconds();
//     const now = new Date().getUTCMilliseconds();
//     time += now - lastTick;
//     done = true;
//     lastTick = now;
//     console.log(lastTick);
//     for (const track of tracks) {
//       if (track[0]) done = false;
//       if (track[0][0] < now + 50) {
//         const note = track[0];
//         track.slice(0);
//         yield note;
//       }
//     }
//     lastTick = now;
//   }
// }

async function run() {
  const filename =
    process.argv[2] || require("path").resolve(__dirname, "../db/midiFiles/OnlineMidi.mid");
  const tracks = await loadMidi(filename);
  midiReader(tracks).pipe(process.stdout);
}
run();
