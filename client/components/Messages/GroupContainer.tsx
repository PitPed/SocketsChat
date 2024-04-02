import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import Group from "./Group";
import { getGroupNames } from "../AsyncStorageData/AsyncStorageData";
import GroupCreator from "./GroupCreator";
import { ws } from "../../Connections/WebSocketData";

export default function GroupContainer(props: {
  currentGroupSetter: Function;
}) {
  const [groups, setGroups] = useState([]);

  function updateGroupNames() {
    getGroupNames().then((groupNames) => {
      setGroups(groupNames as any);
    });
  }

  useEffect(() => {
    updateGroupNames();
    ws.addEventListener("message", () => updateGroupNames());
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.groupContainer}
    >
      <GroupCreator></GroupCreator>
      {groups.map((group, index) => {
        return (
          <Group
            key={index}
            groupName={group}
            currentGroupSetter={props.currentGroupSetter}
          ></Group>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "lightgray",
  },
  groupContainer: {
    borderColor: "black",
    borderWidth: 1,
  },
});
