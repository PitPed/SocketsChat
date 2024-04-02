import { useEffect, useRef, useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import { wsSendMessageTo } from "../../Connections/WebSocketData";
import React from "react";

export default function MessageForm(props: { currentGroup: string }) {
  const [nextMessage, setNextMessage] = useState("");

  this.textInput = useRef();
  useEffect(() => {}, [props.currentGroup]);

  function sendMessage() {
    wsSendMessageTo("group", props.currentGroup, nextMessage);
    setNextMessage("");
    setTimeout(() => {
      this.textInput.current.focus();
    }, 50);
  }

  return (
    <View style={styles.container}>
      <TextInput
        ref={this.textInput}
        style={styles.textInput}
        onChangeText={setNextMessage}
        value={nextMessage}
        onSubmitEditing={() => sendMessage()}
        blurOnSubmit
        multiline
        autoFocus
      />
      <Pressable style={styles.sendButton} onPress={() => sendMessage()}>
        <Text>Send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    display: "flex",
    flexDirection: "row",
    height: "10%",
    width: "100%",
    gap: 8,
  },
  textInput: {
    borderColor: "black",
    borderWidth: 1,
    flexGrow: 2,
    borderRadius: 4,
    overflow: "visible",
    padding: 8,
    textAlignVertical: "top",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightblue",
    borderRadius: 4,
    width: "10%",
  },
});
