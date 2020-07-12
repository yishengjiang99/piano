import styles from "./sequence.module.css";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { getContext, getNote } from "./audioCtx";
import { idxToFreq } from "./sound-keys";
import { connect, actions } from "./redux/store.js";
const secondsPerBar = 0.25;
var canvasWidth, canvasHeight, cellWidth, cellHeight, canvasHudCtx, canvasCtx;
function mapStateToProps(state) {
  return {
    tracks: state.tracks,
    seek: state.seek,
    octave: state.octave,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    storeNewNote: (newNote) => dispatch({ type: actions.NEW_NOTE, payload: newNote }),
    onDeleteNote: (x, y) => dispatch({ type: actions.DELETE_NOTE, barIndex: x, noteIndex: y }),
  };
}
const Sequence = ({ octave, storeNewNote, onDeleteNote, newEvent, rows, cols, tracks, seek }) => {
  const [currentBar, setCurrentBar] = useState(-1);
  const [barCursor, setBarCursor] = useState(0);
  const [lastNoteTime, setLastNoteTime] = useState(0);
  const [paintBar, setPaintBar] = useState(null);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState("");
  const [ctx, setCtx] = useState(null);
  const [pendingNotes, setPendingNotes] = useState({});

  var updateTimer, audioCtx;
  const canvasRef = useRef();
  const canvasHudRef = useRef();
  const pushNote = async (note, _ctx) => {
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
      if (pendingNote.envelope) pendingNote.envelope.hold();
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
      note.bar = bar;

      note.length = note.time - pendingNote.time;
      note.envelope = pendingNote.envelope;
      pendingNote.envelope.triggerRelease();
      note.adsr = pendingNote.envelope.cloneShape();
      storeNewNote(note);
    }

    if (bar - barCursor > cols) {
      setBarCursor(barCursor + cols);
    }
    if (note.length > 0.0001) {
      setPaintBar(note);
    }
    setMsg(seek + "GG");
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
    const [x, y] = [e.nativeEvent.layerX, e.nativeEvent.layerY];
    const noteIndex = Math.floor(y / cellHeight);
    const barIndex = Math.floor(x / cellWidth);
    const note = { bar: barIndex, index: noteIndex, length: 200 };

    if (tracks[barIndex + barCursor] && tracks[barIndex + barCursor][noteIndex] !== null) {
      onDeleteNote(barIndex + barCursor, noteIndex);
      setPaintBar({ ...note, color: "gray" });
    } else {
      setPaintBar(note);
      storeNewNote(note);
    }
  };

  useEffect(() => {
    //on mount
    _resizeCanvas();
    window.onresize = _resizeCanvas();
    canvasCtx = canvasRef.current.getContext("2d");
    canvasHudCtx = canvasHudRef.current.getContext("2d");
    _drawAxis();
  }, []);

  useEffect(() => {
    //on new note played
    // canvasCtx = canvasRef.current.getContext("2d");
    if (paintBar !== null) {
      canvasCtx.fillStyle = paintBar.color || "blue";

      canvasCtx.fillRect(
        (paintBar.bar - barCursor) * cellWidth,
        paintBar.index * cellHeight,
        cellWidth * (paintBar.length / 250) - 1,
        cellHeight - 1
      );
    }
  }, [paintBar]);
  useEffect(() => {
    canvasHudCtx.fillStyle = "rgba(0,111,0,0.3)";
    canvasHudCtx.clearRect(0, 0, currentBar * cellWidth, canvasHeight);

    canvasHudCtx.fillRect(currentBar * cellWidth, 0, cellWidth, canvasHeight);
  }, [currentBar]);
  useEffect(() => {
    canvasHudCtx.fillStyle = "rgba(0,111,0,0.3)";
    canvasHudCtx.clearRect(0, 0, seek * cellWidth, canvasHeight);

    canvasHudCtx.fillRect(seek * cellWidth, 0, cellWidth, canvasHeight);
  }, [seek]);
  useEffect(() => {
    barCursor > 0 && canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    _drawAxis();
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
      ensureAudioCtx().then((audioCtx) => {
        pushNote(newEvent, audioCtx);
      });
    }
  }, [newEvent]);
  return (
    <>
      <div className="hud">
        {msg} {currentBar}
        {JSON.stringify(paintBar)}
      </div>
      <div
        className={styles.gridContainer}
        style={{
          height: "auto",
          width: "auto",
          backgroundColor: "gray",
          position: "relative",
          height: rows * 20,
          width: cols * 35,
        }}
      >
        <canvas
          key={11}
          style={{ position: "absolute" }}
          ref={canvasRef}
          onClick={(e) => _canvasClick(e)}
          height={rows * 20}
          width={cols * 35}
        ></canvas>
        <canvas
          key={33}
          style={{ position: "relative" }}
          ref={canvasHudRef}
          onClick={_canvasClick}
          height={rows * 20}
          width={cols * 35}
        ></canvas>
      </div>
      <div></div>
    </>
  );
};

function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export default connect(mapStateToProps, mapDispatchToProps)(Sequence);
