import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewPropTypes
} from "react-native";
import _ from "lodash";
import * as Styles from "../styles";


class PlayButton extends Component {
  static propTypes = {
    size: PropTypes.number.isRequired,
    style: ViewPropTypes.style,
    playState: PropTypes.string.isRequired,
    currentPlayTime: PropTypes.number.isRequired,
    totalTime: PropTypes.number.isRequired,
    onMeasure: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onStop: PropTypes.func
  };

  static defaultProps = {
    playState: "stopped"
  };

  constructor(props) {
    super(props);
    this._view = React.createRef();
  }

  render() {
    const currentTime = this.props.currentPlayTime.toFixed(0);
    const totalTime = this.props.totalTime.toFixed(0);

    return (
      <Animated.View
        style={[
          styles.container,
          this.props.style,
          {
            width: this.props.size,
            height: this.props.size
          }
        ]}
        >
          <View style={styles.playDataDisplay}>
            <Text style={styles.playDataText}>{this.props.playState}</Text>
          </View>
          <TouchableHighlight
            ref={component => (this._view = component)}
            style={styles.playButton}
            onPress={this._onPress.bind(this)}
            onLongPress={this._onLongPress.bind(this)}
            underlayColor={Styles.Colors.PRIMARY_DARK}
            onLayout={() => this._view.measure(this.props.onMeasure)}
          >
            {this.renderPlayButtonDisplay()}
          </TouchableHighlight>
          <View style={styles.playDataDisplay}>
            <Text style={styles.playDataText}>{currentTime} / {totalTime}</Text>
          </View>
      </Animated.View>
    );
  }

  renderPlayButtonDisplay() {
      let display = null;
      switch (this.props.playState) {
          case "playing":
              display = (<Text style={styles.playButtonLabel}>Pause</Text>);
              break;
          case "stopped":
          case "paused":
          default:
              display = (<Text style={styles.playButtonLabel}>Play</Text>);
              break;
      }
      return display;
  }

  _onPress() {
    switch (this.props.playState) {
      case "playing":
        this._fireEvent("onPause");
        break;
      case "stopped":
      case "paused":
      default:
        this._fireEvent("onPlay");
        break;
    }
  }

  _onLongPress() {
    switch (this.props.playState) {
      case "stopped":
        this._fireEvent("onPlay");
        break;
      case "paused":
      case "playing":
      default:
        this._fireEvent("onStop");
        break;
    }
  }

  _fireEvent(eventName) {
    if (this.props[eventName]) {
      this.props[eventName]();
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    zIndex: 300
  },
  playDataDisplay: {
    backgroundColor: Styles.Colors.PRIMARY_DARK,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playDataText: {
    textAlign: "center",
    color: "white",
  },
  playButton: {
    flex: 3,
    backgroundColor: Styles.Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonLabel: {
    color: "white",
    textAlign: "center",
    fontSize: Styles.Sizes.scale(15),
    fontWeight: "bold"
  }
});


export default PlayButton;
