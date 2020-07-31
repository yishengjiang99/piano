import React from "react";

import { useState } from "react";
const FileList = ({ debug, channels, files, postMessage }) => {
  const [open, setOpen] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <table>
      {files.slice(20).map((f) => (
        <tr>
          <td>{f}</td>
          <td>
            <button
              onClick={() =>
                fetch("https://www.grepawk.com/dbfs/" + f)
                  .then((res) => res.text())
                  .then((t) => {})
              }
            >
              read
            </button>
          </td>
        </tr>
      ))}
      {channels.slice(20).map((c) => (
        <tr>
          <td>{c}</td>
          <td>
            <button
              onClick={() => {
                postMessage(`join ${c}`);
              }}
            >
              join
            </button>
          </td>
        </tr>
      ))}
    </table>
  );
};

/*
</table>
    
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
    </tr>
    </table>
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
*/
export default FileList;
