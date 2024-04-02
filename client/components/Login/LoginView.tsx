import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import { wsConnectAs } from "../../Connections/WebSocketData";

export default function LoginView({ navigation }) {
  const [username, setUsername] = useState("");

  function connect() {
    wsConnectAs(username);
    navigation.navigate("Messages");
  }

  return (
    <View>
      <Text>Login view</Text>
      <Text>Introduce tu nombre de usuario</Text>
      <TextInput
        onChangeText={setUsername}
        placeholder="username"
        onSubmitEditing={connect}
        autoFocus
      ></TextInput>
      <Button title="Connect" onPress={connect}></Button>
    </View>
  );
}
