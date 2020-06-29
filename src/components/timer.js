import { useState, useEffect, useRef, Component } from "react";
import { LinearProgress } from "@material-ui/core";
import {
  FastRewind,
  FastForward,
  PlayCircleFilledSharp,
  PauseCircleFilledSharp,
} from "@material-ui/icons";
import React from "react";
import getAudioContext from "../lib/audioCtx.js";

import { IconButton, Toolbar } from "@material-ui/core";

function Ticker(onTick, intervalLength) {
  // const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;
  var n = 0;
  var timer = new Worker("./offlinetimer.js");
  timer.onmessage = ({ data }) => {
    switch (data) {
      case "load":
        timer.postMessage({ interval: intervalLength });
        break;
      case "ready":
        break;

      default:
        onTick(n++);
        break;
    }
  };
  return {
    startTicker: function () {
      timer.postMessage("start");
    },
    stopTicker: function () {
      timer.postMessage("stop");
    },
    resumeTicker: function () {
      timer.postMessage("resume");
    },
  };
}
var audioCtx;
const Timer = (props) => {
  const [debug, setDebug] = useState("");

  const defaults = {
    bpm: 120, //120 quarter notes per minute.. and we tick twice per beat
    noteLength: 1 / 4,
    resolution: 1 / 8,
    onTick: (time, tickNumber) =>
      setDebug("TICK at " + time + " n:" + tickNumber),
    total: 100,
  };
  const { bpm, noteLength, resolution, onTick, total } = {
    ...defaults,
    ...props,
  };
  const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;
  const ticker = Ticker(onTick, tickLength);

  const [seek, setSeek] = useState(0);
  const [ctx, setCtx] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTick, setCurrentTick] = useState(null);
  const [tickCount, setTickCount] = useState(-3);
  const toolbarRef = useRef();
  useEffect(() => {
    // comp mount
    audioCtx = getAudioContext();
    setCtx(audioCtx._ctx);
    setDebug(audioCtx._ctx.currentTime);
  }, []);

  useEffect(() => {
    let lastTick;

    if (playing) {
      ticker.startTicker(() => {
        setDebug("tick " + (tickCount + 1) * resolution);
        setSeek((tickCount + 1) * resolution);
        onTick(tickCount + 1);
        setTickCount(tickCount + 1);
      }, bpm);
    } else {
      ticker.stopTicker();
    }
  }, [playing]);

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
        {debug}
      </Toolbar>
      <LinearProgress
        variant="determinate"
        value={(seek / total) * 100}
      ></LinearProgress>
    </div>
  );
};
export default Timer;
