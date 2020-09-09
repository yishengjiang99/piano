const { Midi } = require('@tonejs/midi')
async function main() {
  const midi = await new Midi(require("fs").readFileSync("./OnlineMidi.mid"));
  //the file name decoded from the first track
  const name = midi.name;
  console.log(midi);
  midi.tracks.forEach(track => {
    //tracks have notes and controlChanges

    //notes are an array
    const notes = track.notes
    console.log(track.instrument);
    notes.forEach(note => {
      //note.midi, note.time, note.duration, note.name
      console.log([track.channel, track.name, note.midi, note.time, note.duration, note.velocity, note.name].join(","));
    })

    //the control changes are an object
    //the keys are the CC number
    //they are also aliased to the CC number's common name (if it has one)
    // track.controlChanges.sustain.forEach(cc => {
    //   // cc.ticks, cc.value, cc.time
    //   console.log("cc", cc.ticks, cc.value, cc.time);
    // })

    //the track also has a channel and instrument
    //track.instrument.name
  })
}


main();
