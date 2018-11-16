import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import {
    LineSegment, VictoryAxis, VictoryBar, VictoryChart, VictoryLine, VictoryTheme
} from "victory-native";
import TimelineControlsContainer from "./timelineControlsContainer";
import timelineChartTheme from "./timelineChartTheme";
import * as Styles from "../styles";

const HEADER_HEIGHT_PERCENTAGE = 0.2;
const MAX_EVENTS_DISPLAYED = 10;

class TimelineChart extends Component {

    static propTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        data: PropTypes.array,
        selectedEffectID: PropTypes.string,
        currentPlayTime: PropTypes.number,
        defaultMaxTimeDisplayed: PropTypes.number,
        minTimeRange: PropTypes.number,
        maxTimeRange: PropTypes.number,
        dataRowHeightRatio: PropTypes.number,
        onCurrentPlayTimeChanged: PropTypes.func,
        onTouchStart: PropTypes.func,
        onTouchEnd: PropTypes.func
    };

    static defaultProps = {
        data: [],
        selectedEffectID: null,
        currentPlayTime: 0,
        defaultMaxTimeDisplayed: 30,
        minTimeRange: 0,
        maxTimeRange: 30,
        dataRowHeightRatio: (3 / 5)
    };

    constructor(props) {
        super(props);

        this.state = {
            xDomainZoomable: this._getXDomainZoomableFromProps(props),
            xDomainCurrent: [this.props.minTimeRange, this.props.defaultMaxTimeDisplayed],
            yDomainPaged: this._getYDomainPagedFromProps(props),
            headerHeight: this.props.height * HEADER_HEIGHT_PERCENTAGE,
            eventHeight: this._computeEventHeight(props.height)
        };
    }

    componentWillReceiveProps(nextProps) {
        // TODO: https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
        let stateChanged = false;
        let stateChanges = {};

        // Process changes to the y domain pagination
        if (nextProps.data !== this.props.data || nextProps.selectedEffectID !== this.props.selectedEffectID) {
            let yDomainPaged = this._getYDomainPagedFromProps(nextProps);
            if (this.state.yDomainPaged[0] != yDomainPaged[0] || this.state.yDomainPaged[1] != yDomainPaged[1]) {
                stateChanged = true;
                stateChanges.yDomainPaged = yDomainPaged;
            }
        }

        // Process changes to zoomable time range
        if (nextProps.minTimeRange != this.props.minTimeRange || nextProps.maxTimeRange != this.props.maxTimeRange) {
            stateChanged = true;
            stateChanges.xDomainZoomable = this._getXDomainZoomableFromProps(nextProps);
        }

        // Process changes to the current play time
        if (nextProps.currentPlayTime != this.props.currentPlayTime) {
            stateChanged = true;
            stateChanges.currentPlayTime = nextProps.currentPlayTime;
        }

        // Process changes to the height
        if (nextProps.height != this.props.height) {
            let eventHeight = this._computeEventHeight(nextProps.height);
            if (eventHeight != this.state.eventHeight) {
                stateChanged = true;
                stateChanges.eventHeight = eventHeight;
            }
        }

        if (stateChanged) {
            this.setState(stateChanges);
        }
    }

    _computeEventHeight(componentHeight) {
        let dataAreaHeight = componentHeight * (1 - HEADER_HEIGHT_PERCENTAGE);
        return (dataAreaHeight / MAX_EVENTS_DISPLAYED) * this.props.dataRowHeightRatio;
    }

    render() {
        let data = this._getData();
        let {headerHeight, eventHeight} = this.state;
        let zoomableDomain = {
            x: this.state.xDomainZoomable,
            y: this.state.yDomainPaged
        };
        let zoomedDomain = {
            x: this.state.xDomainCurrent,
            y: this.state.yDomainPaged
        };
        return (
            <View
                style={[styles.container]}>
                <View style={styles.background}>
                    <View style={[{width: this.props.width, height: headerHeight}, styles.backgroundHeader]}/>
                </View>
                <VictoryChart
                    horizontal
                    theme={timelineChartTheme}
                    padding={{top: headerHeight}}
                    width={this.props.width}
                    height={this.props.height}
                    domain={zoomableDomain}
                    containerComponent={
                        <TimelineControlsContainer
                            domain={zoomableDomain}
                            zoomDomain={zoomedDomain}
                            cursorComponent={<LineSegment style={{stroke: "transparent", strokeWidth: 0}}/>}
                            onZoomDomainChange={this._onDomainChange.bind(this)}
                            onCursorChange={this._onCursorChange.bind(this)}
                            zoomDimension="x"
                            onTouchStart={() => {
                                if (this.props.onTouchStart) {
                                    this.props.onTouchStart();
                                }
                            }}
                            onTouchEnd={() => {
                                if (this.props.onTouchEnd) {
                                    this.props.onTouchEnd();
                                }
                            }}
                        />
                    }
                >
                    <VictoryAxis
                        orientation="top"
                        crossAxis={false}
                        style={{ticks: {size: headerHeight}, tickLabels: {dy: headerHeight * .85}}}/>
                    <VictoryAxis invertAxis dependentAxis/>
                    <VictoryBar
                        style={{
                            data: {
                                fill: (d) => {
                                    if (d.blockID == this.props.selectedEffectID) {
                                        return Styles.Colors.SECONDARY_DARK;
                                    } else {
                                        return Styles.Colors.PRIMARY_DARK;
                                    }
                                },
                                width: eventHeight
                            }
                        }}
                        data={data}
                        x={(d) => d.index + 0.5}
                        y0="delay"
                        y={(d) => d.delay + d.duration}
                    />
                    <VictoryLine
                        style={timelineChartTheme.playhead}
                        data={[
                            {x: this.props.currentPlayTime, y: this.state.yDomainPaged[0]},
                            {x: this.props.currentPlayTime, y: this.state.yDomainPaged[1]}
                        ]}/>
                </VictoryChart>
            </View>
        )
    }

    _onCursorChange(value) {
        if (value != null) {
            // NOTE: Its not necessary to set the currentPlayTime value in the state, because its managed
            //       by the Component that maintains the chart
            if (this.props.onCurrentPlayTimeChanged) {
                this.props.onCurrentPlayTimeChanged(value);
            }
        }
    }

    _onDomainChange(domain) {
        this.setState({xDomainCurrent: domain.x});
    }

    _getData() {
        const {xDomainCurrent, yDomainPaged} = this.state;
        return this.props.data.filter(
            // start time must be before end of x-domain, and end time must be after start of x-domain
            // index must be within y view domain
            (d) => (
                //d.delay <= xDomainCurrent[1] && (d.delay + d.duration) >= xDomainCurrent[0] &&
                d.index < yDomainPaged[0] && d.index >= yDomainPaged[1]
            )
        )
    }

    _getXDomainZoomableFromProps(props) {
        return [props.minTimeRange, props.maxTimeRange];
    }

    _getYDomainPagedFromProps(props) {
        // Determine index of selected effect
        const selectedEffect = this.props.data.find((d) => d.blockID == props.selectedEffectID);
        let index = 0;
        if (selectedEffect) {
            index = selectedEffect.index;
        }

        // Compute first and last indices of y domain, based on selected index and number of displayed events
        index = Math.max(index, 0);
        let remainder = index % MAX_EVENTS_DISPLAYED;
        let firstIndex = index - remainder;
        let lastIndex = firstIndex + MAX_EVENTS_DISPLAYED;

        // Return [last, first] index range, since axis is inverted
        return [lastIndex, firstIndex];
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: Styles.Colors.NEUTRAL_LIGHT
    },
    backgroundHeader: {
        backgroundColor: Styles.Colors.NEUTRAL
    }
});

export default TimelineChart;
