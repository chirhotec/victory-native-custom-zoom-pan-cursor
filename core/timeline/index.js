import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewPropTypes
} from "react-native";
import PlayButton from "./playButton";
import TimelineChart from "./timelineChart";
import * as Styles from "../styles";

const TIMELINE_HEIGHT = Styles.Sizes.scale(75);
const TIMELINE_WIDTH = Dimensions.get("window").width - TIMELINE_HEIGHT;
const INITIAL_MIN_DATA_ROWS = 5;

export class Timeline extends Component {
  static propTypes = {
    style: ViewPropTypes.style,
    onTimelineTouchStart: PropTypes.func,
    onTimelineTouchEnd: PropTypes.func
  };

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      playState: "stopped",
      data: [],
      selectedDataIndex: 0,
      currentPlayTime: 0,
      totalTime: 30
    };

    // NOTE: This is not a good example of how to use the Animated library.
    //       Its only used to simulate the value of the current play time,
    //       which, in my real application, is controlled by an entirely
    //       different mechanism.
    this._currentPlayTimeAnimation = null;
    this._currentPlayTimeAnimatedValue = new Animated.Value(0);
    this._currentPlayTimeAnimatedValue.addListener((progress) => {
      this.setState({currentPlayTime: progress.value})
    })
  }

  componentWillMount() {
    if (this.state.data.length < INITIAL_MIN_DATA_ROWS) {
      this.addDataRows(INITIAL_MIN_DATA_ROWS - this.state.data.length);
    }
  }

  render() {
    return (
      <View
        style={[styles.container, this.props.style]}
        onLayout={event => {
          let height = event.nativeEvent.layout.height;
          this.setState({ height: height });
        }}
      >
        <PlayButton
          size={TIMELINE_HEIGHT}
          playState={this.state.playState}
          currentPlayTime={this.state.currentPlayTime}
          totalTime={this.state.totalTime}
          onMeasure={this._onMeasurePlayButton.bind(this)}
          onPlay={() => this._setPlayState("playing")}
          onPause={() => this._setPlayState("paused")}
          onStop={() => this._setPlayState("stopped")}
        />
        <TimelineChart
          width={TIMELINE_WIDTH}
          height={TIMELINE_HEIGHT}
          data={this.state.data}
          selectedEffectID={"" + this.state.selectedDataIndex}
          currentPlayTime={this.state.currentPlayTime}
          onCurrentPlayTimeChanged={newPlayTime => {
            if (this.state.playState !== "paused") {
              this._setPlayState("paused");
            }
            this.setState({currentPlayTime: newPlayTime});
            this._currentPlayTimeAnimatedValue.setValue(newPlayTime);
          }}
          onTouchStart={this.props.onTimelineTouchStart}
          onTouchEnd={this.props.onTimelineTouchEnd}
        />
      </View>
    );
  }

  _setPlayState(newPlayState) {
    if (this.state.playState !== newPlayState) {

      let stateChanges = {
        playState: newPlayState
      };

      switch(newPlayState) {
        case "playing":
          this._currentPlayTimeAnimation = Animated.timing(
            this._currentPlayTimeAnimatedValue,
            {
              toValue: 30,
              duration: (30 - this.state.currentPlayTime) * 1000,
              easing: Easing.linear
            }
          );
          this._currentPlayTimeAnimation.start((results) => {
            console.log("animation stopped", results);
            if (results.finished) {
              this._setPlayState("stopped");
            }
          });
          break;
        case "paused":
          if (this._currentPlayTimeAnimation) {
            this._currentPlayTimeAnimation.stop();
          }
          break;
        case "stopped":
          this._currentPlayTimeAnimatedValue.setValue(0);
          break;
      }

      this.setState(stateChanges);
    }
  }

  _onMeasurePlayButton(ox, oy, width, height, px, py) {
    // This function is needed by my main application
    // https://media.tenor.com/images/51a50a53a05f09fe7e409162230392b4/tenor.gif
    console.log("Recording play button position and size...");
  }

  _getRandomWithinRange(range) {
      let delta = range[1] - range[0];
      return (Math.random() * delta) + range[0];
  }

  addDataRows(rowsToInsert) {
    let newData = [...this.state.data];
    for (let i = 0; i < rowsToInsert; i++) {
      let index = newData.length;
      let startTime = this._getRandomWithinRange([0,29]);
      let timeLength = this._getRandomWithinRange([1,10]);
      newData.push({
        blockID: index,
        index: index,
        delay: startTime,
        duration: timeLength,
        end: startTime + timeLength
      });
    }
    this.setState({ data: newData });
  }

  selectNext() {
    this.setState({
        selectedDataIndex: Math.min(this.state.selectedDataIndex + 1, this.state.data.length - 1)
    });
  }

  selectPrev() {
    this.setState({
        selectedDataIndex: Math.max(this.state.selectedDataIndex - 1, 0)
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  wrapper: {
    flex: 1
  }
});

export default Timeline;
