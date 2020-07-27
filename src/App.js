import Sequence from "./sequence";
import { useContext, useState, useReducer, useEffect } from "react";
import React from "react";

import Piano from "./piano";
import Timer from "./timer";

import { useChannel } from "./useChannel";
import FileList from "./filelist";
import { getNotes, _settings, updateSettings } from "./audioCtx";
const ButtonGroup = (props) => <div>{props.children}</div>;
const ControlPanel = ({ settings, dispatch }) => (
  <div class="cp">
    <table>
      <tr>
        <td>Osc3</td>
        <td>1</td>
        <td>2</td>
        <td>3</td>
      </tr>
      <tr>
        <td>Type</td>
        {[0, 1, 2].map((idx) => (
          <td>
            {" "}
            {["sine", "square", "br", "sawtooth", "triangle"].map((option) => {
              // eslint-disable-next-line no-unused-expressions
              if (option == "br") return <br />;
              return (
                <button
                  onClick={() => {
                    dispatch({ idx: idx, key: "osc3", value: option });
                  }}
                >
                  {option}
                </button>
              );
            })}
          </td>
        ))}
      </tr>
      {["harmonicity", "delay", "detune"].map((attribute) => (
        <tr>
          <td>{attribute}</td>
          {[0, 1, 2].map((idx) => {
            return (
              <td>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(e) => {
                    dispatch({ idx: idx, key: attribute, value: e.target.value });
                  }}
                  value={settings[attribute][idx]}
                ></input>
              </td>
            );
          })}
        </tr>
      ))}
    </table>
  </div>
);

export const IndexPage = (props) => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [timerMsg, postTimer] = useChannel("clock");
  const [octave, setOctve] = useState(3);

  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [seek, setSeek] = useState(0);
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [scheduler, setScheduler] = useState(null);
  const [debug, setDebug] = useState([]);

  const updateSettingReducer = (prevState, update) => {
    const { key, idx, value } = update;
    const mergedRow = (prevState[key][idx] = value);
    postWsMessage({ key, idx, value });
    return {
      ...prevState,
      ...{ key: mergedRow },
    };
  };
  const [settings, dispatch] = useReducer(updateSettingReducer, _settings);

  useEffect(() => {
    if (!websocket) {
      setWebsocket(new Worker("./wsworker.js"));
    }
    if (!scheduler) {
      setScheduler(new Worker("./offlinetimer.js"));
    }
  }, []);
  useEffect(() => {
    const msg = wsMessage.lastMessage;
    if (!msg) return;
    if (msg.type === "fileList") {
      setFiles(msg.data);
    } else if (msg.type === "channeList") {
      setChannels(msg.data);
    } else if (msg.type === "filecontent") {
      setDebug(debug.concat(JSON.stringify(msg)));
    }
  }, [wsMessage]);

  useEffect(() => {
    const msg = timerMsg.lastMessage;
    if (!msg) return;
    if (msg.type === "debug") {
      setDebug(debug.concat(JSON.stringify(msg)));
    }
    if (msg.cmd === "tick") {
      setSeek(msg.n);
    }
  }, [timerMsg]);
  // max-width: 600px; margin: 40px auto 60px
  const handleUserEvent = (type, freq, time, index) => {
    setUserEvent({
      cmd: "compose",
      time: time,
      type: type,
      freq: freq,
      index: index,
    });
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr" }}>
      <FileList files={files} channels={channels}></FileList>
      <main>
        <ButtonGroup></ButtonGroup>
        <Timer seek={seek}></Timer>
        <Sequence
          seek={seek}
          onNewNote={(note) => {
            note.cmd = "compose";
            postWsMessage(note);
          }}
          onDeleteNote={(bar, noteIndex) => {
            postWsMessage({ cmd: "delete", bar, noteIndex });
          }}
          postMessage={postTimer}
          newEvent={userEvent}
          rows={44}
          cols={10}
        />
      </main>
      <side>
        <ControlPanel settings={settings} dispatch={dispatch}></ControlPanel>
        <Piano octave={octave} onUserEvent={handleUserEvent}></Piano>
      </side>
    </div>
  );
};
