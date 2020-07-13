import Sequence from "./sequence";
import { useContext, useState, useRef, useEffec, useEffect } from "react";
import React from "react";
import LeftNav from "./left-nav";
// import UpdateConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";
import { TheContext } from "./redux/store";
import useChannel from "./useChannel.js"; //react-window-communication-hook";

import FileList from "./filelist";
const ButtonGroup = (props) => <div>{props.children}</div>;

export const IndexPage = (props) => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  useEffect(() => {
    if (!websocket) {
      setWebsocket(new Worker("./wsworker.js"));
    }
  }, []);
  useEffect(() => {
    console.log(wsMessage.lastMessage);
    try {
      const msg = JSON.parse(wsMessages.lastMessage);
      if (msg.type === "filelist") {
        setFiles(msg.data);
      } else if (msg.type === "channellist") {
        setChannels(msg.data);
      }
    }
  }, [wsMessage]);
  useEffect(() => {
    postWsMessage(userEvent);
  }, [userEvent]);
  return (
    <>
      <FileList files={files} channels={channels}></FileList>
      <ButtonGroup></ButtonGroup>
      <Timer></Timer>
      <Sequence newEvent={userEvent} rows={15} cols={20} />

      <Piano
        onUserEvent={(type, freq, time, index) => {
          setUserEvent({
            time: time,
            type: type,
            freq: freq,
            index: index,
          });
          postWsMessage({
            cmd: "compose",
            csv: `${time}, ${type}, ${freq}`,
          });
        }}
      ></Piano>
    </>
  );
};

// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
