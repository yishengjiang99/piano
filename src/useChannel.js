"use strict";
exports.__esModule = true;
exports.useChannel = void 0;
var react_1 = require("react");
function reducer(prevState, data) {
  prevState.lastMessage = data;
  prevState.messages.push(data);
  prevState.messages.shift();
  return prevState;
}
function useChannel(name) {
  var _a = react_1.useReducer(reducer, {
      lastMessage: null,
      messages: [],
    }),
    messageState = _a[0],
    dispatch = _a[1];
  var channel = react_1.useRef(new BroadcastChannel(name));
  function postMessage(msg) {
    channel.current.postMessage(msg);
  }
  react_1.useEffect(
    function () {
      channel.current.onmessage = function (e) {
        dispatch(e.data);
      };
      return function cleanup() {
        channel.current && channel.current.close();
      };
    },
    [name]
  );
  return [messageState, postMessage];
}
exports.useChannel = useChannel;
