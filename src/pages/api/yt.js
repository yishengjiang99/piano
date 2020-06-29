const youtube_api_key = process.env.google_key;
const fetch = require("node-fetch");

function parseYt(body) {
  return body.items.map((item) => {
    return {
      vid: item.id.videoId,
      thumbnail: item.snippet.thumbnails.default.url,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      value: `<li><img src='${item.snippet.thumbnails.default.url}'> ${item.snippet.title}</li>`,
    };
  });
}
export default async (req, res) => {
  const q = req.query.query || "music";

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&maxResults=10&q=${q}&key=${youtube_api_key}`;
    const resp = await fetch(url);
    const json = await resp.json();
    const videos = parseYt(json);
    res.json(videos);
  } catch (e) {
    res.status = 500;
    res.end(e.message);
  }
};
