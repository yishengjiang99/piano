import * as fs from "fs";
import * as https from "https";
import * as WebSocket from "ws";
import { stdoutHandler } from "./stdout";
import { stdinHandler } from "./stdin";
import * as url from "url";

const server = https.createServer({
  cert: fs.readFileSync(
    process.env.chainpem || "/etc/letsencrypt/live/dsp.grepawk.com/fullchain.pem"
  ),
  key: fs.readFileSync(process.env.privkey || "/etc/letsencrypt/live/dsp.grepawk.com/privkey.pem"),
});

const stdin = new WebSocket.Server({ noServer: true });

const stdout = new WebSocket.Server({ noServer: true });

stdin.on("connection", stdinHandler);
stdout.on("connection", stdoutHandler);

server.on("upgrade", function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;
  console.log(pathname);
  if (pathname.startsWith("/stdin")) {
    stdin.handleUpgrade(request, socket, head, function done(ws) {
      stdin.emit("connection", ws, request);
    });
  } else if (pathname.startsWith("/stdout")) {
    stdout.handleUpgrade(request, socket, head, function done(ws) {
      stdout.emit("connection", ws, request);
    });
  } else {
    //    socket.destroy();
  }
});

server.listen(443);
