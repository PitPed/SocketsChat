import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { text } from "stream/consumers";

export default function Message(props: {
  message: string;
  date: string;
  from: string;
  ownMessage: boolean;
}) {
  let messageStyle = props.ownMessage
    ? styles.ownMessage
    : styles.othersMessage;

  function getUserColor() {
    const seed = 128453;
    let accumulator = seed;

    for (let letter of props.from) {
      accumulator *= letter.charCodeAt(0);
    }

    let color = "#" + (accumulator % 16777214).toString(16);
    console.log(color);
    return color;
  }

  function getContrastingColor() {
    const validColors = [
      "rgb(205, 11, 196)",
      "rgb(155, 70, 150)",
      "rgb(105, 99, 105)",
      "rgb(146, 81, 230)",
      "rgb(81, 106, 230)",
      "rgb(8, 130, 86)",
      "rgb(9, 117, 155)",
      "rgb(99, 102, 105)",
    ];

    let accumulator = 1;

    for (let letter of props.from) {
      accumulator *= letter.charCodeAt(0);
    }

    return validColors[accumulator % validColors.length];
  }

  return (
    <View style={[styles.messageBox, messageStyle]}>
      <Text style={[styles.username, { color: getContrastingColor() }]}>
        {props.from}
      </Text>
      <View style={styles.wrapper}>
        <Text style={styles.text}>{props.message}</Text>
      </View>
      <Text style={styles.date}>{props.date}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBox: {
    padding: 8,
    display: "flex",
    borderRadius: 8,
    minWidth: "30%",
    maxWidth: "60%",
    flexWrap: "wrap",
  },
  ownMessage: {
    backgroundColor: "lightblue",
    alignSelf: "flex-start",
  },
  othersMessage: {
    backgroundColor: "lightgray",
    alignSelf: "flex-end",
  },
  username: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  text: {
    alignSelf: "center",
    justifyContent: "center",
  },
  wrapper: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  date: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
});
