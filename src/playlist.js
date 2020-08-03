import React from "react";
import {useState, useEffect, useRef} from "react";
import {
  Drawer,
  Card,
  InputLabel,
  CardHeader,
  CardContent,
  Button,
  ButtonGroup,
  IconButton,
  Slider,
} from "@material-ui/core";
import Select from "react-select";

const defaultSound = {
  value: "/sound/song.mp3",
  label: "song.mp3",
};
function chunk(array, size) {
  const chunked_arr = [];
  for (let i = 0;i < array.length;i++) {
    const last = chunked_arr[chunked_arr.length - 1];
    if (!last || last.length === size) {
      chunked_arr.push([array[i]]);
    } else {
      last.push(array[i]);
    }
  }
  return chunked_arr;
}
const BgSound = ({src, userTriggered, index}) => {
  const [inputNode, setInputNode] = useState(null);
  // const [userTriggered, setUserTriggered] = useState(_userTriggered);
  const [audioCtx, setAudioCtx] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioCtx && userTriggered) {
      setAudioCtx(window.audioCtx);
      window.audioCtx.init();
    }

    if (!inputNode && audioCtx && audioRef.current) {
      const node = audioCtx.setAudioTag(audioRef.current);
      setInputNode(node);
    }

    if (audioCtx && inputNode) {
      audioRef.current.oncanplay = function (e) {
        e.target.play();
      };
    }
  });
  return (
    <>
      <audio ref={audioRef} src={src} controls />

    </>
  );
};
function basename(path) {
  if (!path) return "";
  var t = path.split("/");
  return t[t.length - 1].substring(0, 20);
}
const Playlist = (props) => {
  const apiUrl = props.api || "/api/fs/sound";
  const [sounds, setSounds] = useState(props.files || null);
  const [userTriggered, setUserTriggered] = useState(false);
  const [nowPlaying, setNowPlaying] = useState("/sound/song.mp3");

  useEffect(() => {
    const fetchSounds = async () => {
      const soundsJson = await fetch(apiUrl);
      const soundsArray = await soundsJson.json(); //.then((res) => res.json());
      soundsArray.sort((a, b) => a.charAt(a.length - 4));
      setSounds(soundsArray);
    };
    if (!sounds) fetchSounds();
  });

  const soundButtons = (sounds) => {
    return (
      <>
        {chunk(sounds, 7).map((chk, j) => {
          return (
            <div key={j}>
              <ButtonGroup>
                {chk.map((sound, i) => {
                  return (
                    <Button
                      key={i}
                      onClick={(e) => {
                        setUserTriggered(true);
                        setNowPlaying(sound);
                      }}
                    >
                      {basename(sound)}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </div>
          );
        })}
      </>
    );
  };
  const soundSelectBar = (sounds) => {
    return (
      <select
        onInput={(e) => {
          setUserTriggered(true);
          setNowPlaying(e.target.value);
        }}
      >
        {sounds &&
          sounds.map((url, i) => {
            return (
              <option key={i} value={url}>
                {basename(url)}
              </option>
            );
          })}
      </select>
    );
  };
  return (
    <Card display="inline">
      <CardHeader title={basename(nowPlaying)} />
      <CardContent>
        <BgSound
          index={props.index || 0}
          userTriggered={userTriggered}
          src={nowPlaying}
        />
        <div>
          {sounds &&
            (props.mode && props.mode === "buttons"
              ? soundButtons(sounds)
              : soundSelectBar(sounds))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Playlist;
