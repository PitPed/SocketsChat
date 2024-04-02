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
exports.saveData = exports.getMesagesFromDB = exports.getGroupsFromDB = exports.getClientsFromDB = exports.dbInit = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const fs_1 = __importDefault(require("fs"));
const dbFile = "db/main.db";
const dbInitFile = "db/dbCreator.sql";
let db;
console.log("starting...");
function dbInit() {
    return __awaiter(this, void 0, void 0, function* () {
        db = yield (0, sqlite_1.open)({
            filename: dbFile,
            driver: sqlite3_1.default.Database,
        });
        function instantiateDB() {
            return __awaiter(this, void 0, void 0, function* () {
                const script = yield fs_1.default.readFileSync(dbInitFile, "utf8");
                db.exec(script);
            });
        }
        yield instantiateDB();
        console.log("DB has been initiated");
    });
}
exports.dbInit = dbInit;
function getGroupsFromClientID(clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getMembersFromGroupQuery = `SELECT clientId FROM groupMembers WHERE clientId = ${clientId}`;
        return yield db.all(getMembersFromGroupQuery);
    });
}
function getClientsFromDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const getAllClientsQuery = "SELECT * FROM clients";
        let clients = yield db.all(getAllClientsQuery);
        clients.forEach((client) => __awaiter(this, void 0, void 0, function* () { return client.groups = yield getGroupsFromClientID(client.clientId); }));
        return clients;
    });
}
exports.getClientsFromDB = getClientsFromDB;
function getMembersFromGroupID(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        const getMembersFromGroupQuery = `SELECT clientId FROM groupMembers WHERE groupId = ${groupId}`;
        return yield db.all(getMembersFromGroupQuery);
    });
}
function getGroupsFromDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const getAllGroupsQuery = "SELECT * FROM groups";
        let groups = yield db.all(getAllGroupsQuery);
        groups.forEach((group) => __awaiter(this, void 0, void 0, function* () {
            group.members = yield getMembersFromGroupID(group.groupId);
        }));
        return groups;
    });
}
exports.getGroupsFromDB = getGroupsFromDB;
function getMesagesFromDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const getAllMessagesQuery = "SELECT * FROM messages";
        return (yield db.all(getAllMessagesQuery));
    });
}
exports.getMesagesFromDB = getMesagesFromDB;
function saveClients(clients) {
    return __awaiter(this, void 0, void 0, function* () {
        if (clients.length < 1)
            return 0;
        let fromattedClients = [];
        clients.map((client) => {
            fromattedClients.push(`(${client.clientId},'${client.clientName}')`);
        });
        let insertClientsQuery = "INSERT INTO clients(clientId, clientName) VALUES " +
            fromattedClients.join(",") +
            ";";
        console.log("saving clients: ", insertClientsQuery);
        yield db.run(insertClientsQuery);
    });
}
function saveGroups(groups) {
    return __awaiter(this, void 0, void 0, function* () {
        if (groups.length < 1)
            return 0;
        let fromattedGroups = [];
        let fromattedMembers = [];
        groups.map((group) => {
            fromattedGroups.push(`(${group.groupId},'${group.groupName}')`);
            group.members.map((memberId) => {
                fromattedMembers.push(`(${group.groupId},${memberId})`);
            });
        });
        const insertGroupQuery = "INSERT INTO groups(groupId, groupName) VALUES " +
            fromattedGroups.join(",") +
            ";";
        const insertMemberQuery = "INSERT INTO groupMembers(groupId, clientId) VALUES " +
            fromattedMembers.join(",") +
            ";";
        console.log("saving groups: ", insertGroupQuery);
        yield db.run(insertGroupQuery);
        if (fromattedMembers.length > 0) {
            console.log('saving members: ', insertMemberQuery);
            yield db.run(insertMemberQuery);
        }
    });
}
function updateGroups(groups) {
    return __awaiter(this, void 0, void 0, function* () {
        if (groups.length < 1)
            return false;
        let fromattedMembers = [];
        groups.map((group) => {
            group.members.map((memberId) => {
                fromattedMembers.push(`(${group.groupId},${memberId})`);
            });
        });
        const insertMemberQuery = "INSERT INTO groupMembers(groupId, clientId) VALUES " +
            fromattedMembers.join(",") +
            ";";
        if (fromattedMembers.length > 0) {
            console.log('saving members: ', insertMemberQuery);
            yield db.run(insertMemberQuery);
        }
    });
}
function saveMessages(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        if (messages.length < 1)
            return 0;
        let fromattedClients = [];
        messages.map((message) => {
            fromattedClients.push(`(${message.messageId},'${message.from}','${message.to}','${message.message}','${message.date}')`);
        });
        let insertMessagesQuery = "INSERT INTO messages(messageId, messageFrom, messageTo, messageBody, messageDate) VALUES " +
            fromattedClients.join(",") +
            ";";
        console.log("saving messages", insertMessagesQuery);
        yield db.run(insertMessagesQuery);
    });
}
function saveData(messages, clients, groups) {
    return __awaiter(this, void 0, void 0, function* () {
        yield saveClients(clients);
        yield saveGroups(groups);
        yield saveMessages(messages);
    });
}
exports.saveData = saveData;
