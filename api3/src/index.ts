import * as fs from "fs";
import * as https from "https";
import * as WebSocket from "ws";
import { stdoutHandler } from "./stdout";
import { stdinHandler } from "./stdin";
import * as url from "url";
import { resolve } from "path";
import azfs from "./azfs";
import db from "./db";
const favicon = fs.readFileSync("../favicon.jpg");
const server = https.createServer(
  {
    cert: fs.readFileSync("/Users/vn08447/Desktop/dev.cer"),
    key: fs.readFileSync("/Users/vn08447/Desktop/dev.key"),
  },
  (req, res) => {
    const urlparts = req.url.split("/");
    res.writeHead(200);

    switch (req.url) {
      case "/":
      case "/index.html":
        res.writeHead(200, "good", { "Content-Type": "image/jpeg" });
        res.end(fs.readFileSync(resolve(__dirname, "../../,,/build/index.html")));
        break;
      case "/checkin":
        checkinUser(req).then((jsonResp) => {
          res.writeHead(200, "one moemnt", { "Content-Type": "application/json" });
          res.end(JSON.stringify(jsonResp));
        });

        break;
      case "/favicon.jpg":
        res.writeHead(200, "one moemnt", { "Content-Type": "image/jpeg" });
        res.write(favicon.slice(0, 18));

        checkinUser(req).then((jsonResp) => {
          const bufferResp = Buffer.from(JSON.stringify(jsonResp));
          const respBufferLen = bufferResp.byteLength;
          res.write(respBufferLen);
          res.write(bufferResp);
          res.write(favicon.slice(18 + 1 + respBufferLen));
          res.end();
        });

        // const respJson = Buffer.from([user, files]);
        // console.log(respJson.byteLength);
        // console.log(favicon.byteLength);

        // res.write(respJson);
        // res.write(favicon.slice(respJson.length));
        // res.end();
        break;
    }
    if (urlparts.length > 2) {
      switch (urlparts[1]) {
        case "js":
        case "css":
          res.end(fs.readFileSync("../build/" + urlparts[1] + "/" + urlparts.slice(2).join("/")));
          break;
        case "api":
          switch (urlparts.slice(2).join("/")) {
            case "ls":
              azfs.listContainers().then((containers) => res.end(JSON.stringify(containers)));
              break;
          }
          break;
        default:
          break;
      }
    }
    res.statusCode = 404;
    res.statusMessage = req.url + " not found.";
    res.end();
  }
);
const checkinUser = async (req) => {
  const user = await db.getOrCreateUser(req);
  const files = await db.userFiles(user);
  const jsonResp = {
    user,
    files,
    shared: azfs.listFiles("sounds"),
  };
  return jsonResp;
};
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
const hashCheckAuthLogin = async (username) => {
  require("exec").exec(
    `md5 -s '${username}${process.env.secret_md5_salt || "welcome"}'`,
    (err, stdout, stderr) => {
      if (err) throw err;
      return stdout.toString();
    }
  );
};
server.listen(443);
