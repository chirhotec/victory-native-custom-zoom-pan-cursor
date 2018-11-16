/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Timeline from "./timeline";
import * as Styles from "./styles";

const DEFAULT_ROWS_TO_INSERT = 10;
const PREV_BUTTON_TEXT = "<<<  Prev";
const NEXT_BUTTON_TEXT = "Next  >>>";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayTimeline: true,
      rowInputText: "",
      allowScroll: true
    };

    this._rowInputRef = React.createRef();
    this._timelineRef = React.createRef();
  }

  render() {
    if (this.state.displayTimeline) {
      return this.renderTimelineAndControls();
    } else {
      return this.renderTimelinePlaceholder();
    }
  }

  renderTimelinePlaceholder() {
    return (
      <View style={styles.container}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ displayTimeline: true })}
          >
            <Text style={styles.buttonLabel}>Display Timeline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderTimelineAndControls() {
    return (
      <ScrollView
        style={styles.scrollContainer}
        scrollEnabled={this.state.allowScroll}
      >
        <View style={styles.content}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.setState({ displayTimeline: false })}
            >
              <Text style={styles.buttonLabel}>Disable Timeline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={true}
              style={styles.buttonDisabled}
              onPress={() => {}}
            >
              <Text style={styles.buttonLabel}>Reset Timeline</Text>
            </TouchableOpacity>
          </View>
          <Timeline
            ref={this._timelineRef}
            onTimelineTouchStart={() => this._enableScroll(false)}
            onTimelineTouchEnd={() => this._enableScroll(true)}
          />
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this._timelineRef.current.selectPrev()}
            >
              <Text style={styles.buttonLabel}>{PREV_BUTTON_TEXT}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this._timelineRef.current.selectNext()}
            >
              <Text style={styles.buttonLabel}>{NEXT_BUTTON_TEXT}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlsRow}>
            <View style={styles.dataInsertLabelContainer}>
              <Text style={styles.dataInsertLabel}>New data points:</Text>
            </View>
            <TextInput
              ref={this._rowInputRef}
              style={styles.dataInsertInput}
              keyboardType="number-pad"
              placeholder={"" + DEFAULT_ROWS_TO_INSERT}
              placeholderTextColor={Styles.Colors.NEUTRAL_LIGHT}
              onChangeText={text => {
                this.setState({ rowInputText: text });
              }}
              value={this.state.rowInputText}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={this._onInsertDataPressed.bind(this)}
            >
              <Text style={styles.buttonLabel}>Add Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  _enableScroll(enabled) {
    console.log("_enableScroll", enabled);
    this.setState({
      allowScroll: enabled
    });
  }

  _onSelectPrev() {
    this._timelineRef.current.selectPrev();
  }

  _onSelectNext() {
    this._timelineRef.current.selectNext();
  }

  _onInsertDataPressed() {
    let rowsToInsert = Number(this.state.rowInputText);

    // Don't add any rows if an invalid number
    if (!Number.isInteger(rowsToInsert)) {
      this.setState({ rowInputText: "" });
      return;
    }

    // Account for 0 rows
    if (rowsToInsert == 0) {
      if (this.state.rowInputText == "") {
        rowsToInsert = DEFAULT_ROWS_TO_INSERT;
      } else {
        this.setState({ rowInputText: "" });
        return;
      }
    }

    // Add data
    this._timelineRef.current.addDataRows(rowsToInsert);
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Styles.Colors.NEUTRAL
  },
  content: {
    flex: 2,
    justifyContent: "space-around"
  },
  button: {
    flex: 1,
    backgroundColor: Styles.Colors.PRIMARY,
    justifyContent: "center",
    alignContent: "center",
    margin: Styles.Sizes.scale(10)
  },
  buttonDisabled: {
    flex: 1,
    backgroundColor: Styles.Colors.NEUTRAL_LIGHT,
    justifyContent: "center",
    alignContent: "center",
    margin: Styles.Sizes.scale(10)
  },
  buttonLabel: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  controlsRow: {
    backgroundColor: Styles.Colors.VERY_LIGHT,
    flexDirection: "row",
    height: Styles.Sizes.scale(55)
  },
  dataInsertLabelContainer: {
    flex: 1,
    color: Styles.Colors.NEUTRAL_DARK,
    fontWeight: "bold",
    justifyContent: "center",
    margin: Styles.Sizes.scale(10)
  },
  dataInsertLabel: {
    fontWeight: "bold",
    textAlign: "center"
  },
  dataInsertInput: {
    flex: 1,
    color: Styles.Colors.NEUTRAL_DARK,
    borderColor: Styles.Colors.SECONDARY,
    borderBottomWidth: 1,
    textAlign: "center",
    height: Styles.Sizes.scale(35),
    margin: Styles.Sizes.scale(10)
  },
  debugLabel: {
    paddingHorizontal: Styles.Sizes.scale(5)
  },
  debugLabelCurrent: {
    fontWeight: "bold"
  }
});
