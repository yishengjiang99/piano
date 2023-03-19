// const track = [];
// const barMap = {};
// var t0;
// let trackPointer = 0;
// const channel = new BroadcastChannel("clock");

// const eventsChannel = new BroadcastChannel("wschannel");
// eventsChannel.onmessage = ({ data }) => {
//   if (data.cmd && data.cmd === "compose") {
//     if (track.length === 0) {
//       t0 = data.time;
//     }

//     data.perfTime = data.timeStamp - t0;
//     track.push(data);
//     var lastNote = data;
//     console.log(lastNote);
//   }
// };

// var toPlay = [];

// while (track.length > trackPointer && track[trackPointer].perfTime <= perfTimeClock) {
//   toPlay.push(track[trackPointer++]);
// }
// if (toPlay.length > 0) {
//   channel.postMessage({
//     time: (n / 4) * interval,
//     qn: n / 4,
//     cmd: "tick",
//     notes: toPlay,
//     trackLength: track[track.length - 1].bar,
//   });
// }
