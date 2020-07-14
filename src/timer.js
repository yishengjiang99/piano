import { useState, useEffect, useRef } from "react";
import { LinearProgress } from "@material-ui/core";

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
const Timer = ({ seek }) => {
  const defaults = {
    bpm: 120, //120 quarter notes per minute.. and we tick twice per beat
    noteLength: 1 / 4,
    resolution: 1 / 4,
  };
  const { bpm, noteLength, resolution } = defaults;
  const { trackLength, setTrackLength } = useState(40);
  const [msg, postMessage] = useChannel("clock");
  const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;
  const [playing, setPlaying] = useState(false);
  const toolbarRef = useRef();
  const prevMsg = usePrevious(msg);
  useEffect(() => {
    if (!playing) {
      postMessage("pause");
    } else {
      postMessage("resume");
    }
  }, [playing]);

  useEffect(() => {
    if (msg == prevMsg) return;
    if (!msg.lastMessage) {
      return;
    }
    if (msg.lastMessage == "load") {
      postMessage(`interval ${tickLength}`);
      return;
    }
    if (msg.lastMessage.n) {
    }
    if (msg.lastMessage.note) {
      getNote(msg.lastMessage.notefreq).triggerEnvelope(msg.lastMessage.note.adsr);
    }
  }, [msg]);

  return (
    <div>
      <Toolbar ref={toolbarRef}>
        <button
          onClick={(e) => {
            postMessage("-10");
          }}
          onDoubleClick={(e) => {
            postMessage("reset");
          }}
        >
          back
        </button>
        {playing === true ? (
          <button onClick={(e) => setPlaying(false)}>Pause</button>
        ) : (
          <button onClick={(e) => setPlaying(true)}>Play</button>
        )}
        <button
          onClick={(e) => {
            postMessage("-10");
          }}
          onDoubleClick={(e) => {
            postMessage("reset");
          }}
        >
          FWD
        </button>
      </Toolbar>
      <progress value={seek} max="100"></progress>
      <div>{((seek * tickLength) / 1000).toFixed(2)}</div>
    </div>
  );
};
export default Timer;
