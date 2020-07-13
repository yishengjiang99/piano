import { useState, useEffect, useRef, Component } from "react";
import { LinearProgress } from "@material-ui/core";
import {
  FastRewind,
  FastForward,
  PlayCircleFilledSharp,
  PauseCircleFilledSharp,
} from "@material-ui/icons";
import React from "react";
import { getNote, ensureAudioCtx } from "./audioCtx.js";
import { IconButton, Toolbar } from "@material-ui/core";
import { connect, actions } from "./redux/store.js";
import SelectInput from "@material-ui/core/Select/SelectInput";

const Timer = ({ octave, tracks, setSeek, seek, trackLength }) => {
  const defaults = {
    bpm: 120, //120 quarter notes per minute.. and we tick twice per beat
    noteLength: 1 / 4,
    resolution: 1 / 4,
  };

  const { bpm, noteLength, resolution } = defaults;
  const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;
  const [debug, setDebug] = useState([]);
  const [total, setTotal] = useState(5);
  const [ctx, setCtx] = useState(null);
  const [playing, setPlaying] = useState(false);
  const toolbarRef = useRef();
  var timer;

  async function userClicked(play) {
    if (play) {
      setPlaying(true);
      const bitmap = new Array(222).fill(new Array(20).fill(null));

      tracks.forEach((note) => {
        bitmap[note.bar][note.index] = note;
      });
      var position = 0;
      while (position < trackLength) {
        var startLoop = ctx.currentTime;
        bitmap[position]
          .filter((v) => v !== null)
          .map((n) => getNote(n.freq).triggerEnvelope(n.adsr));

        //    setSeek(seek + 1);
        const nextNote = tickLength - (ctx.currentTime - startLoop);

        await sleep(nextNote - 1);
      }
    }
    if (play === false) {
      setPlaying(false);
      setSeek(0);
    }
  }

  useEffect(() => {
    ensureAudioCtx().then((audioCtx) => {
      setCtx(audioCtx);
    });
  });
  return (
    <div>
      <Toolbar ref={toolbarRef}>
        <IconButton>
          <FastRewind />
        </IconButton>
        {playing === true ? (
          <IconButton onClick={(e) => userClicked(false)}>
            <PauseCircleFilledSharp />
          </IconButton>
        ) : (
          <IconButton onClick={(e) => userClicked(true)}>
            <PlayCircleFilledSharp />
          </IconButton>
        )}
        <IconButton>
          <FastForward />
        </IconButton>
      </Toolbar>
      <LinearProgress variant="determinate" value={(seek / trackLength) * 100}></LinearProgress>
      <div>
        {seek} of {trackLength * tickLength}
      </div>
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    seek: state.seek,
    tracks: state.tracks,
    trackLength: state.trackLength,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setSeek: (num) => console.trace(num) && dispatch({ type: actions.UPDATE_SEEK, payload: num }),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Timer);
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
