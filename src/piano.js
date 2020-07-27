import styles from "./Piano.module.css";
import React, { useEffect, useState, createRef } from "react";
import { keys, blackKeys, keynotes, notesOfOctave } from "./sound-keys.js";

const Piano = ({ onUserEvent, octave }) => {
  const notes = notesOfOctave(octave);
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
      e.keydown = this;
      e.target.classList.add(styles.pressed);
    };
    window.onkeyup = (e) => {
      console.log(e.dkeydown);
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
      {keys.map((key, index) => (
        <li
          className={className(index, key)}
          key={index}
          onMouseDown={(e) => onUserEvent("keydown", 2 * notes[index], e.timeStamp, 12 + index)}
          onMouseUp={(e) => onUserEvent("keyup", 2 * notes[index], e.timeStamp, 12 + index)}
          onTouchStart={(e) => onUserEvent("keydown", 2 * notes[index], e.timeStamp, 12 + index)}
          onTouchEnd={(e) => onUserEvent("keyup", 2 * notes[index], e.timeStamp, 12 + index)}
        ></li>
      ))}
    </ul>
  );
};
export default Piano;
