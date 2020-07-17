import React from "react";
import { useOsc3, notes } from "../index";
import { useState, useCallback } from "react";

export function Example({ ctx }) {
  const [getNote, setSettings] = useOsc3(ctx);

  return (
    <h3>
      <button
        onClick={(e) => {
          activateAudio();
        }}
      >
        strt
      </button>
      <span> Ctx: {(ctx && ctx.state) || "none"}</span>
      <button
        onMouseDown={(e) => {
          e.note = getNote([notes[2]]);
          e.note.trigger();
        }}
        onMouseUp={(e) => {
          e.note.triggerRelease();
        }}
      >
        C
      </button>
      <button
        onMouseDown={(e) => {
          e.note = getNote([notes[1]]);
          e.note.trigger();
        }}
        onMouseUp={(e) => {
          e.note.triggerRelease();
        }}
      >
        S
      </button>
    </h3>
  );
}
