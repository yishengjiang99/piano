let _settings = {
    osc3: ["sine", "sine", "square"],
    overtone: [0.8, 0.3, 0.1],
    detune: [0, 0, 5],
    delay: [0, 1, 1],
    LPF: { frequency: 2000, Q: 3 },
    HPF: { frequency: 60, Q: 3 },

    eqHZs: [62.5, 125, 250, 500, 1000],
    adsr: [0.02, 0.5, 0.1, 0.03, 1.0],
    LFO1: { frequeycy: 60, target: null },
    LFO2: { frequeycy: 60, target: null },
    compression: { threshold: -50, ratio: 5, preAmp: 1, postAmp: 1 },
};

const SoundConfigs = new Proxy(_settings, {
    set: function (attribute, index, value) {
        _settings[attribute][index] = value;
    },
    set: function (attribute, array) {
        _settings[attribute] = array;
    },
    get: function (attribute, index) {
        return _settings[attribute][index];
    },
    get: function (attribute) {
        return _settings[attribute]
    }
})


export default SoundConfigs;