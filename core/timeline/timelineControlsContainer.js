import { defaults } from "lodash";
import React  from 'react';
import { CursorHelpers } from "victory-cursor-container";
import { createContainer, VictoryClipContainer } from "victory-native";
import NativeZoomHelpers from "./zoomHelpers";

//region Constants for Custom Gesture Handling

const ALLOW_PRINT = false;

const VictoryCombinedContainer = createContainer("zoom", "cursor");

const GESTURE_STATE = {
    READY: "READY",
    CURSOR: "CURSOR",
    PAN_OR_ZOOM: "PAN_OR_ZOOM",
    PAN: "PAN",
    ZOOM: "ZOOM",
    INVALID: "INVALID"
};

setGestureState = (gestureState) => {
    return {
        target: 'parent',
        mutation: (props) => {
            return {
                gestureState: gestureState
            };
        }
    };
};

const setGestureStateReady = setGestureState(GESTURE_STATE.READY);
const setGestureStateCursor = setGestureState(GESTURE_STATE.CURSOR);
const setGestureStatePanOrZoom = setGestureState(GESTURE_STATE.PAN_OR_ZOOM);
const setGestureStatePan = setGestureState(GESTURE_STATE.PAN);
const setGestureStateZoom = setGestureState(GESTURE_STATE.ZOOM);
const setGestureStateInvalid = setGestureState(GESTURE_STATE.INVALID);

setMultiTouched = (multiTouched) => {
    return {
        target: 'parent',
        mutation: (props) => {
            return {
                multiTouched: multiTouched
            };
        }
    }
};

//endregion Constants for Custom Gesture Handling

//region Debug Helper Functions

const print = (...args) => {
    if (ALLOW_PRINT)
        console.log(...args);
};

const printArgs = (evt, targetProps, eventKey, ctx) => {
    print([evt, targetProps, eventKey, ctx]);
};

const printSeparator = () => {
    print("====================================================================================================");
};

const printEventName = (name) => {
    print("--------------------------------------------------------------- on touch " + name);
};

printMutator = (mutator) => {
    return {
        ...mutator,
        mutation: (props) => {
            let results = mutator.mutation(props);
            print("        mutate:", props, results);
            return results;
        }
    }
}

setStartXY = (nativeEvent) => {
    return {
        target: 'parent',
        mutation: (props) => {
            return {
                startX: nativeEvent.locationX,
                startY: nativeEvent.locationY
            }
        }
    }
};

getPinchDistance = (nativeEvent) => {
    return Math.abs(nativeEvent.touches[0].locationX - nativeEvent.touches[1].locationX)
};

getPinchPosition = (nativeEvent) => {
    return (nativeEvent.touches[0].locationX + nativeEvent.touches[1].locationX) / 2
};

setOriginalPinchValues = (nativeEvent) => {
    return {
        target: 'parent',
        mutation: (props) => {
            return {
                pinchPosition0: getPinchPosition(nativeEvent),
                pinchDistance0: getPinchDistance(nativeEvent),
                originalPinchDistance: getPinchDistance(nativeEvent)
            };
        }
    }
};


//endregion Debug Helper Functions

//region Debug Helper Event Handlers

printEventNames = (props) => {
    const {disable} = props;
    const incrementCounter = (props) => {

    };
    return [{
        target: "parent",
        eventHandlers: {
            onTouchStart: (evt, targetProps, eventKey, ctx) => {
                printSeparator();
                printEventName("  START");
            },
            onTouchMove: (evt, targetProps, eventKey, ctx) => {
                printEventName("   MOVE");
            },
            onTouchPinch: (evt, targetProps, eventKey, ctx) => {
                printEventName("  PINCH");
            },
            onTouchEnd: (evt, targetProps, eventKey, ctx) => {
                printEventName("    END");
                printSeparator();
            }
        }
    }];
};

printEventArgs = (props) => {
    return [{
        target: "parent",
        eventHandlers: {
            onTouchStart: (evt, targetProps, eventKey, ctx) => {
                printSeparator();
                printEventName("  START");
                printArgs(evt, targetProps, eventKey, ctx);
            },
            onTouchMove: (evt, targetProps, eventKey, ctx) => {
                printEventName("   MOVE");
                printArgs(evt, targetProps, eventKey, ctx);
            },
            onTouchPinch: (evt, targetProps, eventKey, ctx) => {
                printEventName("  PINCH");
                printArgs(evt, targetProps, eventKey, ctx);
            },
            onTouchEnd: (evt, targetProps, eventKey, ctx) => {
                printEventName("    END");
                printArgs(evt, targetProps, eventKey, ctx);
                printSeparator();
            }
        }
    }];
};

