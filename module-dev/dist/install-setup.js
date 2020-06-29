"use strict";
/* eslint-disable no-console, no-magic-numbers, max-statements */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * search for actual app dir by looking for package.json
 *
 * @param dir starting dir
 * @param depth levels so far (to avoid infinite searching)
 * @returns dir if found
 */
function searchAppDir(dir, depth = 0) {
    if (depth > 50) {
        return "";
    }
    const file = path_1.join(dir, "package.json");
    if (fs_1.existsSync(file)) {
        return dir;
    }
    const newDir = path_1.join(dir, "..");
    if (newDir !== dir) {
        return searchAppDir(newDir, depth + 1);
    }
    return "";
}
/**
 * Show instructions on bootstrapping a project after npm install if project
 * doesn't have xclap.js or xclap.ts files yet.
 */
function installSetup() {
    const appDir = searchAppDir(process.env.INIT_CWD || "");
    if (appDir && (fs_1.existsSync(path_1.join(appDir, "xclap.js")) || fs_1.existsSync(path_1.join(appDir, "xclap.ts")))) {
        return;
    }
    console.error(`Welcome to @xarc/module-dev for developing node.js modules.

To bootstrap your project, run:

    npx clap --require @xarc/module-dev init [options]

Options:

  --eslint        - bootstrap with eslint support
  --no-typescript - don't bootstrap with typescript support
  --no-typedoc    - don't bootstrap with typedoc support`);
}
installSetup();
//# sourceMappingURL=install-setup.js.map