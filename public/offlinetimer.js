(function () {
  const channel = new BroadcastChannel("clock");
  const eventsChannel = new BroadcastChannel("wschannel");
  const track = [];
  const barMap = {};
  var t0;


  let interval = 100;
  let t = null;
  let trackPointer = 0, n=-1;
  let timerStart;
  let noteNote;
  let paused = false;
  eventsChannel.onmessage = ({ data }) => {
    if (data.cmd && data.cmd === "compose") {
      if (track.length === 0) {
        t0 = data.time;
      
      }

      data.perfTime = data.timeStamp-t0;
      track.push(data);
      var lastNote = data;
      console.log(lastNote);
    }
  };


  const ontick = () => {
    if(paused) return;
    const perfTimeClock = n/4 * interval;


    var toPlay = [];
    while (track.length > trackPointer && track[trackPointer].perfTime <= perfTimeClock) {
      toPlay.push(track[trackPointer++]);
    }
    channel.postMessage({
      time: perfTimeClock,
      tick: n/4,
    })
    
    if (toPlay.length > 0)
      channel.postMessage({
        time: n/4 * interval,
        n: n/4,
        cmd: "tick",
        notes: toPlay,
        trackLength: track[track.length - 1].bar,
      });
    // if (trackPointer >= track.length) {
    //   clearInterval(t);
    //   n = 0;
    // }
    n++;
  };
  channel.onmessage = (e) => {
    var data = e.data;
    console.log(data);
    if (data == "reset") {
      n = 0;
      clearInterval(t);
    }
    var m;
    if ((m = data.match(/interval (\d+)/))) {
      interval = parseInt(m[1]);
      console.log('set interval')
      return;
    } else if ((m = data.match(/-(\d+)/))) {
      n = n - parseInt(m[1]);
    } else if ((m = data.match(/\+(\d+)/))) {
      n = n + parseInt(m[1]);
    } else if ((m = data.match(/set (\d+)/))) {
      n = parseInt(m[1]);
    } else
      switch (data) {
        case "start":
          n = 0;
        case "resume":
          if (t !== null) {
            console.log("timmer already running");
            return;
          }
          t = setInterval(ontick, interval/4);
          break;
        case "stop":
        case "pause":
          clearInterval(t);
          t = null;
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
  };

  // channel.postMessage("load");
})();
