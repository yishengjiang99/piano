var n = -2;
var interval = interval;
var t;
var clockchan = new BroadcastChannel("clock");
clockchan.onmessage = ({ data }) => {
  if (data.interval) {
    interval = data.interval;
  }
  if (data == "start") {
    n = 0;
    t = setInterval(function () {
      clockchan.postMessage({ n: n, time: n * interval });
      n++;
    }, interval);
  }

  if (data == "stop") {
    clearInterval(t);
  }
  if (data == "reset") {
    n = 0;
    postMessage({ n: 0 });
  }
  if (data === "resume") {
    t = setInterval(function () {
      clockchan.postMessage(n++);
    }, interval);
  }
};

clockchan.postMessage("load");
