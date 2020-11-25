"use strict";
exports.__esModule = true;
exports.Sequence = void 0;
var react_1 = require("react");
var sound_keys_1 = require("./sound-keys");
var useChannel_1 = require("./useChannel");
var secondsPerBar = 0.25;
var BAR_WIDTH = 90;
var BAR_HEIGHT = 10;
var gridAxis = function (canvasCtx, rows, cols) {
  canvasCtx.clearRect(0, 0, cols * BAR_WIDTH, rows * BAR_HEIGHT);
  canvasCtx.strokeStyle = "rbga(1,1,1,1)";
  for (var i = 0; i < rows; i++) {
    canvasCtx.moveTo(0, i * BAR_HEIGHT);
    canvasCtx.lineTo(cols * BAR_WIDTH, i * BAR_HEIGHT);
    canvasCtx.stroke();
  }
  for (var j = 0; j < cols; j++) {
    canvasCtx.moveTo(j * BAR_WIDTH, 0);
    canvasCtx.lineTo(j * BAR_WIDTH, rows * BAR_HEIGHT);
    canvasCtx.stroke();
  }
};
function paintABar(canvasCtx, paintBar) {
  if (!canvasCtx) return;
  if (paintBar.color === "clear") {
    canvasCtx.clearRect(
      paintBar.bar * BAR_WIDTH,
      paintBar.index * BAR_HEIGHT,
      BAR_WIDTH * (paintBar.length / 250) - 1,
      BAR_HEIGHT - 1
    );
  } else {
    canvasCtx.fillStyle = paintBar.color || "blue";
    canvasCtx.fillRect(
      paintBar.bar * BAR_WIDTH,
      paintBar.index * BAR_HEIGHT,
      BAR_WIDTH * (paintBar.length / 250) - 1,
      BAR_HEIGHT - 1
    );
  }
}
var GRID_CELL_STATE;
(function (GRID_CELL_STATE) {
  GRID_CELL_STATE[(GRID_CELL_STATE["NEW"] = 1)] = "NEW";
  GRID_CELL_STATE[(GRID_CELL_STATE["PENDING"] = 2)] = "PENDING";
  GRID_CELL_STATE[(GRID_CELL_STATE["PRESSING"] = 3)] = "PRESSING";
  GRID_CELL_STATE[(GRID_CELL_STATE["ON"] = 4)] = "ON";
  GRID_CELL_STATE[(GRID_CELL_STATE["OFF"] = 5)] = "OFF";
})(GRID_CELL_STATE || (GRID_CELL_STATE = {}));
export const Sequence = function (_a) {
  var postWsMessage = _a.postWsMessage,
    active = _a.active,
    newEvent = _a.newEvent,
    rows = _a.rows,
    cols = _a.cols,
    onNewNote = _a.onNewNote;
  var _b = react_1.useState(
      new Array(cols * rows).fill({
        state: GRID_CELL_STATE.NEW,
        updated: null,
        history: [],
      })
    ),
    grid = _b[0],
    setGrid = _b[1];
  var _c = useChannel_1.useChannel("debug"),
    debugMessage = _c[0],
    postDebug = _c[1];
  var _d = react_1.useState(-1),
    currentBar = _d[0],
    setCurrentBar = _d[1];
  var _e = react_1.useState(0),
    barCursor = _e[0],
    setBarCursor = _e[1];
  var canvasRef = react_1.createRef();
  react_1.useEffect(
    function () {
      var cctx =
        canvasRef.current && canvasRef.current.getContext("2d") !== null
          ? canvasRef.current.getContext("2d")
          : null;
      if (cctx) gridAxis(cctx, rows, cols);
    },
    [canvasRef.current, rows, cols]
  );
  var _canvasClick = function (e) {
    var canvasCtx = canvasRef.current.getContext("2d");
    var _a = [e.nativeEvent.clientX, e.nativeEvent.clientY],
      x = _a[0],
      y = _a[1];
    var noteIndex = Math.floor(y / BAR_HEIGHT);
    var barIndex = Math.floor(x / BAR_WIDTH);
    var note = {
      bar: barIndex,
      index: noteIndex,
      length: 200,
      color: "blue",
      frequency: sound_keys_1.idxToFreq(noteIndex % 12, 3 + Math.floor(noteIndex / 12)),
    };
    paintABar(canvasCtx, note);
  };
  react_1.useEffect(
    function () {
      var _a;
      //key start, release, hold
      if (newEvent === null) {
        return; // false
      }
      var type = newEvent.type,
        time = newEvent.time,
        start = newEvent.start,
        index = newEvent.index,
        duration = newEvent.duration,
        instrument = newEvent.instrument;
      switch (type) {
        case "keydown":
          postWsMessage({
            cmd: "keyboard",
            bar: currentBar,
            time: time,
            index: index,
            instrument: instrument,
            type: "keypress",
          });
          setGrid(function (prev) {
            prev[currentBar * index] = {
              state: GRID_CELL_STATE.PENDING,
              updated: new Date(),
              history: [],
            };
            return prev;
          });
          break;
        // eslint-disable-next-line no-fallthrough
        case "keypress":
          postWsMessage({
            cmd: "keyboard",
            bar: currentBar,
            time: time,
            instrument: instrument,
            index: index,
            type: "keypress",
          });
          setGrid(function (prev) {
            var _a = prev[currentBar * index],
              state = _a.state,
              updated = _a.updated;
            prev[currentBar * index] = {
              state: GRID_CELL_STATE.PRESSING,
              updated: new Date(),
              history: [{ state: state, updated: updated }],
            };
            return prev;
          });
          break;
        case "mouseup":
        case "keyup":
          postWsMessage({
            cmd: "keyboard",
            bar: currentBar,
            time: time,
            instrument: instrument,
            index: index,
            type: "keyup",
          });
          var _b = grid[currentBar * index],
            state_1 = _b.state,
            updated_1 = _b.updated,
            history_1 = _b.history;
          var envelop = [
            history_1[0].updated,
            history_1[1] ? history_1[1].updated : null,
            new Date(),
          ];
          setGrid(function (prev) {
            prev[currentBar * index] = {
              state: GRID_CELL_STATE.ON,
              updated: new Date(),
              history: [{ state: state_1, updated: updated_1 }],
            };
            return prev;
          });
          onNewNote({
            type: type,
            time: time,
            instrument: instrument,
            index: index,
            bar: currentBar,
            adsr: envelop,
          });
          var note = {
            bar: currentBar,
            index: index,
            length: 200,
            color: "blue",
            frequency: sound_keys_1.idxToFreq(index),
          };
          paintABar(
            (_a = canvasRef.current) === null || _a === void 0 ? void 0 : _a.getContext("2d"),
            note
          );
          break;
        default:
          postDebug(type + " " + time);
          break;
      }
      return function cleanup() {
        //   postDebug(JSON.stringify(pendingNotes));
      };
    },
    [newEvent]
  );
  react_1.useEffect(function () {}, [grid]);
  return (
    <>
      <h5>
        {"instrument"} {active ? "ACTIVE" : ""}
      </h5>
      <div
        style={{
          backgroundColor: "rbga(0,0,0,0)",
          height: rows * BAR_HEIGHT,
          width: cols * BAR_WIDTH,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute" }}
          onClick={function (e) {
            return _canvasClick(e);
          }}
          height={rows * BAR_HEIGHT}
          width={cols * BAR_WIDTH}
        ></canvas>
      </div>
      <div>
        {currentBar}|{barCursor}
      </div>
    </>
  );
};
