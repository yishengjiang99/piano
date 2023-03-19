/* eslint-disable no-restricted-globals */
const channel = {
  onmessage,
  postMessage,
};

var t0;

let interval = 100;
let t = null;
let trackPointer = 0,
  n = -1;
let timerStart;
let noteNote;
let paused = false;
postMessage("onload");

const ontick = () => {
  if (paused) return;
  const perfTimeClock = (n / 4) * interval;
  var toPlay = [];
  postMessage({
    time: perfTimeClock,
    tick: n / 4,
  });
  n++;
};

addEventListener("messageError", (e) => console.err);
addEventListener("message", (e) => {
  var data = e.data;
  console.log(data);
  if (data == "reset") {
    n = 0;
    clearInterval(t);
  }
  var m;
  if ((m = data.match(/interval (\d+)/))) {
    interval = parseInt(m[1]);
  } else if ((m = data.match(/-(\d+)/))) {
    n = n - parseInt(m[1]);
  } else if ((m = data.match(/\+(\d+)/))) {
    n = n + parseInt(m[1]);
  } else if ((m = data.match(/set (\d+)/))) {
    n = parseInt(m[1]);
  } else {
    switch (data) {
      case "play":
      case "start":
        if (t) break; //alrady started
        n = 0;
        t = setInterval(ontick, interval / 4);
        break;
      case "resume":
        if (t !== null) {
          clearInterval(t);
          console.log("timmer already running");
        }
        t = setInterval(ontick, interval / 4);
        break;
      case "stop":
        t = 0;
      case "pause":
        clearInterval(t);
        break;
      case "reset":
        n = 0;
        clearInterval(t);
        t = null;
        break;
      default:
        channel.postMessage(data);
        break;
    }
  }
});
