import styles from "./Piano.module.css";
import React, { useEffect, useState, createRef, Component, useRef } from "react";
import { keys, blackKeys, notes, keynotes, keyboardToFreq, freq_at_octave } from "./sound-keys.js";
]
const Piano = ({ onUserEvent, octave }) => {
  const noteFreqs = freq_at_octave(octave);
  useEffect(() => {
    window.onkeydown = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = noteFreqs[index];
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
      const freq = noteFreqs[index];
      onUserEvent("keyup", freq, e.timeStamp, index);
    };
    window.onkeypress = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = noteFreqs[index];
      onUserEvent("keypress", freq, e.timeStamp, index);

      e.target.classList.remove(styles.pressed);
    };
  }, []);

  const keyboard = [2, 3, 4]
    .map((octave) =>
      keynotes.map((label, index) => {
        const midi = octave * 12 + index;
        const freq = freq_at_octave(octave)[index];
        const className =
          [1, 3, 5, 7, 9].indexOf(index) > -1
            ? `${styles.keyblack} ${styles.label}`
            : `${styles.keywhite} ${styles[label]}`;
        return { label, octave, midi, freq, className };
      })
    )
    .reduce((acc, arr) => acc.concat(arr), []);

  return (
    <ul className={styles.list}>
      {keyboard.map(({ label, octave, index, freq, className }, idx) => (
        <li
          className={className}
          key={idx}
          onMouseDown={(e) => onUserEvent("keydown", freq, e.timeStamp, index)}
          onMouseUp={(e) => onUserEvent("keyup", freq, e.timeStamp, index)}
          onTouchStart={(e) => onUserEvent("keydown", freq, e.timeStamp, index)}
          onTouchEnd={(e) => onUserEvent("keyup", freq, e.timeStamp, index)}
        >
          {label}
        </li>
      ))}
    </ul>
  );
};
export default Piano;
