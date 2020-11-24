import {RingBuffer} from './wasm-audio-helper.js';
const bufferSampleSize = 2 << 11;
const sizePerSample = 4;
class UploadProcessor extends AudioWorkletProcessor {
  constructor() {
    this.rb = new RingBuffer();
    this.worker = new Worker("./upload-worker.js");
    this.worker.postMessage({ stateBar, sar }, [stateBar, sar]);
    await new Promise(r=>{
      this.worker.onmessage={data:{init:1}}=>r;
    })
    this.port.postMessage({ init: 1 });
  }
  process(inputs, outputs, parameters) {
    inputs=inputs[0];
    outputs=outputs[0];
    if (!inputs[0] || !inputs[0][0]) return true;
    for(let i in inputs){
      this.rb.push(inputs[i]);
      for(let j in inputs[i]){
        outputs[i][j]=inputs[i][j];
      }
    }
    return true;
  }
}
registerProcessor("upload-processor", UploadProcessor);
