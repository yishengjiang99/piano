import Sequence from "./sequence";
import { useState, useReducer, useEffect } from "react";
import React from "react";
import Piano from "./piano";
import Timer from "./timer";
import SimplePopover from "./popover";
import { useChannel } from "./useChannel";
import FileList from "./filelist";
import { _settings, passThrough, noteCache } from "./audioCtx";
import { ControlPanel, ADSR, Volumes } from "./ControlPanel.js";
import AppBar from "./AppBar";
import { keys, notesOfOctave } from "./sound-keys.js";


export const IndexPage = ({ windowUserEvent }) => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [timerMsg, postTimer] = useChannel("clock");
  const [octave, setOctave] = useState(3);

  const [debugMessage, postDebug] = useChannel("debug", 20);
  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [seek, setSeek] = useState(0);
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [scheduler, setScheduler] = useState(null);
  const [debug, setDebug] = useState([]);
  const [audioState, setAudioState] = useState({
    peak: 0
  })
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
  }, [scheduler, websocket]);
  useEffect(() => {
    const msg = wsMessage.lastMessage;
    if (!msg) return;
    if (msg.cmd === "fileList") {
      msg.data && msg.data.length && setFiles(msg.data);
    } else if (msg.cmd === "channeList") {
      msg.data && msg.data.length && setChannels(msg.data);
    } else if (msg.cmd === "filecontent") {
      setDebug(debug.concat(JSON.stringify(msg)));
    }
  }, [debug, wsMessage.lastMessage]);

  useEffect(() => {
    const msg = timerMsg.lastMessage;
    if (!msg) return;

    if (msg.cmd === "tick") {
      setSeek(msg.n);
    }
  }, [timerMsg, setDebug, setSeek, debug]);
  // max-width: 600px; margin: 40px auto 60px

  useEffect(
    (evt) => {
      const handleUserEvent = (evt) => {
        let index = evt.target.dataset["index"] || (evt.key && keys.indexOf(evt.key));

        if (evt.keyCode && evt.keyCode === "[") setOctave(Math.min(octave + 1, 7));
        if (evt.keyCode && evt.keyCode === "]") setOctave(Math.math(octave - 1, 1));

        if (index >= 0) {
          console.log(evt);
          setUserEvent({
            cmd: "keyboard",
            type: evt.type,
            time: evt.timeStamp,
            start: evt._targetInsta && evt._targetInst.actualStartTime,
            duration: evt._targetInst && evt._targetInst.actualDuration,
            freq: notesOfOctave(octave)[index],
            index: index,
          });
          evt.preventDefault();
        }
      };
      windowUserEvent && handleUserEvent(windowUserEvent);
    },
    [windowUserEvent, octave]
  );


  const _sudo = (evt) => {
    const input = evt.target.value;
    alert(input);
  };
  return (
    <>
      <AppBar>
        <SimplePopover title="OSCx3">
          <ControlPanel settings={settings} dispatch={dispatch}></ControlPanel>
        </SimplePopover>
        <SimplePopover title="Envelop">
          <ADSR settings={settings} dispatch={dispatch}></ADSR>
        </SimplePopover>
        <SimplePopover title="compression">
          <Volumes settings={settings} dispatch={dispatch}></Volumes>
        </SimplePopover>
        <span>
          <button
            onClick={(e) => {
              if (octave >= 5) {
                alert("no");
                return;
              }
              setOctave(octave + 1);
            }}
          >
            +
          </button>
          Oct {octave}
          <button
            onClick={(e) => {
              if (octave < 1) {
                alert("no");
                return;
              }
              setOctave(octave - 1);
            }}
          >
            -
          </button>
        </span>
      </AppBar>
      <div
        style={{
          marginTop: 76,
          display: "grid",
          gridColumnGap: 10,
          gridTemplateColumns: "1fr  2fr 2fr",
        }}
      >


        <div>
          <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>
          {audioState.peak}<meter value={audioState.peak} max="100"></meter>
        </div>
        <main>
          <h2>
            <input type={"text"} contentEditable={true} oninput={_sudo} value="mix sound" />
          </h2>
          <Sequence
            seek={seek}
            //  postWsMessage={postWsMessage}
            onNewNote={(note) => {
              note.cmd = "compose";
              postWsMessage(note);
            }}
            onDeleteNote={(bar, noteIndex) => {
              postWsMessage({ cmd: "delete", bar, noteIndex });
            }}
            postWsMessage={postWsMessage}
            postMessage={postTimer}
            newEvent={userEvent}
            rows={30}
            cols={10}
            ocatave={octave}
          />
          <Timer seek={seek}></Timer>
          <Piano octave={octave}></Piano>

        </main>
        <div id="console" style={{ height: 699, overflowY: "scroll" }}>
          <p>
            <b>{debugMessage.lastMessage}</b>

          </p>
          {Object.keys(noteCache).map(key => {
            return <p>{key} {noteCache[key].toString()} </p>
          })}

          {debugMessage.messages.splice(-20).map((line) => (
            <div>{line}</div>
          ))}
        </div>
      </div>
    </>
  );
};
