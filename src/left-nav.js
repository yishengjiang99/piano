import React from "react";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import { fade } from "@material-ui/core/styles";
import ChevronLeftSharp from "@material-ui/icons/ChevronLeftSharp";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";

import Drawer from "@material-ui/core/Drawer";

const LeftNav = ({ children }) => {
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  return (
    <>
      <IconButton color="inherit" aria-label="open drawer" edge="start">
        <MenuIcon />
      </IconButton>
      <Drawer style={{ width: 280 }} variant="persistent" anchor="left" open={true}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftSharp />
        </IconButton>
        {children[0]}
      </Drawer>
    </>
  );
};

export default LeftNav;
