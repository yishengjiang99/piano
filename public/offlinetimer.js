(function () {
  const channel = new BroadcastChannel("clock");
  const eventsChannel = new BroadcastChannel("wschannel");
  const track = [];
  const barMap = {};
  var t0;
  let n = -2;
  let interval = 250;
  let t = null;
  let trackPointer = 0;
  eventsChannel.onmessage = ({ data }) => {
    if (data.cmd && data.cmd === "compose") {
      if (track.length === 0) {
        t0 = data.time;
      }
      track.push(data);
    }
  };

  const ontick = () => {
    const time = n * interval;
    var toPlay = [];
    while (track.length > trackPointer && track[trackPointer].bar <= n) {
      toPlay.push(track[trackPointer++]);
    }
    if (toPlay.length > 0)
      channel.postMessage({
        time: time,
        n: n,
        cmd: "tick",
        notes: toPlay,
        trackLength: track[track.length - 1].bar,
      });
    if (trackPointer >= track.length) {
      clearInterval(t);
      n = 0;
    }
    n++;
  };
  channel.onmessage = ({ data, lastEventId, source, ports }) => {
    channel.postMessage({ type: "debug", data, source, ports });
    if (data == "reset") {
      n = 0;
      clearInterval(t);
    }
    if ((m = data.match(/interval (\d+)/))) {
      interval = parseInt(m[1]);
      return;
    } else if ((m = data.match(/-(\d+)/))) {
      n = n - parseInt(m[1]);
    } else if ((m = data.match(/>>(\d+)/))) {
      n = n + parseInt(m[1]);
    } else if ((m = data.match(/set (\d+)/))) {
      n = parseInt(m[1]);
    } else
      switch (data) {
        case "start":
          if (t !== null) {
            console.log("timmer already running");
            return;
          }
          t = setInterval(ontick, interval);
          break;
        case "pause":
          clearInterval(t);
          t = null;
          break;
        case "reset":
          n = 0;
          clearInterval(t);
          t = null;
          break;
        case "resume":
          if (t !== null) {
            console.log("timmer already running");
            return;
          }
          t = setInterval(ontick, interval);
          break;
        default:
          channel.postMessage(data);
          break;
      }
  };

  // channel.postMessage("load");
})();
