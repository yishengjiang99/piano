(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Main"] = factory();
	else
		root["Main"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/run.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/run.ts":
/*!********************!*\
  !*** ./src/run.ts ***!
  \********************/
/*! exports provided: initUploader */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initUploader", function() { return initUploader; });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function initUploader(ctx, stdout, rx1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield ctx.audioWorklet.addModule("upload-processor.js?t=" + new Date().getMilliseconds());
            const uploadProcessor = new AudioWorkletNode(ctx, "upload-processor");
            stdout("upload proc loaded");
            const worker = new Worker("upload-worker.js?t=" + new Date().getMilliseconds(), { type: "module" });
            worker.postMessage({ port: uploadProcessor.port }, [
                uploadProcessor.port,
            ]);
            worker.onmessage = ({ data }) => {
                data.msg && stdout(data.msg);
                data.rx1 && rx1(data.rx1);
            };
            const micStream = yield navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const source = ctx.createMediaStreamSource(micStream);
            source.connect(uploadProcessor);
            const postGain = new GainNode(ctx, { gain: 0.01 });
            uploadProcessor.connect(postGain);
            const analyzer = new AnalyserNode(ctx, { fftSize: 1024 });
            postGain.connect(analyzer);
            analyzer.connect(ctx.destination);
            return {
                uploadProcessor,
                worker,
                source,
                postGain,
                analyzer,
            };
        }
        catch (e) {
            alert(e.message);
        }
    });
}
// }
// // export const readReader = async (rs: ReadableStream) => {
// // 	rs.getReader({ mode: "byob" }).read(new Uint8Array(1024))
// // };
// export const msgEventReader = async (port: MessagePort) => {
// 	const ws = new WebSocket("ws://localhost:5150");
// 	await new Promise((resolve, reject) => {
// 		ws.onopen = () => {
// 			const { readable, writable } = new TransformStream();
// 			// port.postMessage({ readable }, [readable]);
// 			ws.onmessage = (event) => {
// 				const b: Blob = event.data;
// 				// new Response(b).body.pipeTo(writable) .stream().getReader().pipeTo(writable);
// 			};
// 			resolve();
// 		};
// 	});
// };


/***/ })

/******/ });
});
//# sourceMappingURL=run.js.map