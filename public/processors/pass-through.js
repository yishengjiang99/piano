class PassThroughProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    var peak = 0;
    for (let channel = 0; channel < inputs[0].length; channel++) {
      for (let i = 0; i < outputs[0][channel].length; i++) {
        outputs[0][channel][i] = inputs[0][channel][i];
        if (inputs[0][channel[i]] > peak) peak = inputs[0][channel[i]];
      }
    }
    return true;
  }
}

registerProcessor("pass-through", PassThroughProcessor);
