/* eslint-disable no-magic-numbers*/
/* eslint-disable comma-dangle*/

export const notes_ext = {
  C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0, 4186.01],
  Db: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46, 4434.92],
  D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32, 4698.64],
  Eb: [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02, 4978.03],
  E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
  F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
  Gb: [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
  G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
  Ab: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
  A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
  Bb: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
  B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
};
export const notesOfIndex = Object.values(notes_ext);
export const notes = [
  261.63,
  277.18,
  293.66,
  311.13,
  329.63,
  349.23,
  369.99,
  392,
  415.3,
  440,
  466.16,
  493.88,
];
export const chords = {
  C: ["C", "E", "G"],
  Db: ["Db", "F", "Ab"],
  D: ["D", "Gb", "A"],
  Eb: ["Eb", "F", "G"],
  E: ["E", "Ab", "B"],
  F: ["F", "A", "C"],
  Gb: ["Gb", "Bb", "Db"],
  G: ["G", "B", "D"],
  Ab: ["Ab", "E", "B"],
  A: ["A", "D", "Gb"],
  Bb: ["Bb", "Gb", "Db"],
  B: ["B", "Ab", "E"],
};
export const melody = ["major", "major", "minor", "major"];
export const keyboardToFreq = (key, octave) => {
  const idx = keys.indexOf(key);
  const baseFreq = notesOfIndex[idx][octave];
  return baseFreq;
};
export const idxToFreq = (idx, octave) => {
  return notesOfIndex[idx][octave];
};
export const noteToMajorTriad = (baseFreq, octave) => {
  const idx = notes.indexOf(baseFreq);
  const keynote = keynotes[idx];
  const _chords = chords[keynote];
  if (!_chords) return [keynote, keynote * 2, keynote * 4];
  return _chords.map((n) => notes_ext[n][octave]);
};
export const noteToMinorTriad = (baseFreq, octave) => {
  const idx = notes.indexOf(baseFreq);
  const _chords = [keynotes[idx], keynotes[(idx + 2) % 12], keynotes[(idx + 4) % 12]];

  return _chords.map((n) => notes_ext[n][octave]);
};

export const blackKeys = ["w", "e", "t", "y", "u"];
export const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", "k"];
export const keynotes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C"];
