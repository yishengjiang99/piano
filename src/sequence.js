import styles from "./sequence.module.css";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { getContext, getNote, getNotes } from "./audioCtx";
import { idxToFreq, keyboardToFreq, notesOfOctave } from "./sound-keys";
import { connect, actions } from "./redux/store.js";
import { useChannel } from "./useChannel.js";
const secondsPerBar = 0.25;
const BAR_WIDTH = 90;
const BAR_HEIGHT = 20;
var canvasWidth, canvasHeight, cellWidth, cellHeight, canvasHudCtx, canvasCtx, canvasFFTCtx;

function mapStateToProps(state) {
  return {
    octave: state.octave,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    storeNewNote: (newNote) => dispatch({ type: actions.NEW_NOTE, payload: newNote }),
    // onDeleteNote: (x, y) => dispatch({ type: actions.DELETE_NOTE, barIndex: x, noteIndex: y }),
  };
}
const Sequence = ({
  octave,
  storeNewNote,
  onDeleteNote,
  newEvent,
  rows,
  cols,
  tracks,
  seek,
  onNewNote,
}) => {
  const [currentBar, setCurrentBar] = useState(-1);
  const [barCursor, setBarCursor] = useState(0);
  const [lastNoteTime, setLastNoteTime] = useState(0);
  const [paintBar, setPaintBar] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [pendingNotes, setPendingNotes] = useState({});
  const [fftc, postFftc] = useChannel("fftc");

  const [zoomX, setZoomX] = useState(1);
  const canvasRef = useRef();
  const canvasHudRef = useRef();
  const canvasFFTRef = useRef();

  // const note_hz = notesOfOctave(octave).concat( notesOfOctave(octave+1)); // notesOfOctave(octave+1)
  // const fftSize = 1024;

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
        return;
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
        return;
      }
      note.bar = bar;
      pendingNote.envelope.triggerRelease();
      note.length = note.time - pendingNote.time;
      note.adsr = pendingNote.envelope.cloneShape();
      pendingNote.envelope.status = "recycle";

      delete note.envelop;
      onNewNote(note);
    }

    if (bar - barCursor >= cols) {
      setBarCursor(barCursor + cols);
    }
    if (note.length > 0.0001) {
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
    const [x, y] = [e.nativeEvent.layerX, e.nativeEvent.layerY];

    var blue = canvasCtx.getImageData(x, y, 1, 1).data[2] > 200;
    console.log(blue);
    const noteIndex = Math.floor(y / cellHeight);
    const barIndex = Math.floor(x / cellWidth);
    const note = {
      bar: barIndex,
      index: noteIndex,
      length: 200,
      frequency: idxToFreq(noteIndex % 12, 3 + Math.floor(noteIndex / 12)),
    };

    if (blue) {
      onDeleteNote(barIndex + barCursor, noteIndex);
      setPaintBar({ ...note, color: "clear" });
    } else {
      setPaintBar(note);
      onNewNote(note);
      // getNotes([note.frequency]).trigger();
    }
  };
  useEffect(() => {
    if (fftc.lastMessage) {
      const { minDecibels, rmns, dataArray, time, binCount, sampleRate } = fftc.lastMessage;
      // var normalize = Array(rows).fill(0);
      // dataArray.map( (v,idx) => {
      //   const hz = sampleRate/2/binCount;
      //   const midi = 12 * Math.log2( hz/440);
      //   const bin = midi - octave*12;
      //   if(bin>=0 && bin<rows) normalize[idx] += v;
      // })

      const x0 = (currentBar - barCursor) * BAR_WIDTH;
      canvasFFTCtx.fillStyle = "black";
      canvasFFTCtx.fillRect(x0, 0, cellWidth, canvasHeight);
      canvasFFTCtx.clearRect(x0, 0, cellWidth, canvasHeight);
      const _binHeight = canvasHeight / binCount;
      for (let i = 0; i < binCount; i++) {
        let hue = (i / binCount) * 360;
        canvasFFTCtx.fillStyle = "red";
        var _binWidth = (dataArray[i] / 127) * cellWidth * 2;
        canvasFFTCtx.fillRect(x0, _binHeight * i, _binWidth, _binHeight);
        //canvasFFTCtx.strokeText(rmns, x0, i*cellHeight, 100);
        if (i == 33) {
          canvasFFTCtx.strokeText(_binWidth, 55, 33, 100); //, i*cellHeight, 100);
        }
      }

      canvasFFTCtx.strokeText(rmns, 0, 10, 100);
      // document.getElementById("status").contentText = sum;
    }
  }, [fftc.lastMessage, currentBar]);

  useEffect(() => {
    //on mount
    _resizeCanvas();
    window.onresize = _resizeCanvas();
    canvasCtx = canvasRef.current.getContext("2d");
    canvasHudCtx = canvasHudRef.current.getContext("2d");
    canvasFFTCtx = canvasFFTRef.current.getContext("2d");
    _drawAxis();
  }, []);

  useEffect(() => {
    //on new note played
    // canvasCtx = canvasRef.current.getContext("2d");
    if (paintBar !== null) {
      if (paintBar.color == "clear") {
        canvasCtx.clearRect(
          (paintBar.bar - barCursor) * cellWidth,
          paintBar.index * cellHeight,
          cellWidth * (paintBar.length / 250) - 1,
          cellHeight - 1
        );
      } else {
        canvasCtx.fillStyle = paintBar.color || "blue";

        canvasCtx.fillRect(
          (paintBar.bar - barCursor) * cellWidth,
          paintBar.index * cellHeight,
          cellWidth * (paintBar.length / 250) - 1,
          cellHeight - 1
        );
      }
    }
  }, [paintBar]);
  useEffect(() => {
    canvasHudCtx.fillStyle = "rgba(0,111,0,0.3)";
    canvasHudCtx.clearRect(0, 0, currentBar * cellWidth, canvasHeight);

    canvasHudCtx.fillRect(currentBar * cellWidth, 0, cellWidth, canvasHeight);
    canvasFFTCtx.fillStyle = "rgba(0,111,0,0.0)";
    canvasFFTCtx.clearRect(currentBar * cellWidth, 0, cellWidth, canvasHeight);

    postMessage({ n: currentBar, cmd: "tick" });
  }, [currentBar]);
  useEffect(() => {
    if (barCursor !== ~~(seek - 1) / cols) setBarCursor(~~((seek - 1) / cols));
    canvasHudCtx.fillStyle = "rgba(0,111,0,0.3)";
    canvasHudCtx.clearRect(0, 0, ((seek - 1) % cols) * cellWidth, canvasHeight);

    canvasHudCtx.fillRect(((seek - 1) % cols) * cellWidth, 0, cellWidth, canvasHeight);
  }, [seek]);
  useEffect(() => {
    barCursor > 0 &&
      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight) &&
      canvasFFTCtx.clearRect(0, 0, canvasWidth, canvasHeight);
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
      <div className="hud"></div>
      <div
        className={styles.gridContainer}
        style={{
          height: "auto",
          width: "auto",
          backgroundColor: "rbga(0,0,0,0)",
          position: "relative",
          height: rows * BAR_HEIGHT,
          width: cols * BAR_WIDTH * zoomX,
        }}
      >
        <canvas
          key={11}
          style={{ position: "absolute" }}
          ref={canvasRef}
          onClick={(e) => _canvasClick(e)}
          height={rows * BAR_HEIGHT}
          width={cols * BAR_WIDTH * zoomX}
        ></canvas>
        <canvas
          key={313}
          style={{ position: "absolute", zIndex: -1 }}
          ref={canvasFFTRef}
          onClick={(e) => _canvasClick(e)}
          height={rows * BAR_HEIGHT}
          width={cols * BAR_WIDTH * zoomX}
        ></canvas>
        <canvas
          key={533}
          style={{ position: "relative" }}
          ref={canvasHudRef}
          onClick={_canvasClick}
          height={rows * BAR_HEIGHT}
          width={cols * BAR_WIDTH * zoomX}
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
