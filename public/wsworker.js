var host = "wss://dsp.grepawk.com/signal"; //:4000";
var msgChannel = new BroadcastChannel("wschannel");
msgChannel.onmessage = ({data}) => {
<<<<<<< HEAD
=======
  if (socket.state !== WebSocket.OPEN) {
    return;
  }
>>>>>>> master
  if (typeof data === "string" && socket) socket.send(data);
  if (data.cmd && socket) {
    if (data.cmd === "updateSetting") {
      //   socket.send(JSON.stringify(data));
    }
    if (data.cmd === "compose" && data.adsr) {
<<<<<<< HEAD
      socket.proto
      const {type, time, freq, index, bar, adsr} = data;
      const csvstr = ["compose", time, freq, index, adsr[0], adsr[1], adsr[2]].join(",");
      socket.send("csv:" + csvstr);
=======
      const {type, time, freq, index, bar, adsr} = data;
      const csvstr = [time, freq, index, adsr.attackStart, adsr.releaseStart].join(",");
      socket.send(JSON.stringify({cmd: "compose", csv: csvstr}));
>>>>>>> master
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
<<<<<<< HEAD
    if (typeof data === "Blob") {
      txt = data.text();
    }
    console.log(txt, data, socket.binaryType);
    //   if(socket.binaryType)
    try {
      const obj = JSON.parse(data);
      obj.cmd = obj.cmd || obj.type;
      //  msgChannel.postMessage(obj);
=======
    try {
      const obj = JSON.parse(data);
      msgChannel.postMessage(obj);
>>>>>>> master
    } catch (e) {
      //msgChannel.postMessage(data.toString());
    }
  };
  socket.send("list");
});
