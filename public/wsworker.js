var host = "wss://www.grepawk.com/signal"; //:4000";
var msgChannel = new BroadcastChannel("wschannel");
msgChannel.onmessage = ({data}) => {
  if (socket.state !== WebSocket.OPEN) {
    return;
  }
  if (typeof data === "string" && socket) socket.send(data);
  if (data.cmd && socket) {
    if (data.cmd == "updateSetting") return;

    if (data.cmd === "compose" && data.adsr) {
      const {type, time, freq, index, bar, adsr} = data;
      const csvstr = [time, freq, index, adsr.attackStart, adsr.releaseStart].join(",");
      socket.send(JSON.stringify({cmd: "compose", csv: csvstr}));
    }
  }
};
const output = (str) => {

  msgChannel.postMessage({msg: str});
};
var socket;
function connectSocketIfNotOpen(host) {
  return new Promise((resolve, reject) => {
    socket = new WebSocket(host);
    socket.onopen = (e) => {
      resolve(socket);
    };
    setTimeout(() => {
      reject(new Error("connection timed outt"));
    }, 5000);
  });
}
connectSocketIfNotOpen(host).then((ws) => {
  output("connected");
  let txt;
  socket.onmessage = ({data}) => {
    try {
      const obj = JSON.parse(data);
      msgChannel.postMessage(obj);
    } catch (e) {
      msgChannel.postMessage(data.toString());
    }
  };
  socket.send("list");
});
