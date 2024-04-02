import {
  getGroup,
  setConnectedUser,
  storeMessage,
} from "../components/AsyncStorageData/AsyncStorageData";

const IP = "localhost";
const PORT = 3000;

export let ws = new WebSocket(`ws://${IP}:${PORT}`);
export let connectedUser = "";
console.log("Sending connection to " + ws.url);

export type MessageType = {
  message: string;
  from: string;
  to: string;
  date: string;
};

export function wsConnectAs(username) {
  ws.send(JSON.stringify({ action: "register", username: username }));
  connectedUser = username;
  setConnectedUser(username);
}

export function wsSendMessageTo(
  type: "group" | "user",
  reciever: string,
  message: string
) {
  if (type == "group") wsSendMessageToGroup(reciever, message);
  if (type == "user") wsSendMessageToUser(reciever, message);
}

function wsSendMessageToUser(reciever: string, message: string) {
  ws.send(
    JSON.stringify({
      action: "send-to-user",
      recieverName: reciever,
      message: message,
    })
  );
}

function wsSendMessageToGroup(reciever: string, message: string) {
  ws.send(
    JSON.stringify({
      action: "send-to-group",
      recieverName: reciever,
      message: message,
    })
  );
}

export function wsCreateGroup(groupName: string, memberNames: string[]) {
  ws.send(
    JSON.stringify({
      action: "create-group",
      groupName: groupName,
      memberNames: memberNames,
    })
  );
}

export function wsJoinGroup(groupName: string) {
  ws.send(
    JSON.stringify({
      action: "join-group",
      groupName: groupName,
    })
  );
}

ws.addEventListener("open", () => {
  console.log("Connection succeded");
});

ws.addEventListener("message", async (data) => {
  const message: MessageType = JSON.parse(data.data);
  console.log(message);
  await storeMessage(message);
});
