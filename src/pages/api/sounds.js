import fs from "fs";
import path from "path";
const soundDir = path.resolve("public/sound");

export default (req, res) => {
  const files = fs.readdirSync(soundDir);
  const json = files
    .filter((f) => f.endsWith("mp3") || f.endsWith("mp4"))
    .map((file) => {
      return {
        url: path.join("/sound/", file),
        name: file.split(" - ")[0],
      };
    });
  res.json(json);
};
