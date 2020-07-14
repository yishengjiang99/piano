import styles from "./Piano.module.css";
import React, { useEffect, useState, createRef, Component, useRef } from "react";
import { keys, blackKeys, notes, keynotes, keyboardToFreq } from "./sound-keys.js";
import { actions, connect } from "./redux/store";

const Piano = ({ syncEvents, onUserEvent, octave }) => {
  const octaves = [octave, octave + 1];
  const keyRefMap = keys.map((key, index) => createRef());

  useEffect(() => {
    window.onkeydown = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = notes[index];
      if (e.repeat == true) {
        onUserEvent("keypress", freq, e.timeStamp, index);
      } else {
        onUserEvent("keydown", freq, e.timeStamp, index);
      }
      e.target.classList.add(styles.pressed);
    };
    window.onkeyup = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = notes[index];
      onUserEvent("keyup", freq, e.timeStamp, index);
    };
    window.onkeypress = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = notes[index];
      onUserEvent("keypress", freq, e.timeStamp, index);

      e.target.classList.remove(styles.pressed);
    };
  }, []);
  const className = (index, key) =>
    blackKeys.indexOf(key) > -1
      ? `${styles.keyblack} ${styles[keynotes[index]]}`
      : `${styles.keywhite} ${styles[keynotes[index]]}`;
  return (
    <ul className={styles.list}>
      {keys.map((key, index) => (
        <li
          className={className(index, key)}
          key={index}
          onMouseDown={(e) => onUserEvent("keydown", notes[index], e.timeStamp, index)}
          onMouseUp={(e) => onUserEvent("keyup", notes[index], e.timeStamp, index)}
          onTouchStart={(e) => onUserEvent("keydown", notes[index], e.timeStamp, index)}
          onTouchEnd={(e) => onUserEvent("keyup", notes[index], e.timeStamp, index)}
        ></li>
      ))}
    </ul>
  );
};
export default Piano;
