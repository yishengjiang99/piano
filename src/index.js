"use strict";
exports.__esModule = true;
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var App_1 = require("./App");
var serviceWorker = require("./serviceWorker");
react_dom_1["default"].render(<App_1.IndexPage />, document.getElementById("root"));
var channel = new BroadcastChannel("useEvent");
function setLatestUserEvent(e) {
    if (!e.repeat)
        channel.postMessage({ type: e.type, time: e.timeStamp });
}
window.addEventListener("keydown", setLatestUserEvent);
window.addEventListener("keypress", setLatestUserEvent);
window.addEventListener("keyup", setLatestUserEvent);
// window.addEventListener("mousedown", setLatestUserEvent);
// window.addEventListener("mouseup", setLatestUserEvent);
serviceWorker.register();
