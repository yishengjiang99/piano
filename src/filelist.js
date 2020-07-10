import { actions, connect } from "./redux/store.js";
import React, { useEffect, useState, useContext } from "react";
import { Table } from "@material-ui/core";
import constants from "./constants";
import { Accordion, Card } from "react-bootstrap";
const mapStateToProps = (state) => {
  return { files: state.files };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setNowPlaying: function (v) {
      dispatch({ type: actions.NOW_PLAYING, payload: v });
    },
    gotFileList: function (files) {
      dispatch({ type: actions.API_FILES_GOT, payload: files });
    },
  };
};

const _fileList = ({ files, gotFileList, setNowPlaying }) => {
  const [channels, setChannels] = useState("");
  let ws;
  function handleMsgGot(msgObj) {
    if (msg.type === "channelList") {
      setChannels(msg.data.join(""));
    }
  }
  useEffect(() => {
    if (!ws) {
      ws = new WebSocket(constants.api_ws, "json");
      ws.onopen = function (evt) {
        ws.onmessage = (msg) => {
          msg = JSON.parse(msg); //js privilege
          handleMsgGot(msg);
        };
        ws.send("list");
      };
    }
  });

  return (
    <div>
      <Accordion>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="0">
              Channels
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <Table>
                {channels.split(",").map((c) => (
                  <TableRow onClick={shell_msg(`join ${c}`)}>{c}</TableRow>
                ))}
              </Table>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey="1">
              Click me!
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey="1">
            <Card.Body>Hello! I'm another body</Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    </div>
  );
};
const FileList = connect(mapStateToProps, mapDispatchToProps)(_fileList);
export default FileList;
