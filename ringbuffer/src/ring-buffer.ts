export default class RingBuffer {
  wptr: number;
  rptr: number;
  arr: any[];
  constructor(n) {
    this.wptr = 0;
    this.rptr = 0;
    this.arr = new Array(n).fill(null);
  }
  add(obj) {
    this.arr[this.wptr++] = obj;
  }
  read() {
    if (this.rptr >= this.wptr) return null;
    return this.arr[this.rptr++];
  }
  reads(num) {
    const numRead = Math.min(num, this.wptr - this.rptr);
    if (numRead < 0) return [];
    let ret = this.arr.slice(this.rptr, this.rptr + numRead);
    this.rptr += num;
    return ret;
  }
  readAll() {
    return this.arr.filter((a) => a);
  }
}
