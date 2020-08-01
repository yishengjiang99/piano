import styles from "./Piano.module.css";
import React, {useEffect} from "react";
import {keys, blackKeys, keynotes, notesOfOctave} from "./sound-keys.js";

const Piano = ({onUserEvent, octave}) => {
  const notes = notesOfOctave(octave);
  const className = (index, key) =>
    blackKeys.indexOf(key) > -1
      ? `${styles.keyblack}`
      : `${styles.keywhite}`
  return (
    <ul className={styles.list}>
      {keys.map((key, index) => (
        <li
          className={className(index, key)}
          key={index}
          data-index={index}
          data-freq={notes[index]}
          onMouseDown={onUserEvent}
          onMouseUp={onUserEvent}
        ></li>
      ))}
      {keys.map((key, index) => (
        <li
          className={className(index, key)}
          key={index + 12}
          data-index={index}
          data-freq={notes[index + 12]}
          onMouseDown={onUserEvent}
          onMouseUp={onUserEvent}
        ></li>
      ))}
    </ul>
  );
};
export default Piano;
