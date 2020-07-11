import React, { createElement, Component } from "react";
import { Typography, Select, Slider, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState, Fragment } from "react";
import { connect, actions, state } from "./redux/store.js";

const mapDispatchToProps = (dispatch) => {
  return {
    updateSetting: function (xpath, newValue) {
      dispatch({ type: actions.UPDATE_SETTINGS, payload: [xpath, newValue] });
    },
  };
};
const UpdateConfig = ({ settings, updateSettings }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Osc 1</th>
          <th>Osc 2</th>
          <th>Osc 3</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(settings.osc3).map((attribute, idx) => (
          <tr key={idx}>{renderAttributeRow(attribute, settings, updateSettings)}</tr>
        ))}
      </tbody>
    </table>
  );
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
export default connect((state) => state, mapDispatchToProps)(UpdateConfig);
