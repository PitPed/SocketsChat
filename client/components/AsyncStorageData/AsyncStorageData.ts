import AsyncStorage from "@react-native-async-storage/async-storage";
import { MessageType } from "../../Connections/WebSocketData";
import { connectedUser } from "../../Connections/WebSocketData";

export type Group = {
  name: string;
  messages: MessageType[];
};

export async function storeMessage(message: MessageType) {
  const groupName: string =
    message.to == connectedUser ? message.from : message.to;
  const group: Group = { name: groupName, messages: [message] };
  await storeGroup(group);
}

async function getGroups(): Promise<{}>{
  return JSON.parse(await AsyncStorage.getItem('groups'))
}

async function storeGroup(group: Group): Promise<boolean> {
  try {
    let newGroup = {};
    newGroup[group.name]= group
    await AsyncStorage.mergeItem('groups',JSON.stringify(newGroup));
    return true;
  } catch (e) {
    return false;
  }
}

export async function getGroup(groupName: string): Promise<Group | false> {
  let groups = await getGroups();
  if (groups == undefined) return false;
  console.log(groups)
  return groups[groupName] as Group;
}

export async function getGroupNames(): Promise<readonly string[]> {
  return Object.keys(await getGroups());
}

export async function setConnectedUser(username: string) {
  let lastUser = await AsyncStorage.getItem("lastUser");
  if (username != lastUser) {
    await AsyncStorage.clear();
    return await AsyncStorage.setItem("lastUser", username);
  } else {
    return true;
  }
}
