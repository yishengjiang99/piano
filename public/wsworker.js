var host = "wss://www.grepawk.com/signal"; //:4000";
var msgChannel = new BroadcastChannel("wschannel");
msgChannel.onmessage = ({ data }) => {
  if (data.cmd && socket) socket.send(JSON.stringify(data));
};
const output = (str) => {
  msgChannel.postMessage({ msg: str });
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
  socket = socket;
  socket.onmessage = ({ data }) => {
    console.log(data);
    try {
      const obj = JSON.parse(data);
      msgChannel.postMessage(obj);
    } catch (e) {
      msgChannel.postMessage(data);
    }
  };
  socket.send("list");
});