printTouches = (props) => {
    return [{
        target: "parent",
        eventHandlers: {
            onTouchStart: (evt, targetProps, eventKey, ctx) => {
                printSeparator();
                print("START ", evt.nativeEvent);
            },
            onTouchMove: (evt, targetProps, eventKey, ctx) => {
                print("MOVE  ", evt.nativeEvent);
            },
            onTouchPinch: (evt, targetProps, eventKey, ctx) => {
                print("PINCH ", evt.nativeEvent);
            },
            onTouchEnd: (evt, targetProps, eventKey, ctx) => {
                print("END   ", evt.nativeEvent);
                printSeparator();
            }
        }
    }];
};

cursorEvents = (props) => {
    const {disable} = props;
    return [{
        target: "parent",
        eventHandlers: {
            onTouchStart: (evt, targetProps, eventKey, ctx) => { // eslint-disable-line max-params
                printSeparator();
                print("START ", [evt.nativeEvent, targetProps]);
                return [];
            },
            onTouchMove: (evt, targetProps, eventKey, ctx) => { // eslint-disable-line max-params
                print("MOVE  ", [evt.nativeEvent, targetProps]);
                let cursorResults = CursorHelpers.onMouseMove(evt, targetProps);
                print(cursorResults);
                return cursorResults.map(printMutator);
            },
            onTouchEnd: (evt, targetProps, eventKey, ctx) => { // eslint-disable-line max-params
                print("END   ", [evt.nativeEvent, targetProps]);
                return []
            }
        }
    }];
};

zoomEvents = (props) => {
    const {disable} = props;
    return [{
        target: "parent",
        eventHandlers: {
            onTouchStart: (evt, targetProps, eventKey, ctx) => { // eslint-disable-line max-params
                printSeparator();
                print("START ", [evt.nativeEvent, targetProps]);
                let mutators = [];
                let zoomMutators = NativeZoomHelpers.onTouchStart(evt, targetProps, eventKey, ctx);
                mutators.push.apply(mutators, zoomMutators);
                return mutators.map(printMutator);
            },
            onTouchMove: (evt, targetProps, eventKey, ctx) => { // eslint-disable-line max-params
                print("MOVE  ", [evt.nativeEvent, targetProps]);
                let mutators = [];
                let zoomMutators = NativeZoomHelpers.onTouchMove(evt, targetProps, eventKey, ctx);
                if (!zoomMutators) {
                    return zoomMutators;
                }
                mutators.push.apply(mutators, zoomMutators);
                return mutators.map(printMutator);
            },
            onTouchPinch: (evt, targetProps, eventKey, ctx) => { // eslint-disable-line max-params
                print("PINCH ", [evt.nativeEvent, targetProps]);
                let mutators = [];
                let zoomMutators = NativeZoomHelpers.onTouchPinch(evt, targetProps, eventKey, ctx);
                mutators.push.apply(mutators, zoomMutators);
                return mutators.map(printMutator);
            },
            onTouchEnd: (evt, targetProps, eventKey, ctx) => { // eslint-disable-line max-params
                print("END   ", [evt.nativeEvent, targetProps]);
                let mutators = [];
                let zoomMutators = NativeZoomHelpers.onTouchEnd(evt, targetProps, eventKey, ctx);
                mutators.push.apply(mutators, zoomMutators);
                return mutators.map(printMutator);
            }
        }
    }];
};

//endregion Debug Helper Event Handlers


//region Real Event Handler

