import React, { useState, useReducer, useRef, useEffect } from 'react';
const NOT_RUNNING = 0;
const RUNNING_REQUESTED = 1;
const RUNNING = 2;
const reducerAction = {
    REQUEST_START: 1, STOP: 2, RESET: 3, START: 4, SET_TIME: 5
}
const initState = {
    clock: 0,
    running: NOT_RUNNING
};
const clockReducer = (STATE, action) => {
    const { REQUEST_START, STOP, RESET, START, SET_TIME } = reducerAction

    const newState = STATE || initState;
    switch (action) {
        case REQUEST_START: newState.running = RUNNING_REQUESTED; break;
        case STOP: newState.running = NOT_RUNNING; break;
        case RESET: newState.clock = 0; break;
        case START: newState.running = RUNNING; break;
        default: newState.clock = action;
    }
}
export default function useAnimationTime() {
    const [clock, setClock] = useState(0);
    const [running, setRunning] = useState(false);
    return [{ clock, running }, {
        start: () => {
            const now = performance.now();
            function loop() {
                const elapsed = (performance.now() - now) / 100;
                setClock(_c => _c + elapsed);
                window.t1 = requestAnimationFrame(loop)
            }
            setRunning(true)
            requestAnimationFrame(loop)
        }, stop: () => {
            cancelAnimationFrame(window.t1)
            setRunning(false)

        }, reset: () => {
            setClock(0);
        }
    }]

}
