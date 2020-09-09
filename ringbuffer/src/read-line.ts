import { Transform } from "stream";

const NEWLINE = Buffer.from("\n");
const COMMA = Buffer.from(",");

export class ReadLineTransform extends Transform {
  _buf: Buffer;
  wptr: number;
  constructor() {
    super();
    this._buf = Buffer.alloc(1024);
    this.wptr = 0;
  }

  _transform(chunk, enc, cb) {
    let lb;
    while ((lb = chunk.indexOf(NEWLINE)) >= 0 && chunk.length) {
      this._emitData(chunk.slice(0, lb + 1));
      chunk = chunk.slice(lb + 1);
    }
    if (chunk.length) {
      chunk.copy(this._buf, this.wptr, 0, chunk.length);
      this.wptr += chunk.length;
    }
    cb(null, null);
  }

  _emitData(slice) {
    if (this.wptr) {
      this.emit("data", Buffer.concat([this._buf.slice(0, this.wptr), slice]));
      this.wptr = 0;
    } else {
      this.emit("data", slice);
    }
  }
  _flush(cb) {
    cb(this._buf.slice(0, this.wptr));
  }
}
