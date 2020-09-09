
module.exports = {
    Envelope: function Envelope(adsr, ctx, audioParam) {
        const [attack, decay, sustain, release] = adsr;
        var attackStart, releaseStart;
        var extended = [];
        var state = "init",
            shape;
        const trigger = (multiplier = 1) => {
            attackStart = ctx.currentTime;
            state = "attacking";
            audioParam.setValueCurveAtTime([0, multiplier], ctx.currentTime, attack);
            audioParam.setValueCurveAtTime(
                [multiplier, sustain * multiplier],
                ctx.currentTime + attack,
                decay
            );
            audioParam.setTargetAtTime(0.0000001, ctx.currentTime + attack + decay, release);
            audioParam.setValueAtTime(0, ctx.currentTime + attack + decay + 3);
        };
        const triggerRelease = () => {
            state = "releasing";
            audioParam.cancelScheduledValues(0);
            releaseStart = ctx.currentTime;
            audioParam.setTargetAtTime(0.0000001, ctx.currentTime, release);
        };
        const hold = () => {
            if (attackStart + attack > ctx.currentTime) return;
            extended.push(ctx.currentTime);
            audioParam.cancelScheduledValues(0);

            //audioParam.linearRampToValueAtTime(sustain * 1.0, ctx.currentTime + decay);
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
}