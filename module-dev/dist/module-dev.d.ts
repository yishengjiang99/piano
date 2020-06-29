/**
 * User configurable options for @xarc/module-dev tasks
 */
export declare type XarcModuleDevOptions = {
    /** force terminal colors in output - *default* `true` */
    forceColor?: boolean;
    /** Specify a XClap instance to use - *default* `require("xclap")` */
    xclap?: any;
    /** turn off/on linting tasks (using eslint) - *default* `true` */
    enableLinting?: boolean;
    /** Specify typescript config to override the default one */
    tsConfig?: Record<string, any>;
};
/**
 * Load XClap build tasks for developing node.js modules.
 *
 * See document for xclap at https://www.npmjs.com/package/xclap
 *
 * To use, create a file `xclap.js`:
 *
 * ```js
 *   require("@xarc/module-dev")()
 * ```
 *
 * or `xclap.ts` for typescript:
 *
 * ```ts
 *   import loadTasks from "@xarc/module-dev";
 *   loadTasks();
 * ```
 *
 * Then run the command `npx clap` to see available build tasks.
 *
 * @param xclapOrOptions options
 */
export declare function loadTasks(xclapOrOptions?: object | XarcModuleDevOptions): void;
export { loadTasks as default };
