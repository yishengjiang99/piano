import React, { useEffect, useRef } from "react";
import { useEQ, useAudioContext, useOsc3, useBiquads } from "react-audio-hooks";
import { Slider, Select, MenuItem, Menu } from "@material-ui/core";

export const UpdateConfig = ({ ctx, updateSettings }) => {
  // const [audioCtx, addFilter, connectInput] = useAudioContext();
  // const [osc3, updateS]
  // useEffect(() => {

  // }, [ctx]);

  return <div>audioctx: {ctx ? ctx.state : "none"}</div>;
};

function renderAttributeRow(attribute, settings, updateSettings) {
  [0, 1, 2].map((idx) => {
    const xpath = ["osc3", attribute, idx].join("/");
    if (attribute == "trype") {
      return (
        <td>
          <Slider
            aria-label={attribute}
            key={`${attribute}-slider`}
            getAriaValueText={`${attribute}-slider-label`}
            value={settings.osc3[attribute][idx]}
            onChange={(event, v) => {
              updateSettings(xpath, v);
            }}
            min={0}
            max={3}
            step={0.01}
          ></Slider>
        </td>
      );
    } else {
      return (
        <td>
          <Select
            label="Osc Type"
            id={xpath}
            defaultValue="sine"
            IconComponent="bdi"
            value={settings.osc3[attribute][idx]}
            onChange={(v) => updateSettings(xpath, v)}
          >
            {["sawtooth", "sine", "square", "triangle"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </td>
      );
    }
  });
}
