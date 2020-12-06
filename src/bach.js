import { Note } from "@material-ui/icons";
import React, { useEffect, useLayoutEffect, useRef, useState, useReducer } from "react";
import useAnimationTime from "./useAnimationTime";
const minNote = 22;
const maxNote = 82;
const msShownOnScreen = 20000;
let tempo = 124;
const n16Time = 60000 / tempo / 8;

export const Screen = function ({ newNote }) {
  const [clockState, { start, stop, reset }] = useAnimationTime();
  const sheet = useRef(null);
  const [loading, setLoading] = useState(false);
  const [[screenWidth, screenHeight], setWH] = useState([110, 110]);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [onScreenNotes, dispatch] = useReducer((state, action) => {}, []);
  useEffect({}, [newNote]);
  useLayoutEffect(() => {
    if (
      screenWidth !== containerRef.current.clientWidth ||
      screenHeight !== containerRef.current.clientHeight
    ) {
      setWH([containerRef.current.clientWidth, containerRef.current.clientHeight]);
      svgRef.current.setAttribute(
        "viewport",
        `0 0 ${containerRef.current.clientWidth} ${containerRef.current.clientHeight}`
      );
      svgRef.current.setAttribute("width", containerRef.current.clientWidth);
      svgRef.current.setAttribute("height", containerRef.current.clientHeight);
    }
  });
  const Bar = ({ nt, midi, nl }) => {
    const noteTime = n16Time * nt;
    const h = screenHeight / (maxNote - minNote);
    const y = (midi - minNote) * h;
    const t0 = clockState.clock || 0;
    const x = ((t0 - noteTime) * screenWidth) / msShownOnScreen + screenWidth / 2;
    const xTranslate = ((clockState.clockt - t0) * screenWidth) / msShownOnScreen;
    const w = ((nl * n16Time) / msShownOnScreen) * screenWidth;

    return (
      <rect
        x={x}
        y={screenHeight - y}
        fill="red"
        height={h}
        width={w}
        tranform={`translateX(${xTranslate})`}
      ></rect>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: "black", color: "white", width: "100vw", height: "100vh" }}
    >
      <div class="cp" style={{ position: "fixed", top: 20, left: 20 }}>
        <span>Now: {clockState.clock}</span>
        <button onClick={() => (clockState.running ? stop() : start())}>
          {clockState.running ? "stop" : "start"}
        </button>
        <button onClick={() => reset()}>{"reset"}</button>
      </div>
      <svg ref={svgRef}>
        <text>{screenWidth}</text>
        {Bar({
          nt: 0,
          nl: 4,
          midi: 44,
        })}
      </svg>
    </div>
  );
};
