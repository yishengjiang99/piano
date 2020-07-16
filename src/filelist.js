import React from "react";
import IconButton from "@material-ui/core/IconButton";

import MenuIcon from "@material-ui/icons/Menu";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";

import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import Drawer from "@material-ui/core/Drawer";
import { useState } from "react";
const FileList = ({ channels, files, postMessage }) => {
  const [open, setOpen] = React.useState(true);
  const [selectedIndex] = useState(0);

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
              key={f}
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
              key={c}
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
