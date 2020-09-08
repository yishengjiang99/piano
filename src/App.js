import Sequence from "./sequence";
import { useState, useReducer, useEffect } from "react";
import React from "react";
import Piano from "./piano";
import Timer from "./timer";
import SimplePopover from "./popover";
import { useChannel } from "./useChannel";
import FileList from "./filelist";
import { _settings } from "./audioCtx";
import { ControlPanel, ADSR, Volumes, OctaveControl } from "./ControlPanel.js";
import AppBar from "./AppBar";
import { keys, notesOfOctave } from "./sound-keys.js";
import { SvgBar } from './svg';
import { Screen } from './bar';

export const IndexPage = ({ windowUserEvent }) => {
  const [wsMessage, postWsMessage] = useChannel("wschannel");
  const [timerMsg, postTimer] = useChannel("clock");
  const [octave, setOctave] = useState(3);

  const [debugMessage, postDebug] = useChannel("debug", 20);
  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [seek, setSeek] = useState(0);
  const [userEvent, setUserEvent] = useState(null);
  const [remoteEvent, setRemoteEvent] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  const [scheduler, setScheduler] = useState(null);
  const [debug, setDebug] = useState([]);
  const [readNotes, setReadNotes] = useState();
  const [instrument, setInstrument] = useState("piano");
  const [audioState, setAudioState] = useState({
    peak: 0
  })
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
  }, [scheduler, websocket]);

  useEffect(() => {
    if (!wsMessage) return;
    const msg = wsMessage.lastMessage;
    if (!msg) return;
    if (msg.cmd === "fileList") {
      msg.data && msg.data.length && setFiles(msg.data);
    } else if (msg.cmd === "channeList") {
      msg.data && msg.data.length && setChannels(msg.data);
    } else if (msg.cmd === "filecontent") {
      setReadNotes(msg.data);
    }
  }, [debug, wsMessage.lastMessage]);

  useEffect(() => {
    const msg = timerMsg.lastMessage;
    if (!msg) return;

    if (msg.cmd === "tick") {
      setSeek(msg.n);
    }
    if (msg.cmd === "audioState") {
      setAudioState(msg)
    }
  }, [timerMsg, setDebug, setSeek, debug]);
  // max-width: 600px; margin: 40px auto 60px

  useEffect(
    (evt) => {
      const handleUserEvent = (evt) => {
        let index = evt.target.dataset["index"] || (evt.key && keys.indexOf(evt.key));

        if (evt.keyCode && evt.keyCode === "[") setOctave(Math.min(octave + 1, 7));
        if (evt.keyCode && evt.keyCode === "]") setOctave(Math.math(octave - 1, 1));

        if (index >= 0) {
          setUserEvent({
            cmd: "keyboard",
            type: evt.type,
            time: evt.timeStamp,
            start: evt._targetInsta && evt._targetInst.actualStartTime,
            duration: evt._targetInst && evt._targetInst.actualDuration,
            freq: notesOfOctave(octave)[index],
            index: index,
            instrument: instrument
          });
          evt.preventDefault();
        }
      };
      windowUserEvent && handleUserEvent(windowUserEvent);
    },
    [windowUserEvent, octave]
  );


  const _sudo = (evt) => {
    const input = evt.target.value;
    alert(input);
  };
  return (
    <>
      <Screen></Screen>
      <AppBar>
        <SimplePopover title="OSCx3">
          <ControlPanel settings={settings} dispatch={dispatch}></ControlPanel>
        </SimplePopover>
        <SimplePopover title="Envelop">
          <ADSR settings={settings} dispatch={dispatch}></ADSR>
        </SimplePopover>
        <SimplePopover title="compression">
          <Volumes settings={settings} dispatch={dispatch}></Volumes>
        </SimplePopover>
        <OctaveControl setOctave={setOctave} octave={octave}></OctaveControl>
        ws:{wsMessage.total} timermsg: {timerMsg.total}
      </AppBar>
      <div
        style={{
          marginTop: 76,
          display: "grid",
          gridColumnGap: 10,
          gridTemplateColumns: "1fr  2fr 2fr",
        }}
      >
        <div>
          <SvgBar width={200} label='rms' value={audioState.rms}></SvgBar>

          <FileList postMessage={postWsMessage} files={files} channels={channels}></FileList>
          {audioState.peak}<meter value={audioState.peak} max="100"></meter>
        </div>
        <main>
          <h2>
            <input type={"text"} contentEditable={true} onInput={_sudo} value="mix sound" />
          </h2>
          {['getLPSaw', 'getPianoNote', 'getDrums'].map(_instrument => {
            return (
              <Sequence
                instrument={_instrument}
                active={_instrument === instrument}
                seek={seek}
                //  postWsMessage={postWsMessage}
                onNewNote={(note) => {
                  note.cmd = "compose";
                  postWsMessage(note);
                }}
                onDeleteNote={(bar, noteIndex) => {
                  postWsMessage({ cmd: "delete", bar, noteIndex });
                }}
                postWsMessage={postWsMessage}
                postMessage={postTimer}
                newEvent={userEvent && userEvent.instrument === _instrument && userEvent}
                readNotes={readNotes}
                setInstrument={setInstrument}
                rows={12}
                cols={10}
                ocatave={octave}
              />
            )
          })}

          <Timer seek={seek}></Timer>
          <SimplePopover onClick={() => setInstrument("piano")} title='piano'><Piano octave={octave}></Piano></SimplePopover>


        </main>
        <div id="console" style={{ height: 699, overflowY: "scroll" }}>
          <p>
            <b>{debugMessage.lastMessage}</b>

          </p>


          {debugMessage.messages.splice(-20).map((line) => (
            <div>{line}</div>
          ))}
        </div>
      </div>
    </>
  );
};
