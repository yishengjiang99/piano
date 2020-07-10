import Sequence from "./sequence";
import { useState, useRef, useEffec, useEffect } from "react";
import React from "react";

import UpdateConfig from "./envelop-config";
import Piano from "./piano";
import Timer from "./timer";
import { TagView } from "./audioCtx";
import { Terminal } from "./grepawk-v2-ui/index.js";

export const IndexPage = (props) => {
  const [settings, setSettings] = useState({
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1, //0.01
    },
    volume: {
      min: 0,
      max: 6,
    },
  });
  const [userEvent, setUserEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);

  function updateAttribute(attribute, value) {
    setSettings({
      ...settings,
      attribute: value,
    });
  }

  return (
    <>
      <Timer></Timer>
      <Sequence newEvent={userEvent} rows={12} cols={20} />
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

      <details>
        <summary>Console</summary>
        <Terminal></Terminal>
      </details>
      <TagView></TagView>
      <UpdateConfig
        style={{ maxWidth: "200px" }}
        defaults={settings.envelope}
        onInput={updateAttribute}
      ></UpdateConfig>
    </>
  );
};

// export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
