import React from "react";

import { useState } from "react";
const FileList = ({ debug, channels, files, postMessage }) => {
  const [open, setOpen] = React.useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <table>
      <tbody>
        {files.map((f, idx) => (
          <tr key={idx}>
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
        {channels.slice(20).map((c, idx) => (
          <tr key={idx}>
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
      </tbody>
    </table>
  );
};

export default FileList;
