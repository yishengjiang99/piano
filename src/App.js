import Sequence from "./sequence";
<<<<<<< HEAD
import {useState, useReducer, useEffect} from "react";
import React from "react";
=======
import {useContext, useState, useReducer, useEffect} from "react";
import React from "react";
import {Popover} from "@material-ui/core";
>>>>>>> master
import Piano from "./piano";
import Timer from "./timer";
import SimplePopover from "./popover";
import {useChannel} from "./useChannel";
import FileList from "./filelist";
import {_settings} from "./audioCtx";
import {ControlPanel, ADSR} from "./ControlPanel.js";
import AppBar from "./AppBar";
<<<<<<< HEAD
import {keys, notesOfOctave} from "./sound-keys.js";

const ButtonGroup = (props) => <div>{props.children}</div>;
=======
>>>>>>> master

export const IndexPage = ({windowUserEvent}) => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [timerMsg, postTimer] = useChannel("clock");
  const [debugMessage, postDebug] = useChannel("debug", 20)
  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [seek, setSeek] = useState(0);
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [scheduler, setScheduler] = useState(null);
  const [debug, setDebug] = useState([]);

  const updateSettingReducer = (prevState, update) => {
    const {key, idx, value} = update;

    const mergedRow = (prevState[key][idx] = value);
    postWsMessage({key, idx, value});
    return {
      ...prevState,
      ...{key: mergedRow},
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
<<<<<<< HEAD
  }, [debug, wsMessage.lastMessage]);
=======
  }, [wsMessage.lastMessage]);
>>>>>>> master

  useEffect(() => {
    const msg = timerMsg.lastMessage;
    if (!msg) return;

    if (msg.cmd === "tick") {
      setSeek(msg.n);
    }
  }, [timerMsg, setDebug, setSeek, debug]);
  const [octave, setOctave] = useState(3);
  // max-width: 600px; margin: 40px auto 60px

  useEffect((evt) => {
    const handleUserEvent = evt => {
      let index = evt.target.dataset["index"] || (evt.key && keys.indexOf(evt.key));

      if (evt.keyCode && evt.keyCode === "+") setOctave(Math.min(octave + 1, 7))
      if (evt.keyCode && evt.keyCode === "-") setOctave(Math.math(octave - 1, 1))

      if (index >= 0) {
        console.log(evt);
        setUserEvent({
          cmd: "keyboard",
          type: evt.type,
          time: evt.timeStamp,
          start: evt._targetInsta && evt._targetInst.actualStartTime,
          duration: evt._targetInst && evt._targetInst.actualDuration,
          freq: notesOfOctave(octave)[index],
          index: index
        })
        evt.preventDefault();
      }
    };
    windowUserEvent && handleUserEvent(windowUserEvent);
  }, [windowUserEvent, octave]);


  const _sudo = (evt) => {
    const input = evt.target.value;
    alert(input);
  }
  return (
    <>
      <AppBar>
        <SimplePopover title="OSCx3">
          <ControlPanel settings={settings} dispatch={dispatch}></ControlPanel>
        </SimplePopover>
        <SimplePopover title="Envelop">
          <ADSR settings={settings} dispatch={dispatch}></ADSR>
        </SimplePopover>
      </AppBar>
      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridColumnGap: 10,
          gridTemplateColumns: "1fr  2fr 2fr",
        }}
      >
<<<<<<< HEAD
        <div style={{display: "grid", marginTop: 30, gridTemplateRow: "1fr"}}>
          <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>
        </div>
=======

>>>>>>> master
        <main>
          <h2>
            <input type={"text"} contentEditable={true} oninput={_sudo} value='mix sound' />
          </h2>
          <Sequence
            seek={seek}
            //  postWsMessage={postWsMessage}
            onNewNote={(note) => {
              note.cmd = "compose";
              postWsMessage(note);
            }}
            onDeleteNote={(bar, noteIndex) => {
              postWsMessage({cmd: "delete", bar, noteIndex});
            }}
            postWsMessage={postWsMessage}
            postMessage={postTimer}
            newEvent={userEvent}
            rows={30}
            cols={10}
          />
          <Timer seek={seek}></Timer>
        </main>
<<<<<<< HEAD
        <div id='console' style={{height: 699, overflowY: 'scroll'}}>
          <p><div><b>{debugMessage.lastMessage}</b></div></p>

          {debugMessage.messages.splice(-20).map(line => <div>{line}</div>)}
        </div>
      </div>
      <Piano octave={octave}></Piano>
=======
        <side style={{display: "grid", marginTop: 30, gridTemplateRow: "1fr,1fr,1fr"}}>
          <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>
          <ControlPanel settings={settings} dispatch={dispatch}></ControlPanel>
          <ADSR settings={settings} dispatch={dispatch}></ADSR>
        </side>
      </div>
      <Piano octave={3} onUserEvent={handleUserEvent}></Piano>
>>>>>>> master
    </>
  );
};
