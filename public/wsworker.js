
var host = "wss://api.grepawk.com/signal"; //:4000";
var msgChannel = new BroadcastChannel("wschannel");
msgChannel.onmessage = ({ data }) => {
  if (typeof data ==='string' && socket) socket.send(data);  
  if (data.cmd && socket){
    if(data.cmd ==='compose' && data.adsr){
      const {type,time,freq,index,bar, adsr} = data;
      const csvstr = [time, freq, index, adsr.attackStart, adsr.releaseStart].join(",");
      socket.send(JSON.stringify({cmd:"compose", csv:csvstr}));
      console.log("sending "+JSON.stringify({cmd:"compose", csv:csvstr}));

    }else{
      socket.send(JSON.stringify(data));
    }

  }
};
const output = (str) => {
  console.log(str);

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
      msgChannel.postMessage(data.toString());
    }
  };
  socket.send("list");
});
