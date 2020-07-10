import React from "react";
import styles from "./layout.css";

export const VsCodeLayout = ({ children }) => {
  return (
    <div className={styles.vscode}>
      <div className={styles.sideNavBar}>{children[0]}</div>
      <div className={styles.fileList}>{children[1]}</div>
      <div className={styles.cmdPalletTabs}>{children[2]}</div>
      <div className={styles.editor}>{children[3]}</div>
      <div className={styles.xterm}>{children[4]}</div>
    </div>
  );
};
export const LeftRight = ({ children }) => {
  return <div className={styles.container}></div>;
};
