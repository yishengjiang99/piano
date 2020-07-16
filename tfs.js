const fs = require("fs");

const wh = fs.createWriteStream("here.csv");
const pipe = new require("stream").PassThrough();
pipe.pipe(wh);
var readline = require("readline");
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
rl.on("line", function (line) {
  pipe.write(line);
});
