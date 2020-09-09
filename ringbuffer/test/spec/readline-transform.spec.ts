import { expect } from "chai";
import { ReadLineTransform } from "../../src/read-line-transform";
import { resolve } from "path";
import { PassThrough } from "stream";
import { Transform } from "stream";
import { emit } from "process";
const COMMA = Buffer.from(",");
// describe("readline ransform", function () {
//   it("parses file into lins to be processed", () => {
//     const fileSorter = new Transform({
//       transform: (chunk, encoding, cb) => {
//         let csvLine = [];
//         let idx;
//         while ((idx = chunk.indexOf(COMMA)) >= 0) {
//           csvLine.push(chunk.substring(idx));
//           console.log(csvLine);
//         }
//       },
//     });
//     require("fs")
//       .createReadStream(resolve(__dirname, "../test/data/fifth_sympony.csv"))
//       .pipe(new ReadLineTransform())
//       .pipe(fileSorter);
//   });
// });

const fileSorter = new Transform({
  transform: (chunk, encoding, cb) => {
    let csvLine = [];
    let idx;
    while (chunk.length && (idx = chunk.indexOf(COMMA)) >= 0) {
      csvLine.push(chunk.slice(0, idx).toString());
      chunk = chunk.slice(idx + 1);
    }
    csvLine.push(chunk.toString());
    cb(null, csvLine.join(","));
  },
});

const linexform = require("fs")
  .createReadStream(resolve(__dirname, "../data/midi.csv"))
  .pipe(new ReadLineTransform());

linexform.pipe(fileSorter).pipe(process.stdout);
