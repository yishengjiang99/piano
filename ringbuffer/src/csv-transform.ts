import { Transform } from "stream";
const COMMA = Buffer.from(",");

export class CSVTransform extends Transform {
  _transform(chunk, encoding, cb) {
    let csvLine = [];
    let idx;
    while (chunk.length && (idx = chunk.indexOf(COMMA)) >= 0) {
      csvLine.push(chunk.slice(0, idx).toString());
      chunk = chunk.slice(idx + 1);
    }
    csvLine.push(chunk.toString());
    cb(null, csvLine.join(","));
  }
}

const { Readable, Writable } = require("stream");

const createCounterReader = () => {
  let count = 0;
  return new Readable({
    objectMode: true,
    read() {
      count += 1;
      console.log("reading:", count);
      this.push(count);
    },
  });
};

const counterReader = createCounterReader();
const logWriter = new Writable({
  objectMode: true,
  write: (chunk, _, done) => {
    console.log("writing:", chunk);
    done();
  },
});
