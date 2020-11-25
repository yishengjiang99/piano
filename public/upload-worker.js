const { Web } = require("@material-ui/icons");

let ws, sharedBuffer, stateBuffer, proc;

onmessage = ({ sar, stateBuffer }) => {
  sharedBuffer = sar;
  stateBuffer = stateBuffer;
  ws = new WebSocket("ws://localhost:3002");
  ws.onopen = () => postMessage({ init: 1 });
  const stateU32 = new Uint32Array(stateBuffer, 0, 32);
  readPtr = 0;
  Atomics.wait(stateBuffer, 0, readPtr);
  console.log(stateBuffer[0]);
};
