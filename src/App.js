import Sequence from "./sequence";
import { useContext, useState, useRef, useEffec, useEffect } from "react";
import React from "react";
import LeftNav from "./left-nav";
// import UpdateConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";

import { useChannel } from "./useChannel";
import FileList from "./filelist";
import { getNotes } from "./audioCtx";
import {Chat} from './console.js';
const ButtonGroup = (props) => <div>{props.children}</div>;

export const IndexPage = (props) => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [timerMsg, postTimer] = useChannel("clock");

  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [seek, setSeek] = useState(0);
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [scheduler, setScheduler] = useState(null);
  const [debug, setDebug] = useState([]);
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
    if (msg.type === "filelist") {
      setFiles(msg.data);
    } else if (msg.type === "channelist") {
      setChannels(msg.data);
    } else if(msg.type==='filecontent'){
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
      <ButtonGroup></ButtonGroup>
      <main style={{width: '80%', minWidth:320, maxWidth:600, margin:"10px auto 60px"}}>
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
          rows={15}
          cols={20}
        />
 

      <Piano
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
     
      <div>
      {debug.map((d) => (
        <div>{d}</div>
      ))}</div>
      </main>
    </>
  );
};
// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
