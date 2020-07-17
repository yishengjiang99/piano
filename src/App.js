import Sequence from "./sequence";
import { useState, useRef, useEffect } from "react";
import { useOsc3, useAudioContext } from "./processors/";
import React from "react";
import Piano from "./piano";
import Timer from "./timer";
import { useChannel } from "./useChannel";
import FileList from "./filelist";

const ButtonGroup = (props) => <div>{props.children}</div>;

export const IndexPage = () => {
  const ctx = useAudioContext();
  const [getNotes, updateSettings] = useOsc3(ctx);
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
  const onUserEvent = (type, freq, time, index) => {
    setUserEvent({
      cmd: "compose",
      time: time,
      type: type,
      freq: freq,
      index: index,
    });
  };

  return (
    <>
      <div ref={consolee}>
        {debug.split("\n").map((d) => (
          <div>{d}</div>
        ))}
      </div>
      <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>
      <ButtonGroup></ButtonGroup>
      <div className={styles.main}>

        <Timer seek={seek}></Timer>
        <Sequence
          getNote={getNotes}
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
          rows={24}
          cols={20}
        />
      </div>

      <Piano octave={3} onUserEvent={onUserEvent}></Piano>
    </>
  );
};
// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
