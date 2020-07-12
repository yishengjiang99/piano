import styles from "./Piano.module.css";
import React, { useEffect, useState, createRef, Component, useRef } from "react";
import { keys, blackKeys, notes, keynotes, keyboardToFreq } from "./sound-keys.js";
import { store, connect, actions } from "./redux/store.js";

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    syncEvents: function (e) {
      dispatch({ type: actions.SYNC_KEYBOARD, payload: e });
    },
    setOctave: function (v) {
      dispatch({ type: actions.UPDATE_OCTAVE, payload: v });
    },
  };
};
const Piano = ({ syncEvents, onUserEvent, octave }) => {
  const octaves = [octave, octave + 1];
  const keyRefMap = keys.map((key, index) => createRef());
  let _onUserEvent = (type, freq, time, keyindex) => {
    onUserEvent(type, freq, time, keyindex);

    syncEvents({
      type,
      freq,
      time,
      keyindex,
    });
  };
  useEffect(() => {
    window.onkeydown = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = notes[index];
      if (e.repeat == true) {
        _onUserEvent("keypress", freq, e.timeStamp, index);
      } else {
        _onUserEvent("keydown", freq, e.timeStamp, index);
      }
      e.target.classList.add("pressed");
    };
    window.onkeyup = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = notes[index];
      _onUserEvent("keyup", freq, e.timeStamp, index);
    };
    window.onkeypress = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = notes[index];
      _onUserEvent("keypress", freq, e.timeStamp, index);

      e.target.classList.remove("pressed");
    };
  }, []);

  return (
    <ul className={styles.list}>
      {keys.map((key, index) => (
        <li
          data-note={notes[index]}
          className={
            blackKeys.indexOf(key) >= 0
              ? `${styles.keyblack} ${styles[keynotes[index]]}`
              : `${styles.keywhite} ${styles[keynotes[index]]}`
          }
          key={index}
          ref={keyRefMap[index]}
          onMouseDown={(e) => onUserEvent("keydown", keyboardToFreq(key, octave), index, octave)}
          onMouseUp={(e) => onUserEvent("onkeyup", keyboardToFreq(key, octave), index, octave)}
          onTouchStart={(e) => onUserEvent("keydown", keyboardToFreq(key, octave), index, octave)}
          onTouchEnd={(e) => onUserEvent("keyup", keyboardToFreq(key, octave), index, octave)}
        ></li>
      ))}
    </ul>
  );
};
export default connect(mapStateToProps, mapDispatchToProps)(Piano);
