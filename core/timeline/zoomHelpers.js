/**
 * This class is only needed to address victory issue #1184
 * https://github.com/FormidableLabs/victory/issues/1184
 */
import { defaults, throttle } from "lodash";
import { Children } from "react";
import { Collection, Wrapper } from "victory-core";
import { Helpers } from "./zoomHelpersNative";

const ZoomHelpers = {
    ...Helpers,

    /**
     * Overriding RawZoomHelper's implementation of getDomain, to account for error in x domain
     */
    getDomain(props) {
        const {originalDomain, domain, children, zoomDimension, horizontal} = props;
        let xAxis = "x", yAxis = "y", zoomAxis = zoomDimension;
        if (horizontal) {
          xAxis = "y";
          yAxis = "x";
          if (zoomDimension) {
            zoomAxis = {x:xAxis, y:yAxis}[zoomDimension]
          }
        }
        const childComponents = Children.toArray(children);
        let childrenDomain = {};
        if (childComponents.length) {
            childrenDomain = zoomDimension ?
                {[zoomDimension]: Wrapper.getDomainFromChildren(props, zoomAxis, childComponents)}
                : ({
                    x: Wrapper.getDomainFromChildren(props, xAxis, childComponents),
                    y: Wrapper.getDomainFromChildren(props, yAxis, childComponents)
                });
        }
        return defaults({}, childrenDomain, originalDomain, domain);
    },
};

const makeThrottledHandler = (handler) => {
    const throttledHandler = throttle(handler, 32, { leading: true });
    return (evt, ...otherParams) => {
        evt.persist(); // ensure that the react native event is persisted!
        return throttledHandler(evt, ...otherParams);
    };
};

export default {
    onTouchStart: ZoomHelpers.onMouseDown.bind(ZoomHelpers),
    onTouchEnd: ZoomHelpers.onTouchEnd.bind(ZoomHelpers),
    onTouchMove: makeThrottledHandler(ZoomHelpers.onMouseMove.bind(ZoomHelpers)),
    onTouchPinch: makeThrottledHandler(ZoomHelpers.onTouchPinch.bind(ZoomHelpers))
};
