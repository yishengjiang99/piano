import React, { createElement, Component } from "react";
import { Typography, Select, Slider, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState, Fragment } from "react";
import { connect, actions, state } from "./redux/store.js";
import { updateSettings } from "./audioCtx.js";

function mapStateToProps(state) {
  return { settings: state.settings };
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateSetting: function (xpath, newValue) {
      dispatch({ type: actions.UPDATE_SETTINGS, payload: [xpath, newValue] });
    },
  };
};

const updateeConfig = ({ settings, updateSettings }) => {
  return (
    <>
      <Osc3 settings={settings} update={updateSettings} />
      <Filters filters={settings.filters} update={updateSettings} />
      <Compression setting={settings.compression} update={updateSettings} />
      <GainStaging settings={settings.GainStaging} update={updateSettings}></GainStaging>
    </>
  );
};

const Osc3 = ({ settings, update }) => (
  <table>
    <thead>
      <th>Osc 1</th>
      <th>Osc 2</th>
      <th>Osc 3</th>
    </thead>
    <tbody>
      {Object.keys(settings.osc3).map((attribute) => {
        {
          [0, 1, 2].map((idx) => {
            const xpath = ["osc3", attribute, idx].join("/");
            return attribute == "type" ? (
              <Slider
                aria-label={attribute}
                key={`${attribute}-slider`}
                getAriaValueText={`${attribute}-slider-label`}
                value={settings.osc3[attribute][idx]}
                onChange={(e, v) => {
                  updateSettings(xpath, v);
                }}
                min={0}
                max={3}
                step={0.01}
              ></Slider>
            ) : (
              <Select
                label="Osc Type"
                id={xpath}
                defaultValue="sine"
                IconComponent="bdi"
                value={settings.osc3.key.idx}
                value={["sawtooth", "sine", "square", "triangle"]}
                onChange={(v) => updateSettings(xpath, v)}
              >
                {["sawtooth", "sine", "square", "triangle"].map((option) => (
                  <MenuItem value={option}>{option}</MenuItem>
                ))}
              </Select>
            );
          });
        }
      })}
    </tbody>
  </table>
);

const Filters = (props) => "filiters";
const Compression = (props) => "compress";
const GainStaging = (props) => "gainstag";

const UpdateConfig = connect(mapStateToProps, mapDispatchToProps, updateeConfig);

export default UpdateConfig;
