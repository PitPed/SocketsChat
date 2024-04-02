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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConnectedUser = exports.getGroupNames = exports.getGroup = exports.storeMessage = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const WebSocketData_1 = require("../../Connections/WebSocketData");
function storeMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const groupName = message.to == WebSocketData_1.connectedUser ? message.from : message.to;
        const group = { name: groupName, messages: [message] };
        yield storeGroup(group);
    });
}
exports.storeMessage = storeMessage;
function storeGroup(group) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let stringifiedGroup = JSON.stringify(group);
            let stored = yield async_storage_1.default.mergeItem(group.name, stringifiedGroup);
            return true;
        }
        catch (e) {
            return false;
        }
    });
}
function getGroup(groupName) {
    return __awaiter(this, void 0, void 0, function* () {
        let encodedGroup = yield async_storage_1.default.getItem(groupName);
        if (encodedGroup == undefined)
            return false;
        return JSON.parse(encodedGroup);
    });
}
exports.getGroup = getGroup;
function getGroupNames() {
    return __awaiter(this, void 0, void 0, function* () {
        let keys = (yield async_storage_1.default.getAllKeys()).slice(1);
        return keys;
    });
}
exports.getGroupNames = getGroupNames;
function setConnectedUser(username) {
    return __awaiter(this, void 0, void 0, function* () {
        let lastUser = yield async_storage_1.default.getItem("lastUser");
        if (username != lastUser) {
            yield async_storage_1.default.clear();
            return yield async_storage_1.default.setItem("lastUser", username);
        }
        else {
            return true;
        }
    });
}
exports.setConnectedUser = setConnectedUser;
