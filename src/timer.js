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

const Timer = ({ octave, tracks, setSeek, seek }) => {
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

  function userClicked(play) {
    if (play === true) {
      setPlaying(true);
      setSeek(0);

      function playTrack(_tracks, trackLength) {
        loop(0);
        function loop(_seek) {
          setDebug(_seek);
          var startLoop = ctx.currentTime;
          if (!_tracks[_seek]) {
            //chill
          } else {
            Object.keys(_tracks[_seek]).forEach((noteIndex, idx) => {
              const note = _tracks[_seek][noteIndex];
              getNote(note.frequency, octave).triggerEnvelope(note.envelop);
            });
          }
          if (_seek >= trackLength) {
            setPlaying(false);
            return;
          }
          setSeek(_seek + 1);
          const nextNote = tickLength - (ctx.currentTime - startLoop);
          setTimeout(() => loop(_seek + 1), nextNote);
        }
      }
      playTrack(tracks, tracks.length);
    }

    if (play === false) {
      setPlaying(false);
      setSeek(0);
    }
  }

  // () => {
  //   if (playing) {
  //     [track, trackLength] = window.redux().getTrack(); // = window.redux().getStoragedValue("track");
  //     console.log(trackLength + "total");
  //     setTotal(trackLength);
  //     setImmediate(loop);
  //   } else {
  //     timer && cancelAnimationFrame(timer);
  //   }
  // }, [playing]);

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
      <LinearProgress variant="determinate" value={(seek / total) * 100}></LinearProgress>
      <div>{seek * 0.25}</div>
      <div>{debug}</div>
    </div>
  );
};
function mapStateToProps(state) {
  return {
    seek: state.seek,
    tracks: state.tracks,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    setSeek: (num) => dispatch({ type: actions.UPDATE_SEEK, payload: num }),
    onNewNote: (newNote) => dispatch({ type: actions.NEW_NOTE, payload: newNote }),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(Timer);