realEvents = (props) => {
    const {disable} = props;
    return [{
        target: "parent",
        eventHandlers: {

            // On Touch Start Event Handler
            onTouchStart: (evt, targetProps, eventKey, ctx) => {
                printSeparator();
                print("1 - START ", targetProps.gestureState, [targetProps, evt.nativeEvent]);
                if (disable) {
                    return;
                }

                let mutators = [setGestureStateReady, setMultiTouched(false)];
                // mutators.push(setStartXY(evt.nativeEvent)); // TODO: add back just to be careful?
                let zoomMutators = NativeZoomHelpers.onTouchStart(evt, targetProps, eventKey, ctx);
                mutators.push.apply(mutators, zoomMutators);
                return mutators.map(printMutator);
            },

            // On Touch Move Event Handler
            onTouchMove: (evt, targetProps, eventKey, ctx) => {
                print("2 - MOVE  ", targetProps.gestureState, [targetProps, evt.nativeEvent]);
                if (disable) {
                    return;
                }

                let mutators = [];
                switch (targetProps.gestureState) {
                    case GESTURE_STATE.READY:
                        if (evt.nativeEvent.touches.length > 1) {
                            // NOTE: Originally this was registered as INVALID, so as to prevent the user from
                            //       triggering the cursor movement. However, with iOS 12, when pinching, onTouchMove is
                            //       called after every call to onTouchPinch, and also contains two touches
                        } else {
                            let distanceMoved = Math.abs(targetProps.startX - evt.nativeEvent.locationX);
                            if (distanceMoved >= targetProps.cursorMovementThreshold) {
                                mutators.push(setGestureStateCursor);
                                let cursorMutators = CursorHelpers.onMouseMove(evt, targetProps);
                                mutators.push.apply(mutators, cursorMutators);
                            }
                        }
                        break;
                    case GESTURE_STATE.CURSOR:
                        if (evt.nativeEvent.touches.length > 1) {
                            // NOTE: Originally this was registered as INVALID, so as to prevent the user from
                            //       triggering the cursor movement. However, with iOS 12, when pinching, onTouchMove is
                            //       called after every call to onTouchPinch, and also contains two touches
                        } else {
                            let cursorMutators = CursorHelpers.onMouseMove(evt, targetProps);
                            mutators.push.apply(mutators, cursorMutators);
                        }
                        break;
                    case GESTURE_STATE.PAN_OR_ZOOM:
                    case GESTURE_STATE.PAN:
                    case GESTURE_STATE.ZOOM:
                        // Do nothing.
                        // NOTE: Originally this was registered as INVALID, so as to prevent the user from triggering
                        //       the cursor movement. However, with iOS 12, when pinching, onTouchMove is called after
                        //       every call to onTouchPinch.
                        break;
                    default:
                        // don't need to do anything
                        break;
                }

                return mutators.map(printMutator);
            },

            // On Touch Pinch Event Handler
            onTouchPinch: (evt, targetProps, eventKey, ctx) => {
                print("3 - PINCH ", targetProps.gestureState, [targetProps, evt.nativeEvent]);

                if (disable) {
                    return;
                }

                let mutators = [];
                if (!targetProps.multiTouched) {
                    mutators.push(setMultiTouched(true));
                }
                let zoomMutators = null;
                switch (targetProps.gestureState) {
                    case GESTURE_STATE.READY:
                        mutators.push(setGestureStatePanOrZoom);
                        mutators.push(setOriginalPinchValues(evt.nativeEvent));
                        break;
                    case GESTURE_STATE.CURSOR:
                        mutators.push(setGestureStateInvalid);
                        break;
                    case GESTURE_STATE.PAN_OR_ZOOM:
                        // Need to determine if Panning or Zooming
                        let pinchDistance = getPinchDistance(evt.nativeEvent);
                        let pinchPosition = getPinchPosition(evt.nativeEvent);
                        if (Math.abs(pinchDistance - targetProps.pinchDistance0) > targetProps.zoomOnPinchThreshold) {
                            mutators.push(setGestureStateZoom);
                            zoomMutators = NativeZoomHelpers.onTouchPinch(evt, targetProps, eventKey, ctx);
                            if (zoomMutators) {
                                mutators.push.apply(mutators, zoomMutators);
                            }
                        } else if (Math.abs(pinchPosition - targetProps.pinchPosition0) > targetProps.panOnPinchThreshold) {
                            mutators.push(setGestureStatePan);
                            zoomMutators = NativeZoomHelpers.onTouchMove(evt, targetProps, eventKey, ctx);
                            if (zoomMutators) {
                                mutators.push.apply(mutators, zoomMutators);
                            }
                        }
                        break;
                    case GESTURE_STATE.PAN:
                        zoomMutators = NativeZoomHelpers.onTouchMove(evt, targetProps, eventKey, ctx);
                        if (zoomMutators) {
                            mutators.push.apply(mutators, zoomMutators);
                        }
                        break;
                    case GESTURE_STATE.ZOOM:
                        zoomMutators = NativeZoomHelpers.onTouchPinch(evt, targetProps, eventKey, ctx);
                        if (zoomMutators) {
                            mutators.push.apply(mutators, zoomMutators);
                        }
                        break;
                    default:
                        // don't need to do anything
                        break;
                }

                return mutators.map(printMutator);
            },

            // On Touch End Event Handler
            onTouchEnd: (evt, targetProps, eventKey, ctx) => {
                print("4 - END   ", targetProps.gestureState, [targetProps, evt.nativeEvent]);

                let mutators = [setGestureStateReady];

                if (evt.nativeEvent.touches.length < 2 && !targetProps.multiTouched) {
                    if (evt.nativeEvent.touches.length == 0) {
                        // Another hack for iOS 12. For some reason, when tapping, the native event records the touch
                        // values in the changed touches, but not the touches array.
                        evt.nativeEvent.touches = evt.nativeEvent.changedTouches
                    }
                    let cursorMutators = CursorHelpers.onMouseMove(evt, targetProps);
                    mutators.push.apply(mutators, cursorMutators);
                }

                return mutators.map(printMutator);
            }

        }
    }];
};

//endregion Real Event Handler

export default class TimelineControlsContainer extends VictoryCombinedContainer {

    static defaultProps = {
        ...VictoryCombinedContainer.defaultProps,
        clipContainerComponent: <VictoryClipContainer/>,
        zoomDirection: "x",
        panDirection: "x",
        cursorDimension: "x",
        gestureState: GESTURE_STATE.READY,
        multiTouched: false,
        cursorMovementThreshold: 5,
        zoomOnPinchThreshold: 20,
        panOnPinchThreshold: 10,
        originalPinchDistance: 0
    };

    static defaultEvents = (props) => {
        return realEvents(props);
    };
}
