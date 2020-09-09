import { expect } from "chai";
import { RingBuffer } from "../../src/ring-buffer";
describe("Ringbuffer", () => {
  it("it holds array of generics at fix length", () => {
    try {
      const rb = new RingBuffer<number>(50);
      expect(rb.readAll().length).to.equal(0);
    } catch (e) {
      expect(e).to.be.null;
      throw e;
    }
  });
  it("has embeded array", function () {
    const rb = new RingBuffer<number>(50);
    rb.add(3);
    rb.add(11);
    const ersult = rb.read();
    expect(ersult).to.equal(3);
  });

  it("will not return more array than written", function () {
    const rb = new RingBuffer<number>(50);
    rb.add(3);
    rb.add(11);
    expect(rb.read()).to.equal(3);
    rb.read();
    const res = rb.read();
    expect(res).to.be.null;
  });

  it("reads() will truncate output array if  limited by availablility", function () {
    const rb3 = new RingBuffer<number>(50);
    rb3.add(3);
    rb3.add(11);
    const rs2 = rb3.reads(4);

    expect(rs2.length).to.equal(2);

    const rs5 = rb3.reads(5);
    expect(rs5.length).to.equal(0);
  });

  it("read all function returns all non-nulls", function () {
    const rb11 = new RingBuffer<string>(44);
    for (let i = 0; i < 44; i++) {
      rb11.add("s");
    }
    expect(rb11.readAll().length).to.equal(44);
  });
});
