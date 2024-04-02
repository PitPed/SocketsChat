"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbManager_1 = require("./dbManager");
const ws = require("ws");
const port = 3000;
const wsServer = new ws.WebSocket.Server({ port: port });
function register(webSocket, data) {
    let namedWebSocket = webSocket;
    namedWebSocket.clientName = data.username;
    namedWebSocket.clientId = newClient(data.username, namedWebSocket).clientId;
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
function sendToGroup(webSocket, data) {
    let reciever = getGroup(data.recieverName);
    if (reciever === undefined) {
        return false;
    }
    reciever = reciever;
    sendMessageTo(reciever, webSocket, data.message);
    console.log(`${webSocket.clientName}(${data.recieverName}): ${data.message}`);
}
function createGroup(webSocket, data) {
    let members = clients.filter((client) => {
        return data.memberNames.includes(client.clientName);
    });
    members.push(getClient(webSocket.clientName));
    let newGroup = addGroup(data.groupName, members);
    if (newGroup) {
        const message = "Group has been created(" + newGroup.groupName + ")";
        sendMessageTo(newGroup, ServerSender, message);
        console.log(message);
    }
    else {
        console.log("Error creating group");
    }
}
function joinGroup(webSocket, data) {
    let groupToJoin = getGroup(data.groupName);
    if (groupToJoin === undefined)
        groupToJoin = addGroup(data.groupName, []);
    addClientsToGroup(groupToJoin, [webSocket.clientId]);
    const joinMessage = `${webSocket.clientName} joined the group!`;
    sendMessageTo(groupToJoin, webSocket, joinMessage);
    console.log(joinMessage);
}
const ValidActions = {
    register: register,
    //"send-to-user": sendToUser,
    "send-to-group": sendToGroup,
    "create-group": createGroup,
    "join-group": joinGroup,
};
let clients = [];
let groups = [];
let messages = [];
let broadcastGroup;
const ServerSender = { clientName: "Server" };
function getGroup(groupName) {
    return groups.find((group) => group.groupName == groupName);
}
function getClient(clientName) {
    return clients.find((client) => client.clientName == clientName);
}
function newClient(clientName, webSocket, allowOverride = true) {
    if (!allowOverride && getClient(clientName) != undefined)
        return false;
    let newClient = {
        clientId: clients.length,
        clientName: clientName,
        webSocket: webSocket,
    };
    clients[clients.length] = newClient;
    addClientsToGroup(broadcastGroup, [newClient.clientId]);
    return newClient;
}
function addGroup(groupName, members, allowOverride = true) {
    if (!allowOverride && getGroup(groupName) != undefined)
        return false;
    const newGroup = {
        groupId: groups.length,
        groupName: groupName,
        members: members.map((member) => member.clientId),
    };
    groups[newGroup.groupId] = newGroup;
    return newGroup;
}
function addClientsToGroup(group, clients) {
    clients.map((client) => group.members.push(client));
}
function sendMessageTo(reciever, senderClient, message) {
    const data = {
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
    reciever.members.map((member) => {
        console.log(clients[member].clientName);
        clients[member].webSocket.send(JSON.stringify(data));
    });
    return true;
}
function handleMessage(message) {
    let data = JSON.parse(message.data);
    if (data.action === undefined) {
        const errorText = "No action defined";
        console.log(errorText);
        this.send(JSON.stringify({ error: errorText }));
        console.log(data);
        return false;
    }
    let functionToRun = ValidActions[data.action];
    if (functionToRun === undefined) {
        console.log("Action is not valid");
        console.log(data);
        return false;
    }
    functionToRun(this, data);
}
function startServer() {
    wsServer.on("connection", (webSocket) => {
        webSocket.onmessage = handleMessage;
    });
    console.log("Server started");
}
let storedQuantities;
function getDataFromDB() {
    return __awaiter(this, void 0, void 0, function* () {
        clients = yield (0, dbManager_1.getClientsFromDB)();
        groups = yield (0, dbManager_1.getGroupsFromDB)();
        messages = yield (0, dbManager_1.getMesagesFromDB)();
        storedQuantities = {
            clients: clients.length,
            groups: groups.length,
            messages: messages.length,
        };
        let broadcastIfExists = getGroup('broadcast');
        broadcastGroup = broadcastIfExists !== undefined ? broadcastIfExists : addGroup("broadcast", []);
    });
}
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Saving data");
    yield (0, dbManager_1.saveData)(messages.slice(storedQuantities.messages), clients.slice(storedQuantities.clients), groups.slice(storedQuantities.groups));
    console.log("Data saved");
    process.exit();
}));
(0, dbManager_1.dbInit)().then(getDataFromDB).then(startServer);
