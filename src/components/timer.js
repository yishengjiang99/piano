import { useState, useEffect, useRef, Component } from "react";
import { LinearProgress } from "@material-ui/core";
import {
  FastRewind,
  FastForward,
  PlayCircleFilledSharp,
  PauseCircleFilledSharp,
} from "@material-ui/icons";
import React from "react";
import { getContext, getNote, ensureAudioCtx } from "../lib/audioCtx.js";
import { IconButton, Toolbar } from "@material-ui/core";
import { keyboardToFreq } from "../lib/sound-keys.js";

const Timer = (props) => {
  const [debug, setDebug] = useState("");

  const defaults = {
    bpm: 120, //120 quarter notes per minute.. and we tick twice per beat
    noteLength: 1 / 4,
    resolution: 1 / 8,
    total: 100,
  };
  const { bpm, noteLength, resolution, gOnTick, playPosition, tracks, total } = {
    ...defaults,
    ...props,
  };

  const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;

  const [seek, setSeek] = useState(0);
  const [ctx, setCtx] = useState(null);
  const [playing, setPlaying] = useState(false);
  const toolbarRef = useRef();
  var timer;

  const fromTop = () => {
    ensureAudioCtx().then((audioCtx) => {
      var now = audioCtx.currentTime;
      var n = 0;
      function loop(time) {
        if (time - now > tickLength) {
          var bar = n / 2;
          if (bar == playPosition || bar - playPosition < 2) {
            Object.keys(tracks[playPosition]).forEach((noteIdx) => {
              var note = keyboardToFreq(noteIdx);
              getNote(note, 3).triggerEnvelope(note.envelope);
            });
            playPosition++;
            gOnTick(playPosition, ctx.currentTime);
          }
          now = time;
          n++;
        }
        timer = requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    });
  };

  useEffect(() => {
    if (playing) {
      debugger;
      var now = ctx.currentTime;
      function loop() {
        if (ctx.currentTime - now > tickLength) {
          var bar = bar || 0;
          Object.keys(tracks[playPosition]).forEach((noteIdx) => {
            var note = keyboardToFreq(noteIdx);
            getNote(note, 3).triggerEnvelope(note.envelope);
          });
          playPosition++;
          gOnTick(playPosition, ctx.currentTime);
          now = ctx.currentTime;
        }
        timer = requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(timer);
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
        {debug}
      </Toolbar>
      <LinearProgress variant="determinate" value={(playPosition / total) * 100}></LinearProgress>
    </div>
  );
};
export default Timer;
