import Sequence from "./sequence";
import { useState, useRef, useEffect } from "react";
import React from "react";
// import UpdateConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";

import { useChannel } from "./useChannel";
import FileList from "./filelist";
import { getNotes } from "./audioCtx";
const ButtonGroup = (props) => <div>{props.children}</div>;

export const IndexPage = () => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [timerMsg, postTimer] = useChannel("clock");

  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [seek, setSeek] = useState(0);
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [scheduler, setScheduler] = useState(null);
  const [debug, setDebug] = useState("");
  useEffect(() => {
    if (!websocket) {
      setWebsocket(new Worker("./wsworker.js"));
    }
    if (!scheduler) {
      setScheduler(new Worker("./offlinetimer.js"));
    }
  }, [websocket, scheduler]);
  useEffect(() => {
    const msg = wsMessage.lastMessage;
    if (!msg) return;
    if (msg.type === "filelist") {
      setFiles(msg.data);
    } else if (msg.type === "channelist") {
      setChannels(msg.data);
    }
  }, [wsMessage]);
  useEffect(() => {
    const msg = timerMsg.lastMessage;
    if (!msg) return;
    if (msg.type === "debug") {
      setDebug(debug + "\n" + JSON.stringify(msg));
    }
    if (msg.cmd === "tick") {
      setSeek(msg.n);
      if (msg.notes && msg.notes.length > 0) {
        setDebug(debug + "\n" + JSON.stringify(msg.notes));
        getNotes(msg.notes.map((n) => n.freq)).triggerEnvelope(msg.notes[0].adsr);
      }
    }
  }, [timerMsg, debug]);
  const consolee = useRef("console");
  return (
    <>
      <div ref={consolee}>
        {debug.split("\n").map((d) => (
          <div>{d}</div>
        ))}
      </div>
      <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>
      <ButtonGroup></ButtonGroup>
      <Timer seek={seek}></Timer>
      <Sequence
        seek={seek}
        onNewNote={(note) => {
          note.cmd = "compose";
          postWsMessage(note);
        }}
        onDeleteNote={(bar, noteIndex) => {
          postWsMessage({ cmd: "date", bar, noteIndex });
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
    </>
  );
};
// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
