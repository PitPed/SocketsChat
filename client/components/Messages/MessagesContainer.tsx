import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Message from "./Message";
import { connectedUser, ws } from "../../Connections/WebSocketData";
import { Group, getGroup } from "../AsyncStorageData/AsyncStorageData";

export default function MessagesContainer(props: { currentGroup: string }) {
  type MessageType = {
    message: string;
    from: string;
    date: string;
  };

  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    updateMessages(props.currentGroup);
    ws.addEventListener("message", () => updateMessages(props.currentGroup));
  }, [props.currentGroup]);

  async function updateMessages(groupName: string = props.currentGroup) {
    let group: Group | false = await getGroup(groupName);
    if (group == false) return false;
    let messages: MessageType[] = group.messages;
    setMessages(messages);
  }

  return (
    <ScrollView
      style={{ flexGrow: 8.5 }}
      contentContainerStyle={styles.container}
    >
      {messages.map((message, index) => {
        return (
          <Message
            key={index}
            {...message}
            ownMessage={message.from == connectedUser}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 2,
    padding: 8,
    gap: 2,
  },
});
