import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View, StyleSheet } from "react-native";
import { wsCreateGroup } from "../../Connections/WebSocketData";

export default function GroupCreator() {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([""]);

  function updateMember(index: number, newName: string) {
    let nextMembers = members.map((member, i) => {
      if (newName === "") return undefined;
      else if (i == index) return newName;
      else return member;
    });
    nextMembers.filter((member) => member != undefined);
    if (newName != "" && members[members.length - 1] != "")
      nextMembers.push("");
    setMembers(nextMembers);
  }

  function createGroup() {
    console.log(members);
    wsCreateGroup(groupName, members);
    setMembers([""]);
    setGroupName("");
  }
  return (
    <View>
      <Text>Introduce el nombre del grupo</Text>
      <TextInput value={groupName} onChangeText={setGroupName}></TextInput>
      <View>
        <Text>Miembros</Text>
        {members.map((member, index) => {
          return (
            <TextInput
              key={index}
              value={member}
              onChangeText={(newText) => {
                updateMember(index, newText);
              }}
            ></TextInput>
          );
        })}
      </View>
      <Pressable onPress={createGroup}>
        <Text>Create Group</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({});
