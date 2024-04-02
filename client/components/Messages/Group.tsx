import { View, Text, StyleSheet, Pressable } from "react-native";

export default function Group(props: {
  groupName: string;
  currentGroupSetter: Function;
}) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        props.currentGroupSetter(props.groupName);
      }}
    >
      <Text>{props.groupName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "grey",
    borderWidth: 1,
    height: 64,
  },
});
