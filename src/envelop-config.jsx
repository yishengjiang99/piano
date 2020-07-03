import React from "react";
import Slider from "@material-ui/core/Slider";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState, Fragment } from "react";

const useStyles = makeStyles({
  root: {
    width: 300,
  },
});
function valuetext(value) {
  return `${value}`;
}
const EnvelopConfig = ({ defaults, onInput }) => {
  const classes = useStyles();
  const [adsr, setAdsr] = useState(defaults);
  const setValue = (attr, val) => {
    adsr[attr] = val;

    setAdsr(adsr);
    onInput(attr, val);
  };
  return (
    <div>
      {["attack", "decay", "sustain", "release"].map((attribute) => {
        return (
          <Fragment key={attribute}>
            <Typography key={`${attribute}-slider-label`} id={`${attribute}-slider-label`}>
              {attribute}: {adsr[attribute]}
            </Typography>
            <input
              type="range"
              key={`${attribute}-slider`}
              getAriaValueText={`${attribute}-slider-label`}
              defaultValue={defaults[attribute]}
              value={adsr[attribute]}
              onChange={(e, v) => {
                setValue(attribute, v);
              }}
              min={0}
              max={3}
              step={0.01}
              getAriaValueText={valuetext}
            ></input>
          </Fragment>
        );
      })}
    </div>
  );
};

// const attributeSlider = ( attribute, defaults )=>
export default EnvelopConfig;

export const ParamConfig = ({
  param,
  defaultVal,
  min,
  max,
  onInput,
  step,

  disabled,
}) => {
  const [val, setVal] = useState(1);

  return (
    <>
      <Typography key={`${param}-slider-label`} id={`${param}-slider-label`}>
        {param}: {val}
      </Typography>
      <Slider
        // disabled={disabled}
        key={`${param}-slider`}
        getAriaValueText={`${param}-slider-label`}
        value={val}
        onChange={(e, v) => {
          setVal(v);
          if (onInput) onInput(e, v);
        }}
        min={min || 0}
        max={max || 10}
        step={step || 0.01}
        getAriaValueText={valuetext}
      ></Slider>
    </>
  );
};
