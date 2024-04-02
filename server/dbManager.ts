import { group } from "console";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import fs from "fs";
import { Client, ClientID, Group, GroupID, MessageData } from "./types";
import { get } from "http";

const dbFile = "db/main.db";
const dbInitFile = "db/dbCreator.sql";
let db: Database;

console.log("starting...");

export async function dbInit() {
  db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  async function instantiateDB() {
    const script = await fs.readFileSync(dbInitFile, "utf8");
    db.exec(script);
  }
  await instantiateDB();
  console.log("DB has been initiated");
}

async function getGroupsFromClientID(clientId: ClientID): Promise<number[]>{
  const getMembersFromGroupQuery = `SELECT clientId FROM groupMembers WHERE clientId = ${clientId}`;
  return await db.all(getMembersFromGroupQuery)
}

export async function getClientsFromDB(): Promise<Client[]> {
  const getAllClientsQuery = "SELECT * FROM clients";
  let clients: Client[] = await db.all(getAllClientsQuery)
  clients.forEach(async client=>
    client.groups = await getGroupsFromClientID(client.clientId)  
  )
  return clients;
}

async function getMembersFromGroupID(groupId: GroupID): Promise<number[]>{
  const getMembersFromGroupQuery = `SELECT clientId FROM groupMembers WHERE groupId = ${groupId}`;
  return await db.all(getMembersFromGroupQuery)
}


export async function getGroupsFromDB(): Promise<Group[]> {
  const getAllGroupsQuery = "SELECT * FROM groups";
  let groups: Group[]= await db.all(getAllGroupsQuery);
  groups.forEach(async group => {
    group.members = await getMembersFromGroupID(group.groupId)
  });
  return groups as Group[];
}

export async function getMesagesFromDB(): Promise<MessageData[]> {
  const getAllMessagesQuery = "SELECT * FROM messages";
  return (await db.all(getAllMessagesQuery)) as MessageData[];
}

async function saveClients(clients: Client[]) {
  if (clients.length < 1) return 0;
  let fromattedClients: string[] = [];
  clients.map((client) => {
    fromattedClients.push(`(${client.clientId},'${client.clientName}')`);
  });
  let insertClientsQuery: string =
    "INSERT INTO clients(clientId, clientName) VALUES " +
    fromattedClients.join(",") +
    ";";
  console.log("saving clients: ", insertClientsQuery);
  await db.run(insertClientsQuery);
}

async function saveGroups(groups: Group[]) {
  if (groups.length < 1) return 0;
  let fromattedGroups: string[] = [];
  let fromattedMembers: string[] = [];
  groups.map((group) => {
    fromattedGroups.push(`(${group.groupId},'${group.groupName}')`);
    group.members.map((memberId) => {
      fromattedMembers.push(`(${group.groupId},${memberId})`);
    });
  });
  const insertGroupQuery: string =
    "INSERT INTO groups(groupId, groupName) VALUES " +
    fromattedGroups.join(",") +
    ";";
  const insertMemberQuery: string =
    "INSERT INTO groupMembers(groupId, clientId) VALUES " +
    fromattedMembers.join(",") +
    ";";
  console.log("saving groups: ", insertGroupQuery);
  await db.run(insertGroupQuery);
  if(fromattedMembers.length>0){
    console.log('saving members: ',insertMemberQuery)
    await db.run(insertMemberQuery);
  }
}

async function updateGroups(groups: Group[]) {
  if (groups.length < 1) return false;
  let fromattedMembers: string[] = [];
  groups.map((group) => {
    group.members.map((memberId) => {
      fromattedMembers.push(`(${group.groupId},${memberId})`);
    });
  });
  const insertMemberQuery: string =
    "INSERT INTO groupMembers(groupId, clientId) VALUES " +
    fromattedMembers.join(",") +
    ";";
  if(fromattedMembers.length>0){
    console.log('saving members: ',insertMemberQuery)
    await db.run(insertMemberQuery);
  }
}

async function saveMessages(messages: MessageData[]) {
  if (messages.length < 1) return 0;
  let fromattedClients: string[] = [];
  messages.map((message) => {
    fromattedClients.push(
      `(${message.messageId},'${message.from}','${message.to}','${message.message}','${message.date}')`
    );
  });
  let insertMessagesQuery: string =
    "INSERT INTO messages(messageId, messageFrom, messageTo, messageBody, messageDate) VALUES " +
    fromattedClients.join(",") +
    ";";
  console.log("saving messages", insertMessagesQuery);
  await db.run(insertMessagesQuery);
}

export async function saveData(
  messages: MessageData[],
  clients: Client[],
  groups: Group[]
) {
  await saveClients(clients);
  await saveGroups(groups);
  await saveMessages(messages);
}
