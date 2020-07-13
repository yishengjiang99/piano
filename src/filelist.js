import React from "react";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { fade } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import DraftsIcon from "@material-ui/icons/Drafts";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import Drawer from "@material-ui/core/Drawer";
import { useState } from "react";
const FileList = ({ channels, files, postMessage }) => {
  const [open, setOpen] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleSelectFile = (c) => {
    postMessage(`read ${c}`);
  };
  const handleJoinChannel = (c) => {
    postMessage(`join ${c}`);
  };
  return (
    <>
      <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start">
        <MenuIcon />
      </IconButton>
      <Drawer style={{ width: 280 }} variant="persistent" anchor="left" open={open}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
        <List component="nav" aria-label="tracks">
          {files.map((f) => (
            <ListItem
              button
              selected={selectedIndex === 0}
              onClick={(event) => handleSelectFile(event, f)}
            >
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary={f} />
            </ListItem>
          ))}
        </List>

        <Divider />
        <List component="nav" aria-label="channels">
          {channels.map((c) => (
            <ListItem
              button
              selected={selectedIndex === 0}
              onClick={(event) => handleJoinChannel(event, c)}
            >
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary={c} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default FileList;
