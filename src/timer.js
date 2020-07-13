import { useState, useEffect, useRef } from "react";
import { LinearProgress } from "@material-ui/core";
import {
  FastRewind,
  FastForward,
  PlayCircleFilledSharp,
  PauseCircleFilledSharp,
} from "@material-ui/icons";
import React from "react";
import { getNote } from "./audioCtx.js";
import { IconButton, Toolbar } from "@material-ui/core";
import { connect, actions } from "./redux/store.js";
import { useChannel } from "./useChannel";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
var timer;
const Timer = ({ octave, tracks, setSeek, seek, trackLength }) => {
  const defaults = {
    bpm: 120, //120 quarter notes per minute.. and we tick twice per beat
    noteLength: 1 / 4,
    resolution: 1 / 4,
  };
  const { bpm, noteLength, resolution } = defaults;

  const [messageState, postMessage] = useChannel("clock");
  const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;
  const [playing, setPlaying] = useState(false);
  const toolbarRef = useRef();

  const bitmap = new Array(50).fill(new Array(20).fill(null));
  const prevSeek = usePrevious(seek);

  useEffect(
    (messageState) => {
      if (!messageState) {
        postMessage({ interval: tickLength });
      } else if (messageState.lastMessage.n) {
        setSeek(messageState.lastMessage.n);
      } else {
        postMessage({ interval: tickLength });
      }
    },
    [messageState]
  );

  useEffect(() => {
    if (seek !== prevSeek && playing) {
      Object.values(bitmap[seek]).forEach((note) => {
        if (note == null) return;
        if (note.adsr) {
          getNote(note.freq).triggerEnvelop(note.adsr);
        } else {
          getNote(note.freq).trigger();
        }
      });
    }
    if (seek >= trackLength) postMessage("pause");
  }, [seek, prevSeek, playing, trackLength, postMessage, bitmap]);

  useEffect(() => {
    if (!timer) {
      timer = new Worker("./offlinetimer.js");
    }
  }, []);

  function userClicked(play) {
    if (play) {
      setPlaying(true);
      setSeek(0);
      postMessage("start");
      tracks.forEach((note) => {
        bitmap[note.bar][note.index] = note;
      });
    } else {
      setPlaying(false);
      postMessage("stop");
    }
  }

  return (
    <div>
      <Toolbar ref={toolbarRef}>
        <IconButton>
          <FastRewind
            onClick={(e) => {
              postMessage("reset");
            }}
          />
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
