import Sequence from "./sequence";
import { useState, useRef, useEffec, useEffect } from "react";
import React from "react";

import UpdateConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";
import { Terminal } from "./grepawk-v2-ui/index.js";
import { VsCodeLayout } from "./pureui/layout";
import FileList from "./filelist";
const ButtonGroup = () => <div>bt</div>;

export const IndexPage = (props) => {
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  return (
    <VsCodeLayout>
      <ButtonGroup></ButtonGroup>
      <Timer></Timer>
      <FileList></FileList>
      <Sequence newEvent={userEvent} rows={12} cols={20} />

      <div>
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
        <UpdateConfig></UpdateConfig>
      </div>
      <Terminal></Terminal>
    </VsCodeLayout>
  );
};

// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
