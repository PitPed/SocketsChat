import { group } from "console";
import {
  Client,
  ClientID,
  DataPackageCreateGroup,
  DataPackageJoinGroup,
  DataPackageRegister,
  DataPackageSendTo,
  Group,
  MessageData,
  NamedWebSocket,
  Sender,
} from "./types";
import {
  saveData,
  dbInit,
  getClientsFromDB,
  getGroupsFromDB,
  getMesagesFromDB,
} from "./dbManager";

const ws = require("ws");

const port = 3000;

const wsServer = new ws.WebSocket.Server({ port: port });

function register(webSocket: WebSocket, data: DataPackageRegister) {
  let namedWebSocket: NamedWebSocket = webSocket as NamedWebSocket;
  namedWebSocket.clientName = data.username;
  namedWebSocket.clientId = (
    newClient(data.username, namedWebSocket) as Client
  ).clientId;
  webSocket.onmessage = null;
  namedWebSocket.onmessage = handleMessage;
  const logMessage = data.username + " has connected";
  sendMessageTo(broadcastGroup, ServerSender, logMessage);
  console.log(logMessage);
}

/* function sendToUser(webSocket: NamedWebSocket, data: DataPackageSendTo) {
  let reciever = getClient(data.recieverName);
  if (reciever === undefined) {
    return false;
  }
  reciever = reciever as Client;
  sendMessageTo(reciever, webSocket, data.message);
  console.log(`${webSocket.clientName}(${data.recieverName}): ${data.message}`);
} */

function sendToGroup(webSocket: NamedWebSocket, data: DataPackageSendTo) {
  let reciever = getGroup(data.recieverName);
  if (reciever === undefined) {
    return false;
  }
  reciever = reciever as Group;
  sendMessageTo(reciever, webSocket, data.message);
  console.log(`${webSocket.clientName}(${data.recieverName}): ${data.message}`);
}

function createGroup(webSocket: NamedWebSocket, data: DataPackageCreateGroup) {
  let members: Client[] = clients.filter((client) => {
    return data.memberNames.includes(client.clientName);
  });
  members.push(getClient(webSocket.clientName) as Client);
  let newGroup: Group | false = addGroup(data.groupName, members);
  if (newGroup) {
    const message = "Group has been created(" + newGroup.groupName + ")";
    sendMessageTo(newGroup, ServerSender, message);
    console.log(message);
  } else {
    console.log("Error creating group");
  }
}

function joinGroup(webSocket: NamedWebSocket, data: DataPackageJoinGroup) {
  let groupToJoin = getGroup(data.groupName);
  if (groupToJoin === undefined)
    groupToJoin = addGroup(data.groupName, []) as Group;
  addClientsToGroup(groupToJoin, [webSocket.clientId]);
  const joinMessage = `${webSocket.clientName} joined the group!`;
  sendMessageTo(groupToJoin, webSocket, joinMessage);
  console.log(joinMessage);
}

type ValidActionsIndex =
  | "register"
  /* | "send-to-user" */
  | "send-to-group"
  | "create-group"
  | "join-group";

const ValidActions = {
  register: register,
  //"send-to-user": sendToUser,
  "send-to-group": sendToGroup,
  "create-group": createGroup,
  "join-group": joinGroup,
};

let clients: Client[] = [];
let groups: Group[] = [];
let messages: MessageData[] = [];

let broadcastGroup: Group;

const ServerSender: Sender = { clientName: "Server" };

function getGroup(groupName: string): Group | undefined {
  return groups.find((group) => group.groupName == groupName);
}

function getClient(clientName: string): Client | undefined {
  return clients.find((client) => client.clientName == clientName);
}

function newClient(
  clientName: string,
  webSocket: NamedWebSocket,
  allowOverride: boolean = true
): false | Client {
  if (!allowOverride && getClient(clientName) != undefined) return false;
  let newClient = {
    clientId: clients.length,
    clientName: clientName,
    webSocket: webSocket,
  } as Client;
  clients[clients.length] = newClient;
  addClientsToGroup(broadcastGroup, [newClient.clientId]);
  return newClient;
}

function addGroup(
  groupName: string,
  members: Client[],
  allowOverride: boolean = true
): false | Group {
  if (!allowOverride && getGroup(groupName) != undefined) return false;
  const newGroup: Group = {
    groupId: groups.length,
    groupName: groupName,
    members: members.map((member) => member.clientId),
  } as Group;
  groups[newGroup.groupId] = newGroup;
  return newGroup;
}

function addClientsToGroup(group: Group, clients: ClientID[]) {
  clients.map((client) => group.members.push(client));
}

function sendMessageTo(
  reciever: Group,
  senderClient: Sender,
  message: string
) {
  const data: MessageData = {
    messageId: messages.length,
    message: message,
    from: senderClient.clientName,
    to: reciever.groupName,
    date: new Date().toLocaleString("es-ES"),
  };
  messages.push(data);
  //If reciever is type client
  /* if (reciever.hasOwnProperty("webSocket")) {
    (reciever as Client).webSocket.send(JSON.stringify(data));
  } else { */
    (reciever as Group).members.map((member) => {
      console.log(clients[member].clientName);
      clients[member].webSocket.send(JSON.stringify(data));
    });
  return true;
}

function handleMessage(
  this: WebSocket | NamedWebSocket,
  message: MessageEvent
) {
  let data = JSON.parse(message.data);
  if (data.action === undefined) {
    const errorText = "No action defined";
    console.log(errorText);
    this.send(JSON.stringify({ error: errorText }));
    console.log(data);
    return false;
  }
  let functionToRun = ValidActions[data.action as ValidActionsIndex];
  if (functionToRun === undefined) {
    console.log("Action is not valid");
    console.log(data);
    return false;
  }
  functionToRun(this as NamedWebSocket, data);
}

function startServer() {
  wsServer.on("connection", (webSocket: WebSocket) => {
    webSocket.onmessage = handleMessage;
  });
  console.log("Server started");
}

let storedQuantities:{
  clients: number,
  groups: number,
  messages: number,
};

async function getDataFromDB() {
  clients = await getClientsFromDB();
  groups = await getGroupsFromDB();
  messages = await getMesagesFromDB();
  storedQuantities = {
    clients: clients.length,
    groups: groups.length,
    messages: messages.length,
  }
  let broadcastIfExists: Group| undefined = getGroup('broadcast')
  broadcastGroup =broadcastIfExists!== undefined ? broadcastIfExists : addGroup("broadcast", []) as Group;
}

process.on("SIGINT", async () => {
  console.log("Saving data");
  await saveData(messages.slice(storedQuantities.messages), clients.slice(storedQuantities.clients), groups.slice(storedQuantities.groups));
  console.log("Data saved");
  process.exit();
});

dbInit().then(getDataFromDB).then(startServer);
