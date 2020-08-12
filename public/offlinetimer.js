const clock = new BroadcastChannel("clock");
const wsevent = new BroadcastChannel("wschannel");
const events = [];
wsevent.onmessage = function (evt) {
  if (evt.data.cmd == "keyboard" || evt.data.cmd == 'readnotes') {
    events.push(evt.data);
    if (timerId || n) {
      clearTimeout(timerId);
      n = 0;
    }
  }
};

var timerId = null;
var n = 0;
var frequency = 40;
var beatLength = 400;
var queue, t0_performance, t0_playback;
clock.onmessage = (e) => {
  switch (e.data) {
    case "start":
    case "resume":
      queue = events;
      t0_performance = (queue[0] && queue[0].time) || 0;
      const debug = queue
        .map((item) => {
          return item.time - t0_performance;
        })
        .join(",");
      console.log(debug);
      timerId = setInterval(function () {
        const now = n * frequency;
        clock.postMessage({
          time: now,
          n: now / beatLength,
        });
        var k = 0;
        while (k++ < 2 && queue[0] && queue[0].time - t0_performance < now) {
          const _event = queue[0];
          queue.splice(0, 1);
          console.log(_event);
          _event.cmd = "playback";
          wsevent.postMessage(_event);
        }
        n++;
      }, frequency);
      break;
    case "pause":
      clearTimeout(timerId);
      break;
    case "reset":
      n = 0;
      clearTimeout(timerId);
      clock.postMessage({
        time: n * frequency,
        tick: n / 4,
      });
      break;
    case "-5":
      n = Math.max(0, n - 20);
      break;
    case "5+":
      n = n + 20;
      break;
    default:
      break;
  }
};
