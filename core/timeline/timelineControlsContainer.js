import { defaults } from "lodash";
import React  from 'react';
import { CursorHelpers } from "victory-cursor-container";
import { createContainer, VictoryClipContainer } from "victory-native";
import NativeZoomHelpers from "./zoomHelpers";

//region Constants for Custom Gesture Handling

const VictoryCombinedContainer = createContainer("zoom", "cursor");

// Gesture States, used to ensure that only one type of gesture can be performed
// for a given user interation. The user must lift all fingers before doing a
// different gesture.
const GESTURE_STATE = {
    READY: "READY",
    CURSOR: "CURSOR",
    PAN_OR_ZOOM: "PAN_OR_ZOOM",
    PAN: "PAN",
    ZOOM: "ZOOM",
    INVALID: "INVALID"
};

/**
 * Generic mutator for setting the custom container's gesture state.
 */
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

// Reusable mutators for specific gesture states
const setGestureStateReady = setGestureState(GESTURE_STATE.READY);
const setGestureStateCursor = setGestureState(GESTURE_STATE.CURSOR);
const setGestureStatePanOrZoom = setGestureState(GESTURE_STATE.PAN_OR_ZOOM);
const setGestureStatePan = setGestureState(GESTURE_STATE.PAN);
const setGestureStateZoom = setGestureState(GESTURE_STATE.ZOOM);
const setGestureStateInvalid = setGestureState(GESTURE_STATE.INVALID);

/**
 * Mutator for indicating that the user has multi-touched during the course of
 * the current gesture input. Required because of the iOS 12 gesture event
 * buggyness.
 */
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

/**
 * Helper function to get the pinch distance from the native event data.
 */
getPinchDistance = (nativeEvent) => {
    return Math.abs(nativeEvent.touches[0].locationX - nativeEvent.touches[1].locationX)
};

/**
 * Helper function to get the average pinch location from the native event data.
 */
getPinchPosition = (nativeEvent) => {
    return (nativeEvent.touches[0].locationX + nativeEvent.touches[1].locationX) / 2
};

/**
 * Mutator to save the initial pinch distance. Needed to eventually determine if
 * the user is two-finger panning or two-finger zooming.
 */
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

//endregion Constants for Custom Gesture Handling


//region Debug Helper Functions

/**
 * Mutator for printing information about the mutator. Helpful when trying to
 * understand what the victory cursor/zoom helpers are doing.
 */
printMutator = (mutator) => {
    return {
        ...mutator,
        mutation: (props) => {
            let results = mutator.mutation(props);
            console.log("        mutate:", props, results);
            return results;
        }
    }
}

/**
 * Mutator for storing the initial x & y values. Seems redundant since the
 * onTouchStart already triggers the Native Zoom Helper's onTouchStart...
 * though I'm not entirely sure I should be doing that since its not clear
 * during onTouchStart whether the user intends to pan/zoom or just move the
 * cursor.
 */
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

//endregion Debug Helper Functions


//region Custom Zoom/Pan/Cursor Container

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
        const {disable} = props;
        return [{
            target: "parent",
            eventHandlers: {

                // On Touch Start Event Handler
                onTouchStart: (evt, targetProps, eventKey, ctx) => {
                    if (disable) {
                        return;
                    }

                    let mutators = [setGestureStateReady, setMultiTouched(false)];
                    // mutators.push(setStartXY(evt.nativeEvent)); // TODO: add back just to be careful?
                    let zoomMutators = NativeZoomHelpers.onTouchStart(evt, targetProps, eventKey, ctx);
                    mutators.push.apply(mutators, zoomMutators);
                    return mutators;
                },

                // On Touch Move Event Handler
                onTouchMove: (evt, targetProps, eventKey, ctx) => {
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

                    return mutators;
                },

                // On Touch Pinch Event Handler
                onTouchPinch: (evt, targetProps, eventKey, ctx) => {
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
                            // Need to determine if Panning or Zooming...
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

                    return mutators;
                },

                // On Touch End Event Handler
                onTouchEnd: (evt, targetProps, eventKey, ctx) => {
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

                    return mutators;
                }

            }
        }];
    };
}

//endregion Custom Zoom/Pan/Cursor Container
