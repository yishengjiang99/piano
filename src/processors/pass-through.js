class PassThroughProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = inputs[i];
      }
    });
    return true;
  }
}

registerProcessor("pass-through", PassThroughProcessor);
