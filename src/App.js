import Sequence from "./sequence";
import { useContext, useState, useRef, useEffec, useEffect } from "react";
import React from "react";
import LeftNav from "./left-nav";
// import UpdateConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";
import { TheContext } from "./redux/store";

import { useChannel } from "./useChannel";
import FileList from "./filelist";

const ButtonGroup = (props) => <div>{props.children}</div>;

export const IndexPage = (props) => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [scheduler, setScheduler] = useState(null);

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
    } else if (msg.type === "channellist") {
      setChannels(msg.data);
    }
  }, [wsMessage]);
  // useEffect(() => {
  //   postWsMessage(userEvent);
  // }, [userEvent]);
  return (
    <>
      <FileList files={files} channels={channels}></FileList>
      <ButtonGroup></ButtonGroup>
      <Timer></Timer>
      <Sequence
        onNewNote={(note) => {
          note.cmd = "compose";
          postWsMessage(note);
        }}
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
