import Sequence from "./sequence";
import { useContext, useState, useReducer, useEffect, useeRf } from "react";
import React from "react";

import Piano from "./piano";
import Timer from "./timer";

import { useChannel } from "./useChannel";
import FileList from "./filelist";
import { getNotes, _settings, updateSettings } from "./audioCtx";
const ButtonGroup = (props) => <div>{props.children}</div>;

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
    const msg = wsMessage.lastMessage;
    if (!msg) return;
    if (msg.type === "filelist") {
      setFiles(msg.data);
    } else if (msg.type === "channelist") {
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
  return (
    <>
      <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>

      <main style={{ width: "80%", minWidth: 320, margin: "20px 200px 60px 200px" }}>
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
          rows={24}
          cols={10}
        />
      </main>

      <Piano
        octave={octave}
        onUserEvent={(type, freq, time, index) => {
          setUserEvent({
            cmd: "compose",
            time: time,
            type: type,
            freq: freq,
            index: index,
          });
        }}
      ></Piano>
      <div
        style={{ position: "fixed", right: "5em", top: "20%", display: "inline-flex" }}
        class="cp"
      >
        {[0, 1, 2].map((idx) => {
          return (
            <span style={{ marginLeft: "2em" }}>
              <h4>Oscillator {idx}: </h4>
              <div> {settings.osc3[idx]}</div>
              <div>
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
              </div>

              <h4>OverTone: {settings.harmonicity[idx]}</h4>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                onInput={(e) => {
                  dispatch({ idx: idx, key: "harmonicity", value: e.target.value });
                }}
                value={settings.harmonicity[idx]}
              ></input>

              <h4>delay: {settings.delay[idx]}</h4>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                onInput={(e) => {
                  dispatch({ idx: idx, key: "delay", value: e.target.value });
                }}
                value={settings.delay[idx]}
              ></input>
            </span>
          );
        })}
      </div>
      <div>
        {debug.map((d) => (
          <div>{d}</div>
        ))}
      </div>
    </>
  );
};
// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
