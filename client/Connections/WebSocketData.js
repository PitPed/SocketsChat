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
exports.wsJoinGroup = exports.wsCreateGroup = exports.wsSendMessageTo = exports.wsConnectAs = exports.connectedUser = exports.ws = void 0;
const AsyncStorageData_1 = require("../components/AsyncStorageData/AsyncStorageData");
const IP = "10.0.0.148";
const PORT = 3000;
exports.ws = new WebSocket(`ws://${IP}:${PORT}`);
exports.connectedUser = "";
console.log("Sending connection to " + exports.ws.url);
function wsConnectAs(username) {
    exports.ws.send(JSON.stringify({ action: "register", username: username }));
    exports.connectedUser = username;
    (0, AsyncStorageData_1.setConnectedUser)(username);
}
exports.wsConnectAs = wsConnectAs;
function wsSendMessageTo(type, reciever, message) {
    if (type == "group")
        wsSendMessageToGroup(reciever, message);
    if (type == "user")
        wsSendMessageToUser(reciever, message);
}
exports.wsSendMessageTo = wsSendMessageTo;
function wsSendMessageToUser(reciever, message) {
    exports.ws.send(JSON.stringify({
        action: "send-to-user",
        recieverName: reciever,
        message: message,
    }));
}
function wsSendMessageToGroup(reciever, message) {
    exports.ws.send(JSON.stringify({
        action: "send-to-group",
        recieverName: reciever,
        message: message,
    }));
}
function wsCreateGroup(groupName, memberNames) {
    exports.ws.send(JSON.stringify({
        action: "create-group",
        groupName: groupName,
        memberNames: memberNames,
    }));
}
exports.wsCreateGroup = wsCreateGroup;
function wsJoinGroup(groupName) {
    exports.ws.send(JSON.stringify({
        action: "join-group",
        groupName: groupName,
    }));
}
exports.wsJoinGroup = wsJoinGroup;
exports.ws.addEventListener("open", () => {
    console.log("Connection succeded");
});
exports.ws.addEventListener("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
    const message = JSON.parse(data.data);
    console.log(message);
    yield (0, AsyncStorageData_1.storeMessage)(message);
}));
