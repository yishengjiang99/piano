import Sequence from "./sequence";
import { useContext, useState, useReducer, useEffect } from "react";
import React from "react";
import { Popover } from "@material-ui/core";
import Piano from "./piano";
import Timer from "./timer";
import SimplePopover from "./popover";
import { useChannel } from "./useChannel";
import FileList from "./filelist";
import { getNotes, _settings, updateSettings } from "./audioCtx";
import { ControlPanel, ADSR } from "./ControlPanel.js";
import AppBar from "./AppBar";
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
      cmd: "keyboard",
      time: time,
      type: type,
      freq: freq,
      index: index,
    });
    postWsMessage({
      cmd: "keyboard",
      time: time,
      type: type,
      freq: freq,
      index: index,
    });
  };
  return (
    <>
      <div
        style={{
          margin: 50,
          display: "grid",
          gridColumnGap: 10,
          gridTemplateColumns: "1fr 2fr 1fr",
        }}
      >
        <AppBar>
          <SimplePopover title="OSCx3">
            <ControlPanel settings={settings} dispatch={dispatch}></ControlPanel>
          </SimplePopover>
          <SimplePopover title="Envelop">
            <ADSR settings={settings} dispatch={dispatch}></ADSR>
          </SimplePopover>
        </AppBar>
        <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>
        <main>
          <h3>mix sound</h3>
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
            rows={30}
            cols={10}
          />
          <Timer seek={seek}></Timer>
        </main>
        <side style={{ display: "grid", marginTop: 30, gridTemplateRow: "1fr, 1fr, 1fr" }}>
          <Piano octave={3} onUserEvent={handleUserEvent}></Piano>
        </side>
      </div>
    </>
  );
};
