import * as serviceWorker from "./serviceWorker";
import { actions, connect, createActor } from "./redux/store.js";
import React, { useReducer, useEffect, useEffect } from "react";
import { Table } from "@material-ui/core";
const mapStateToProps = (state) => {
  return { files: state.files };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setNowPlaying: function (v) {
      dispatch({ type: actions.NOW_PLAYING, payload: v });
    },
  };
};

const _fileList = ({ files, setNowPlaying }) => {
  useEffect(() => {
    const files = fetch(constants.files_api)
      .then((resp) => resp.json())
      .then((files) => {
        dispatch({ type: actions.API_FILES_GOT, payload: files });
      });

    return () => {
      files = null;
    };
  }, []);
  return (
    <Table>
      {files.map((f) => (
        <tr>
          <td>{files.name}</td>
          <td>{files.name}</td>
          <td>{files.credit}</td>
          <td>{files.day}</td>
          <td>
            <button onClick={(e) => setNowPlaying(f)}>play</button>
          </td>
        </tr>
      ))}
    </Table>
  );
};
const FileList = connect(mapStateToProps, mapDispatchToProps, _fileList);
export default FileList;
