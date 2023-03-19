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
const worker = new Worker("timer_2.js");
const defaults = {
  bpm: 120, //120 quarter notes per minute.. and we tick twice per beat
  noteLength: 1 / 4,
  resolution: 1 / 4,
  trackLength: 40,
};
const { bpm, noteLength, trackLength, resolution } = defaults;
const tickLength = ((60 * 1000) / bpm / noteLength) * resolution;

const Timer = () => {
  const workerRef = useRef(worker);
  console.log(workerRef.current);

  const [playing, setPlaying] = useState(false);
  const toolbarRef = useRef();
  const [time, setTime] = useState("0:00");
  const [seek, setSeek] = useState(0);
  useEffect(() => {
    const worker = workerRef.current;
    worker.onmessagerror = console.err;
    worker.onerror = console.err;
    worker.onmessage = (e) => {
      if (e.data.time) {
        setTime(e.data.time);
      }
      if (e.data.tick) {
        setSeek(e.data.tick);
      } else if (e.data === "onload") {
        worker.postMessage(`interval ${tickLength}`);
      }
    };
    return function cleanUp() {
      worker.removeEventListener("message", this);
    };
  }, []);

  return (
    <div>
      <span ref={toolbarRef}>
        <button onClick={(e) => postMessage("reset")}>reset</button>
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
        {playing ? (
          <button
            onClick={(e) => {
              workerRef.current.postMessage("pause");
            }}
          >
            Pause
          </button>
        ) : (
          <button onClick={(e) => workerRef.current.postMessage("start")}>Play</button>
        )}

        <button
          onClick={(e) => {
            workerRef.current.postMessage("+10");
            workerRef.current.postMessage("start");
          }}
          onDoubleClick={(e) => {
            workerRef.current.poostMessage("reset");
          }}
        >
          FWD
        </button>
      </span>
      <div>
        <progress value={seek} max="100"></progress>
        <span>{seek}</span>
        <span>{time}</span>
      </div>
    </div>
  );
};
export default Timer;
