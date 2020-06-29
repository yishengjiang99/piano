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
  const [userEventHistory, setUserEventHistory] = useState([]);
  const [userEvent, setUserEvent] = useState(null);
  useEffect(() => {
    if (userEvent !== null)
      setUserEventHistory(userEventHistory.concat(userEvent));
  }, [userEvent]);

  const pianoRef = useRef();

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
      <Timer newEvent={userEvent}></Timer>
      <Sequence
        newEvent={userEvent}
        postTrack={({ track, events }) => {
          pianoRef.current.replayEvents(events);
        }}
        rows={12}
        cols={20}
      />
      <Piano
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
        <div id="console">
          {userEventHistory.map((event) => {
            return (
              <p>
                {event.type} {event.time} {event.freq}
              </p>
            );
          })}
        </div>
      </details>
    </>
  );
};
