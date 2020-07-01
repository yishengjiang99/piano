import Sequence from "./sequence";
import { useState, useRef, useEffect } from "react";
import React from "react";

import EnvelopConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";

export const IndexPage = (props) => {
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
  const [total, setTotal] = useState(0);
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
        tracks={track}
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
        onNewNote={function (newNote) {
          window.redux().addNoteToTrack(newNote);
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
