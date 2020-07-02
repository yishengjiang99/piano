import { useState, useEffect, useRef, Component } from "react";
import { LinearProgress } from "@material-ui/core";
import {
  FastRewind,
  FastForward,
  PlayCircleFilledSharp,
  PauseCircleFilledSharp,
} from "@material-ui/icons";
import React from "react";
import { getContext, getNote, ensureAudioCtx } from "./audioCtx.js";
import { IconButton, Toolbar } from "@material-ui/core";

const Timer = ({ gOnTick, playPosition }) => {
  const defaults = {
    bpm: 120, //120 quarter notes per minute.. and we tick twice per beat
    noteLength: 1 / 4,
    resolution: 1 / 4,
  };

  const { bpm, noteLength, resolution } = defaults;
  const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;
  const [debug, setDebug] = useState([]);
  const [total, setTotal] = useState(5);
  const [seek, setSeek] = useState(0);
  const [ctx, setCtx] = useState(null);
  const [playing, setPlaying] = useState(false);
  const toolbarRef = useRef();
  var timer;
  let track;
  let _seek = 0;
  const loop = function () {
    var start = ctx.currentTime;
    gOnTick(_seek, ctx.currentTime);
    Object.keys(track[_seek]).forEach((noteIdx) => {
      var note = track[_seek][noteIdx];
      getNote(note.frequency, 3).triggerEnvelope(note.envelop);
    });
    if (_seek + 1 > total) {
      setPlaying(false);
      setSeek(0);
    } else {
      _seek++;
      var nextTick = tickLength - (ctx.currentTime - start) * 1000;
      console.log(nextTick + "next t");
      timer = setTimeout(loop, nextTick);
      setSeek(_seek + 1);
    }
  };
  useEffect(() => {
    if (playing) {
      var _total;
      [track, _total] = window.redux().getTrack(); // = window.redux().getStoragedValue("track");
      console.log(_total + "total");
      setTotal(_total);
      setImmediate(loop);
    } else {
      timer && cancelAnimationFrame(timer);
    }
  }, [playing]);

  useEffect(() => {
    ensureAudioCtx().then((audioCtx) => {
      setCtx(audioCtx);
    });
  }, []);
  return (
    <div>
      <Toolbar ref={toolbarRef}>
        <IconButton>
          <FastRewind />
        </IconButton>
        {playing === true ? (
          <IconButton onClick={(e) => setPlaying(false)}>
            <PauseCircleFilledSharp />
          </IconButton>
        ) : (
          <IconButton onClick={(e) => setPlaying(true)}>
            <PlayCircleFilledSharp />
          </IconButton>
        )}
        <IconButton>
          <FastForward />
        </IconButton>
      </Toolbar>
      <LinearProgress variant="determinate" value={(playPosition / total) * 100}></LinearProgress>
      <div>{JSON.stringify(track)}</div>
    </div>
  );
};
export default Timer;
