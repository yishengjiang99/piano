import Head from "next/head";
import Link from "next/link";
import Playlist from "../components/playlist";
import { ParamConfig } from "../components/envelop-config";

const fetchAccessToken = (code) => {
  return fetch({
    url: "https://github.com/login/oauth/access_token",
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GH_CLIENT_ID,
      client_secret: process.env.GH_CLIENT_SECRET,
      code: code,
    }),
  });
};
export default function github(req) {
  if ((!req.queries.access_token && !req, queries.code)) {
    return (
      <h1>
        <button>LOGIN WITH Github</button>
      </h1>
    );
  }
  if (req.queries.code) {
    try {
      const accesstoken = fetchAccessToken(code);
    } catch (e) {
      return (
        <>
          <b>Login failed</b>
          <h3>
            <button>Try again with Github</button>
          </h3>
        </>
      );
    }
  }
}
