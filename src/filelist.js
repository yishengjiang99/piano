import React from "react";

import { useState } from "react";
const FileList = ({ channels, files, postMessage }) => {
  const [open, setOpen] = React.useState(true);
  return (
    <table style={{marginRight:'3em'}}>
      <tbody>
        {files.map((f, idx) => (
          <tr key={idx}>
            <td>{f}</td>
            <td>
              <button onClick={() =>postMessage("read "+f)}>
                read
              </button>
            </td>
          </tr>
        ))}
        {[].map((c, idx) => (
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
