import { useState } from "react";
import GroupContainer from "./GroupContainer";
import MessageForm from "./MessageForm";
import MessagesContainer from "./MessagesContainer";
import { StyleSheet, Text, View } from "react-native";

export default function MessageView() {
  const [currentGroup, setCurrentGroup] = useState("broadcast");
  return (
    <View style={styles.mainContainer}>
      <View style={styles.groupAndChatContainer}>
        <GroupContainer currentGroupSetter={setCurrentGroup}></GroupContainer>
        <MessagesContainer currentGroup={currentGroup}></MessagesContainer>
      </View>
      <MessageForm currentGroup={currentGroup}></MessageForm>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  groupAndChatContainer: {
    flexGrow: 2,
    display: "flex",
    flexDirection: "row",
    height: "90%",
  },
});
