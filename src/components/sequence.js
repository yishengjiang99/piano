import styles from "./sequence.module.css";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { getContext, getNote } from "../lib/audioCtx";
const PlaybackStateEnum = {
  initial: 0,
  recording: 1,
  paused: 2,
  playing: 3,
  ended: 4,
};
var eventz = [];
const secondsPerBar = 0.25;
var canvasWidth, canvasHeight, cellWidth, cellHeight, canvasCtx;
const Sequence = ({ track, onNewNote, onDeleteNote, newEvent, rows, cols }) => {
  const [currentBar, setCurrentBar] = useState(-1);
  const [barCursor, setBarCursor] = useState(0);
  const [lastNoteTime, setLastNoteTime] = useState(0);
  const [paintBar, setPaintBar] = useState(null);
  const [playbackState, setPlaybackState] = useState(PlaybackStateEnum.initial);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState("");
  const [ctx, setCtx] = useState(null);
  const [pendingNotes, setPendingNotes] = useState({});

  var updateTimer, audioCtx;
  const canvasRef = useRef();
  const pushNote = async (note, _ctx) => {
    if (playbackState === PlaybackStateEnum.playing) {
      setMsg("cannot push note during playback");
      return;
    }

    let bar = currentBar;
    if (note.type == "keydown" && note.time - lastNoteTime > secondsPerBar) {
      bar = currentBar + 1;
      setCurrentBar(bar);
      setLastNoteTime(note.time);
    }
    if (note.type == "keypress") {
      var pendingNote = pendingNotes[note.index];
      if (!pendingNote) {
        throw new Error("pending note for " + note.index + "not found");
      }
      if (note.time - lastNoteTime > secondsPerBar) {
        note.length = pendingNote.time - note.time;
        setPaintBar(note);
        bar = currentBar + 1;
        setCurrentBar(bar);
        setLastNoteTime(lastNoteTime + secondsPerBar);
      }
    } else if (note.type == "keydown") {
      pendingNotes[note.index] = note;
      pendingNotes[note.index].start = note.time;
      pendingNotes[note.index].envelope = getNote(note.freq);
      pendingNotes[note.index].envelope.trigger();
      setPendingNotes(pendingNotes);
    } else if (note.type == "keyup") {
      var pendingNote = pendingNotes[note.index];
      if (!pendingNote) {
        throw new Error("pending note for " + note.index + "not found");
      }

      note.length = note.time - pendingNote.time;
      if (note.type === "keyup") {
        pendingNote.envelope.triggerRelease();
        onNewNote({
          bar: bar,
          noteIndex: note.index,
          envelop: [pendingNote.envelope.cloneShape()],
        });

        delete pendingNotes[note.index];
      } else {
        pendingNote.extension = pendingNote.extension || [];
        pendingNote.extention.push(note.time);
        if (pendingNote.envelope) pendingNote.envelope.hold();
      }
    }

    if (bar - barCursor > cols) {
      //paginate
      setBarCursor(barCursor + cols);
    }
    if (note.length > 0.04) {
      note.bar = bar;
      setPaintBar(note);
    }
  };

  const _resizeCanvas = () => {
    canvasWidth = canvasRef.current.parentElement.clientWidth;
    cellWidth = canvasWidth / cols;
    canvasHeight = canvasRef.current.parentElement.clientHeight;
    cellHeight = canvasHeight / rows;
    canvasRef.current.setAttribute("width", canvasWidth);
    canvasRef.current.setAttribute("height", canvasHeight);
  };
  const _drawAxis = () => {
    canvasCtx.strokeStyle = "rbga(1,1,1,1)";
    canvasCtx.strokeWidth = "1px";
    for (let i = 0; i < rows; i++) {
      canvasCtx.moveTo(0, i * cellHeight);
      canvasCtx.lineTo(canvasWidth, i * cellHeight);
      canvasCtx.stroke();
    }
    for (let j = 0; j < cols; j++) {
      canvasCtx.moveTo(j * cellWidth, 0);
      canvasCtx.lineTo(j * cellWidth, canvasHeight);
      canvasCtx.stroke();
    }
  };
  const _canvasClick = (e) => {
    const [x, y] = [e.clientX, e.clientY];
    const noteIndex = Math.floor(y / cellHeight);
    const barIndex = Math.floor(x / cellWidth);

    if (track[barIndex + barCursor][noteIndex] !== null) {
      delete track[barIndex + barCursor][noteIndex];
      setPaintBar({ bar: barIndex, index: noteIndex, color: "gray" });
    } else {
      track[barIndex + barCursor][noteIndex] = 1;
      setPaintBar({ bar: barIndex, index: noteIndex });
    }
    onNewNote({ bar: barIndex, index: noteIndex, envelop: [] });
  };

  useEffect(() => {
    //on mount
    _resizeCanvas();
    window.onresize = _resizeCanvas();
    canvasCtx = canvasRef.current.getContext("2d");

    _drawAxis();
  }, []);

  useEffect(() => {
    //on new note played
    // canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.fillStyle = "blue";
    if (paintBar !== null) {
      canvasCtx.fillRect(
        (paintBar.bar - barCursor) * cellWidth,
        paintBar.index * cellHeight,
        cellWidth - 1,
        cellHeight - 1
      );
      setMsg(
        "paining now: " +
          [
            paintBar.bar * cellWidth,
            paintBar.index * cellHeight,
            cellWidth - 1,
            cellHeight - 1,
          ].join(", ")
      );
    }
  }, [paintBar]);
  useEffect(() => {
    barCursor > 0 && canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight) && _drawAxis();
  }, [barCursor]);
  useEffect(() => {
    async function ensureAudioCtx() {
      if (ctx == null || ctx.state === "paused") {
        const audioCtx = await getContext();
        setCtx(audioCtx);
        return audioCtx;
      }
      return ctx;
    }
    //key start, release, hold
    if (newEvent !== null) {
      if (newEvent.type == "keydown" && newEvent.repeat == true) {
        newEvent.type = "keypress";
      }
      setMsg(
        Object.keys(newEvent)
          .map((k) => `${k}:${newEvent[k]}`)
          .join(",")
      );
      setLog(log + "\n" + newEvent.type);
      ensureAudioCtx().then((audioCtx) => {
        pushNote(newEvent, audioCtx);
      });
    }
  }, [newEvent]);

  return (
    <>
      <div className="hud">{currentBar}</div>
      <div
        className={styles.gridContainer}
        style={{ height: "auto", width: "auto", backgroundColor: "gray" }}
      >
        <canvas
          ref={canvasRef}
          onClick={_canvasClick}
          height={rows * 20}
          width={cols * 20}
        ></canvas>
      </div>
      <div style={{ position: "fixed", bottom: 54 }}>
        {log.split("\n").forEach((l) => (
          <div>{l}</div>
        ))}
      </div>
    </>
  );
};
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export default Sequence;
