
const { MembraneSynth, MetalSynth, MetalSynthOptions, MembraneSynthOptions, Frequency, NoiseSynth } = require("tone")
const { Envelope } = require("./envelope");
const { noteToMajorTriad, frequencyToMidi } = require("./sound-keys");
var Soundfont = require('soundfont-player');
module.exports = async function (ctx, inputNode, _settings) {

    const sfinnst = await Soundfont.instrument(ctx, "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/marimba-mp3.js")

    const noteCache = {};
    return {
        soundFont: function (freq) {
            const note = frequencyToMidi(freq);

            return {
                trigger: () => sfinnst.play(note),
                triggerRelease: () => { },
                hold: () => { },
                triggerEnvelop: () => sfinnst.play(note),
            }
        },
        getLPSaw: function (freq) {
            const osc = new OscillatorNode(ctx, { type: 'sawtooth', frequency: freq });
            const lpf = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 2 * freq });
            const gain = new GainNode(ctx, { gain: 0 });
            osc.connect(lpf).connect(gain).connect(inputNode);
            osc.start();
            const env = Envelope(_settings.adsr, ctx, gain.gain);
            return env;
        },
        getDrums: function (freq) {
            const stdEnvelope = (toneSynth) => {
                var start, release;
                return {
                    trigger: function () {
                        start = ctx.currentTime;
                        toneSynth.triggerAttack(start, 0.2);

                    },
                    triggerRelease: function () {

                        release = ctx.currentTime;
                        toneSynth.triggerRelease()
                        //            toneSynth.triggerRelease()
                        //   toneSynth.map(s => s.triggerRelease());

                    },
                    hold: function () {
                        //   toneSynth.hold();
                    }
                }
            }

            const hashKey = freq << 3;
            if (noteCache[hashKey]) return noteCache[hashKey];
            const sync = new MembraneSynth({
                volume: 3
            });
            const noise = new NoiseSynth();

            sync.toDestination();

            noise.toDestination();

            return stdEnvelope(noise, Frequency(freq).toNote());


        },
        osc3: function (freq) {
            const hashkey = freq;
            if (noteCache[hashkey] && ctx.currentTime - noteCache[hashkey].started > 5)
                return noteCache[hashkey];

            const outputGain = new GainNode(ctx, { gain: 0 });
            var chords = noteToMajorTriad(freq); // _settings.overtone.map((multiplier) => freqs * multiplier);
            chords
                .map((freq, idx) => {
                    return new OscillatorNode(ctx, {
                        type: _settings.osc3[idx],
                        frequency: freq,
                        detune: _settings.detune[idx],
                    });
                })
                .map((osc, idx) => {
                    idx = idx % 3;
                    var _gain = new GainNode(ctx, { gain: _settings.overtone[idx] });
                    var delay = new DelayNode(ctx, { delay: _settings.delay[idx] });
                    osc.connect(delay).connect(_gain); //new GainNode(ctx, { gain: _settings.gains[idx] }))
                    _gain.connect(outputGain);
                    osc.start(0);
                });
            outputGain.connect(inputNode);
            var gainEnvelope = new Envelope(_settings.adsr, ctx, outputGain.gain);
            return gainEnvelope;
        }
    }
}