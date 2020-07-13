(function () {
  const channel = new BroadcastChannel("clock");
  const eventsChannel = new BroadcastChannel("wschannel");
  const track = [];
  const barMap = {};
  const t0 = data.time;
  eventsChannel.onmessage = ({ data }) => {
    if (data.cmd && data.cmd === "compose") {
      if (track.length === 0) {
        t0 = data.time;
      }
      track.push(data);
    }
  };
  let n = -2;
  const interval = 250;
  let t = null;
  let start;
  const ontick = () => {
    const time = n * interval;
    channel.postMessage(JSON.stringify({ t: time, cmd: "tick" }));
    n++;
  };
  channel.onmessage = ({ data, lastEventId, source, ports }) => {
    if (data == "reset") {
      n = 0;
      clearInterval(t);
    }
    if ((m = data.match(/interval (\d+)/))) {
      interval = m;
    }
    if (t == null) {
      t = setInterval(ontick, interval);
    } else {
      clearInterval(t);
    }

    if (data == "reset") {
      n = 0;
    }
    if (data === "resume") {
      t = setInterval(ontick, interval);
    }
  };

  clockchan.postMessage("load");
})();
