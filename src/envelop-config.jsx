import React, { createElement } from "react";
import Slider from "@material-ui/core/Slider";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState, Fragment } from "react";
import { connect, actions, state } from "./redux/store.js";
import { updateSettings } from "./audioCtx.js";

export default connect(
  (state) => {
    return {
      osc3: state.settings.osc3,
      adsr: state.settings.adsr,
      filters: state.setting.filters,
    };
  },
  function (dispatch) {
    return {
      updateSetting: (delta) => dispatch({ type: actions.UPDATE_SETTINGS, payload: delta }),
    };
  },
  new (class extends React.Component {
    render({ settings, updateSettings }) {
      return <p>component here</p>;
    }
  })()
);
