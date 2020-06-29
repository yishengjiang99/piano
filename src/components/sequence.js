import styles from "./sequence.module.css";
import React from "react";

import { useState, useEffect, useRef } from "react";
const notes = [
  261.63,
  277.18,
  293.66,
  311.13,
  329.63,
  349.23,
  369.99,
  392,
  415.3,
  440,
  466.16,
  493.88,
];
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
const Sequence = ({ newEvent, postTrack, rows, cols }) => {
  const [track, setTrack] = useState({});
  const [currentBar, setCurrentBar] = useState(-1);
  const [barCursor, setBarCursor] = useState(0);
  const [lastNoteTime, setLastNoteTime] = useState(0);
  const [paintBar, setPaintBar] = useState(null);
  const [playbackState, setPlaybackState] = useState(PlaybackStateEnum.initial);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState("");

  const [pendingNotes, setPendingNotes] = useState({});

  var updateTimer, audioCtx;
  const toolbarRef = useRef();
  const canvasRef = useRef();
  const pushNote = (note) => {
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
    if (note.type == "keydown") {
      pendingNotes[note.index] = note;
      setPendingNotes(pendingNotes);
    } else if (note.type !== "keydown") {
      var pendingNote = pendingNotes[note.index];
      if (pendingNote) {
        note.length = note.time - pendingNote.time;
      }
      if (note.type === "keyup") {
        delete pendingNotes[note.index];
      }
    }

    const noteIndex = note.index;
    track[bar] = track[bar] || {};
    track[bar][note.index] = note;

    if (bar - barCursor > cols) {
      //paginate
      setBarCursor(barCursor + cols);
    }
    if (note.length) {
      note.bar = bar;

      setPaintBar(note);
      setLog(
        log +
          "\n painting " +
          note.bar +
          "|" +
          note.index +
          " length " +
          note.length
      );
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
  useEffect(() => {
    //on mount
    _resizeCanvas();

    canvasCtx = canvasRef.current.getContext("2d");
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
    //key start, release, hold
    if (newEvent !== null) {
      pushNote(newEvent);
    }
  }, [newEvent]);

  const pauseTimer = () => {
    setPlaybackState(PlaybackStateEnum.paused);
    cancelAnimationFrame(updateTimer);
  };
  const playback = () => {
    postTrack({
      track: track,
      events: eventz,
    });
    setPlaybackState(PlaybackStateEnum.playing);
  };
  return (
    <>
      <div className="hud">{currentBar}</div>
      <div
        className={styles.gridContainer}
        style={{ height: "auto", width: "auto", backgroundColor: "gray" }}
      >
        <canvas ref={canvasRef} height={rows * 20} width={cols * 20}></canvas>
      </div>
      <div style={{ position: "fixed", bottom: 10 }}>{log}</div>
    </>
  );
};
function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export default Sequence;
