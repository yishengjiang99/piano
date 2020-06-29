import styles from "./Piano.module.css";
import React, {
  useEffect,
  useState,
  createRef,
  Component,
  useRef,
} from "react";
import { keys, blackKeys, notes } from "../lib/SoundKeys";
const Piano = ({ onUserEvent, octave }) => {
  const octaves = [octave, octave + 1];
  const keyRefMap = keys.map((key, index) => createRef());
  let _onUserEvent = onUserEvent;
  useEffect(() => {
    window.onkeydown = (e) => {
      const index = keys.indexOf(e.key);
      if (index < 0) return;
      const freq = notes[index];
      _onUserEvent("keydown", freq, e.timeStamp, index);
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
            blackKeys.indexOf(key) >= 0 ? styles.keyblack : styles.keywhite
          }
          key={index}
          ref={keyRefMap[index]}
          onTouchStart={(e) => onUserEvent("keydown", index, octave)}
          onTouchEnd={(e) => onUserEvent("keyup", index, octave)}
        >
          {JSON.stringify(keyRefMap[notes[index]])}
          <br></br> {key} {index}
        </li>
      ))}
    </ul>
  );
};
export default Piano;
