import { useState, useEffect, useRef } from "react";
import React from "react";
import { getNote } from "./audioCtx.js";
import { useChannel } from "./useChannel";

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
const Timer = () => {
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
  const [time, setTime] = useState("0:00");
  const [seek, setSeek] =useState(0);
  const prevMsg = usePrevious(msg);

  useEffect(() => {
    if (!playing) {
      postMessage("pause");
    } else {
      postMessage("resume");
    }
  }, [playing]);

  useEffect(() => {
    if (!msg.lastMessage) {
      return;
    }
    if (msg.lastMessage == "load") {
      postMessage(`interval ${tickLength}`);
      return;
    }
    if (msg.lastMessage.time) {
      setTime(msg.lastMessage.time)
    }
    if (msg.lastMessage.note) {
      getNote(msg.lastMessage.notefreq).triggerEnvelope(msg.lastMessage.note.adsr);
    }
  }, [msg.lastMessage]);

  return (
    <div>
      <span ref={toolbarRef}>
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
        <button onClick={(e) =>  postMessage("reset") }>reset</button>

        {playing ? (
          <button onClick={(e) => setPlaying(false)  && postMessage("pause") }>Pause</button>
        ) : (
          <button onClick={(e) => setPlaying(true) && postMessage("start") }>Play</button>
        )}
        <button
          onClick={(e) => {
            postMessage("+10");
          }}
          onDoubleClick={(e) => {
            postMessage("reset");
          }}
        >
          FWD
        </button>
          {msg.lastMessage &&  JSON.stringify(msg.lastMessage)}
      </span><span>{seek}</span>
      <progress value={seek} max="100"></progress>
      <div>{time}</div>
    </div>
  );
};
export default Timer;
