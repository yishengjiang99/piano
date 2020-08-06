class PassThroughProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    var max = 0;

    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = inputs[i];
        if(channel[i]>max){
          max = channel[i];
        }
      }
    });
    this.port.postMessage({
      peak:max
    })
    return true;
  }
}

registerProcessor("pass-through", PassThroughProcessor);
