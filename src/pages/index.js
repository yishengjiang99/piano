import Sequence from "../components/sequence";
import { useState, useRef, useEffect } from "react";
import EnvelopConfig from "../components/envelop-config";
import Piano from "../components/piano";
import Timer from "../components/timer";
import React from "react";

export const IndexPage = (props) => {
  const [ctx, setCtx] = useState(null);

  const [settings, setSettings] = useState({
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1, //0.01
    },
    volume: {
      min: 0,
      max: 6,
    },
  });
  const [userEvent, setUserEvent] = useState(null);
  const [playPosition, setPlayPosition] = useState({
    tick: 0,
    systemTime: null,
  });
  const [track, setTrack] = useState({});
  const [newNote, setNewNote] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (newNote != null) {
      track[newNote.bar] = track[newNote.bar] || {};
      track[newNote.bar][newNote.noteIndex] = newNote;
      if (newNote.bar > total) {
        setTotal(newNote);
      }
      setTrack(track);
    }
  }, [newNote]);

  function updateAttribute(attribute, value) {
    setSettings({
      ...settings,
      attribute: value,
    });
  }

  return (
    <>
      <details>
        <summary>AM ADSR</summary>
        <EnvelopConfig
          style={{ maxWidth: "200px" }}
          defaults={settings.envelope}
          onInput={updateAttribute}
        ></EnvelopConfig>
      </details>
      <Timer
        playPosition={playPosition}
        total={total}
        track={track}
        gOnTick={({ tick, time }) => {
          setPlayPosition({
            tick: tick,
            systemTime: time,
          });
        }}
      ></Timer>
      <Sequence
        track={track}
        newEvent={userEvent}
        onNewNote={({ frequency, bar, envelope }) => {
          setNewNote({ frequency, bar, envelope });
        }}
        rows={12}
        cols={20}
      />
      <Piano
        track={track}
        onUserEvent={(type, freq, time, index) => {
          setUserEvent({
            time: time,
            type: type,
            freq: freq,
            index: index,
          });
        }}
        octave={3}
      ></Piano>

      <details>
        <summary>Console</summary>
        <div id="console"></div>
      </details>
    </>
  );
};
