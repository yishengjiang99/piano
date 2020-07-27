const clock = new BroadcastChannel("clock");
var timerId = null;
var n = 0;
var frequency = 40;
var beatLength = 400;
clock.onmessage = (e) => {
  switch (e.data) {
    case "start":
    case "resume":
      timerId = setInterval(function () {
        clock.postMessage({
          time: n * frequency,
          n: (n * frequency) / beatLength,
        });
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
