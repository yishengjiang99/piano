/* eslint-disable no-unused-vars */
import styles from "./sequence.module.css";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { idxToFreq } from "./sound-keys";
import { useChannel } from "./useChannel.js";

const Sequence = ({
  active,
  instrument,
  setInstrument,
  octave,
  storeNewNote,
  onDeleteNote,
  newEvent,
  rows,
  cols,
  tracks,
  seek,
  onNewNote,
  postWsMessage,
  readNotes,
}) => {
  const [debugMessage, postDebug] = useChannel("debug");

  const [currentBar, setCurrentBar] = useState(-1);
  const [barCursor, setBarCursor] = useState(0);
  const [pendingNotes, setPendingNotes] = useState({});
  const [lastNoteTime, setLastNoteTime] = useState(null);
  const [fftc, postFftc] = useChannel("fftc", 2);
  const [zoomX, setZoomX] = useState(1);
  const canvasRef = useRef();
  const canvasHudRef = useRef();
  const canvasFFTRef = useRef();
  const secondsPerBar = 0.25;
  const BAR_WIDTH = 90;
  const BAR_HEIGHT = 10;
  const canvasWidth = BAR_WIDTH * cols;
  const canvasHeight = BAR_HEIGHT * rows;
  // var canvasWidth, canvasHeight, BAR_WIDTH, BAR_HEIGHT, canvasHudCtx, canvasCtx, canvasFFTCtx;

  // const note_hz = notesOfOctave(octave).concat( notesOfOctave(octave+1)); // notesOfOctave(octave+1)
  // const fftSize = 1024;
  useEffect(() => {
    const _drawAxis = () => {
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx.strokeStyle = "rbga(1,1,1,1)";
      canvasCtx.strokeWidth = "1px";
      for (let i = 0; i < rows; i++) {
        canvasCtx.moveTo(0, i * BAR_HEIGHT);
        canvasCtx.lineTo(canvasWidth, i * BAR_HEIGHT);
        canvasCtx.stroke();
      }
      for (let j = 0; j < cols; j++) {
        canvasCtx.moveTo(j * BAR_WIDTH, 0);
        canvasCtx.lineTo(j * BAR_WIDTH, canvasHeight);
        canvasCtx.stroke();
      }
    };

    const canvasCtx = canvasRef.current.getContext("2d");
    const canvasFFTCtx = canvasFFTRef.current.getContext("2d");
    barCursor > 0 &&
      canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight) &&
      canvasFFTCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    _drawAxis(canvasCtx);
  }, [canvasRef, canvasFFTRef, barCursor, canvasWidth, canvasHeight, rows, cols]);

  function paintABar(paintBar) {
    const canvasCtx = canvasRef.current.getContext("2d");

    if (paintBar.color === "clear") {
      canvasCtx.clearRect(
        (paintBar.bar - barCursor) * BAR_WIDTH,
        paintBar.index * BAR_HEIGHT,
        BAR_WIDTH * (paintBar.length / 250) - 1,
        BAR_HEIGHT - 1
      );
    } else {
      canvasCtx.fillStyle = paintBar.color || "blue";

      canvasCtx.fillRect(
        (paintBar.bar - barCursor) * BAR_WIDTH,
        paintBar.index * BAR_HEIGHT,
        BAR_WIDTH * (paintBar.length / 250) - 1,
        BAR_HEIGHT - 1
      );
    }
  }
  const _canvasClick = (e) => {
    if (!active) {
      setInstrument(instrument);
      return;
    }
    const canvasCtx = canvasRef.current.getContext("2d");
    const [x, y] = [e.nativeEvent.layerX, e.nativeEvent.layerY];

    var blue = canvasCtx.getImageData(x, y, 1, 1).data[2] > 200;
    const noteIndex = Math.floor(y / BAR_HEIGHT);
    const barIndex = Math.floor(x / BAR_WIDTH);
    const note = {
      bar: barIndex,
      index: noteIndex,
      length: 200,
      frequency: idxToFreq(noteIndex % 12, 3 + Math.floor(noteIndex / 12)),
    };

    if (blue) {
      onDeleteNote(barIndex + barCursor, noteIndex);
      paintABar({ ...note, color: "clear" });
    } else {
      paintABar(note);
      onNewNote(note);
    }
  };
  useEffect(() => {
    if (readNotes) {
      const canvasCtx = canvasRef.current.getContext("2d");

      readNotes.split("\n").forEach((line) => {
        line = line.split(",");
        canvasCtx.fillStyle = "blue";
        const bar = parseInt(line[0]); // + .0;
        const index = parseInt(line[2]); // + .0;
        const start = parseFloat(line[3]); // + .0;
        const end = parseFloat(line[4]); // + .0;
        postWsMessage({
          cmd: "readnotes",
          bar,
          index,
          type: "keydown",
          freq: parseFloat(line[1]),
          time: start,
        });
        const length = end - start;

        if (bar >= barCursor && bar < barCursor + cols) {
          canvasCtx.fillRect(
            (bar - barCursor) * BAR_WIDTH,
            index * BAR_HEIGHT,
            BAR_WIDTH * (length / 250) - 1,
            BAR_HEIGHT - 1
          );
        }
      });
    }
  }, [readNotes, postDebug]);
  useEffect(() => {
    if (fftc.lastMessage) {
      const { minDecibels, rmns, dataArray, time, binCount, sampleRate } = fftc.lastMessage;
      const canvasFFTCtx = canvasFFTRef.current.getContext("2d");
      const x0 = (currentBar % cols) * BAR_WIDTH;
      canvasFFTCtx.fillStyle = "black";
      canvasFFTCtx.fillRect(x0, 0, BAR_WIDTH, canvasHeight);
      canvasFFTCtx.clearRect(x0, 0, BAR_WIDTH, canvasHeight);
      var m = 0;
      var _binHeight = canvasHeight / 50;
      for (let i = 0; i < 50; i++) {
        const _binHeight =
          i < 10
            ? canvasHeight / 20
            : i < 20
            ? canvasHeight / 30
            : i < 40
            ? canvasHeight / 40
            : canvasHeight / 100;

        let hue = (i / binCount) * 360;
        canvasFFTCtx.fillStyle = "red";
        var _binWidth = (dataArray[i] / 360) * BAR_WIDTH;
        canvasFFTCtx.fillRect(x0, _binHeight * i, _binWidth, _binHeight);
      }

      // document.getElementById("status").contentText = sum;
    }
  }, [fftc.lastMessage, currentBar, barCursor, canvasHeight]);

  useEffect(() => {
    if (currentBar > 0 && currentBar % cols === 0) {
      requestAnimationFrame(() => {
        const canvasHudCtx = canvasHudRef.current.getContext("2d");
        canvasHudCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        const canvasFFTCtx = canvasFFTRef.current.getContext("2d");
        canvasFFTCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      });
    }
  }, [barCursor]);

  useEffect(() => {
    //key start, release, hold
    if (newEvent === null) {
      return; // false
    }
    function painNote({ bar, index, attackLength }) {
      requestAnimationFrame(() => {
        postDebug("attack length " + attackLength);
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.fillRect(
          (bar % cols) * BAR_WIDTH,
          index * BAR_HEIGHT,
          (BAR_WIDTH * attackLength) / 250 - 1,
          BAR_HEIGHT - 1
        );
      });
    }
    const { type, time, start, freq, index, duration, instrument } = newEvent;
    postDebug([type, time, start, duration].join("--"));
    const idx_symbol = Symbol(index);
    let isInit = pendingNotes[idx_symbol] === null;
    const envelop = pendingNotes[idx_symbol] || { start: time, release: null };

    switch (type) {
      case "keydown":
      case "mousedown":
        if (!lastNoteTime || time - lastNoteTime > secondsPerBar) {
          requestAnimationFrame(function () {
            const canvasHudCtx = canvasHudRef.current.getContext("2d");
            canvasHudCtx.fillStyle = "rgba(0,111,0,0.3)";
            canvasHudCtx.clearRect(0, 0, ((currentBar + 1) % cols) * BAR_WIDTH, canvasHeight);
            canvasHudCtx.fillRect(
              ((currentBar + 1) % cols) * BAR_WIDTH,
              0,
              BAR_WIDTH,
              canvasHeight
            );
            setCurrentBar((prev) => prev + 1);
            setBarCursor((barCursor) => {
              if (currentBar - barCursor >= cols) {
                return barCursor + cols;
              } else {
                return barCursor;
              }
            });
            setLastNoteTime(time);
          });
        }
        envelop.start = time;
        pendingNotes[idx_symbol] = envelop;
        postWsMessage({
          cmd: "keyboard",
          bar: currentBar,
          time,
          freq,
          index,
          instrument,
          type: "keypress",
        });

        break;
      // eslint-disable-next-line no-fallthrough
      case "keypress":
        envelop.hold = time;
        if (!envelop.start) envelop.start = time;

        postWsMessage({
          cmd: "keyboard",
          bar: currentBar,
          time,
          freq,
          instrument,
          index,
          type: "keypress",
        });
        break;
      case "mouseup":
      case "keyup":
        postWsMessage({
          cmd: "keyboard",
          bar: currentBar,
          time,
          freq,
          instrument,
          index,
          type: "keyup",
        });
        const starttime =
          (pendingNotes[idx_symbol] && pendingNotes[idx_symbol].start) || time - 125;
        painNote({ bar: currentBar, index, attackLength: time - starttime });
        onNewNote({
          ...newEvent,
          type: "compose",
          bar: currentBar,
          adsr: [starttime, time],
        });
        setPendingNotes(pendingNotes);
        break;
      default:
        postDebug(type + " " + time);
        break;
    }

    return function cleanup() {
      console.log(pendingNotes);
      //   postDebug(JSON.stringify(pendingNotes));
    };
  }, [newEvent]);

  return (
    <>
      <div
        className={styles.gridContainer}
        style={{
          backgroundColor: "rbga(33,33,33,03)",
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
      <div>
        {currentBar}|{barCursor}
      </div>
    </>
  );
};

function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}
export default Sequence;
