import Sequence from "./sequence";
import { useContext, useState, useRef, useEffec, useEffect } from "react";
import React from "react";
import LeftNav from "./left-nav";
// import UpdateConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";
import { TheContext } from "./redux/store";
// import FileList from "./filelist";
const ButtonGroup = () => <div>bt</div>;

export const IndexPage = (props) => {
  const [userEvent, setUserEvent] = useState(null);
  // const [newNote, setNewNote] = useState(null);
  const { state, dispatch } = useContext(TheContext);

  const [websocket, setWebsocket] = useState(null);
  return (
    <>
      <ButtonGroup>
        <button>button1</button>
        <button>button1</button>
      </ButtonGroup>
      <Timer></Timer>
      <Sequence
        // onNewNote={(note) => {
        //   setNewNote(note);
        // }}
        newEvent={userEvent}
        rows={15}
        cols={20}
      />

      <Piano
        onUserEvent={(type, freq, time, index) => {
          setUserEvent({
            time: time,
            type: type,
            freq: freq,
            index: index,
          });
        }}
      ></Piano>
      <div>aaa{JSON.stringify(state.tracks)}</div>
    </>
  );
};

// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
