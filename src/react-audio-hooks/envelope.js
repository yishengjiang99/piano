<<<<<<< HEAD:src/processors/envelope.js
import { useState, useRef } from "react";
export function useEnvelope() {
  const [adsr, setAdsr] = useState([0.01, 0.2, 0.8, 0.3]);
  let ref = useRef();
  function applyEnvelope(audiogram) {
    ref.current = new Envelope(adsr, audiogram);
    return ref.current;
  }
  function triggerAttackRelease() {
    ref.current.triggerAttack();
    setTimeout(() => ref.current.triggerRelease(), ref.currrnt.attack + ref.current.decay);
  }
  function scheduleAttackRelease(later) {
    setTimeout(triggerAttackRelease, later);
=======
import { useState } from "react";

export function useEnvelope(ctx, defaults = [0.01, 0.5, 0.8, 0.3]) {
  const [adsr, setAdsr] = useState(defaults);

  function applyEnvelope(audiogram) {
    return new Envelope(adsr, audiogram, ctx);
>>>>>>> b6ba5d72658e9e6a90e0a675fbe4074de8f260d2:src/react-audio-hooks/envelope.js
  }

  return [applyEnvelope, setAdsr];
}

export function Envelope(adsr, audioParam, ctx) {
  const [attack, decay, sustain, release] = adsr;
  var attackStart, releaseStart;
  var extended = [];
  this.state = "init";
  const trigger = (time = null) => {
    attackStart = time ? time : 0;
    this.state = "attacking";
    audioParam.setValueCurveAtTime([0, 1.0], time, attack);
    audioParam.setValueCurveAtTime([1.0, sustain * 1.0], time + attack, decay);
    audioParam.setTargetAtTime(0.0000001, time + attack + decay, release);
  };
  const triggerRelease = (time = null) => {
    releaseStart = time ? time : ctx.currentTime;

    this.state = "releasing";
    audioParam.cancelScheduledValues(0);
    audioParam.setTargetAtTime(0.0000001, releaseStart, release);
  };
  const hold = () => {
    if (attackStart + attack > ctx.currentTime) return;
    extended.push(ctx.currentTime);
    audioParam.cancelScheduledValues(0);

    audioParam.linearRampToValueAtTime(sustain * 1.0, ctx.currentTime + decay);
  };
  return {
    trigger,
    triggerRelease,
    hold,
    triggerEnvelope: ({ attackStart, releaseStart, extended }) => {
      var peak = 1.0;
      var attacked = releaseStart - attackStart;

      if (attacked < attack) {
        peak = attacked / attack;
      }

      var sustainedTime = extended.length ? extended[extended.length - 1] : decay;

      audioParam.setValueCurveAtTime([0, peak], ctx.currentTime, attacked);
      audioParam.setValueCurveAtTime(
        [peak, sustain * peak],
        ctx.currentTime + attacked,
        sustainedTime
      );
      audioParam.setTargetAtTime(0.0000001, ctx.currentTime + attacked + sustainedTime, release);
    },
    cloneShape: () => {
      return { attackStart, releaseStart, extended };
    },
  };
}
