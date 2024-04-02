export type NamedWebSocket = WebSocket & {
  clientName: string;
  clientId: ClientID;
};

export type Sender = { clientName: string };

export type ClientID = number;

export type Client = Sender & {
  clientId: ClientID;
  webSocket: NamedWebSocket;
  groups: GroupID[];
};

export type GroupID = number;

export type Group = {
  groupId: GroupID;
  groupName: string;
  members: ClientID[];
};

export type MessageID = number;

export type MessageData = {
  messageId: MessageID;
  message: string;
  from: string;
  to: string;
  date: string;
};

export type DataPackageRegister = {
  username: string;
};

export type DataPackageSendTo = {
  recieverName: string;
  message: string;
};

export type DataPackageCreateGroup = {
  groupName: string;
  memberNames: string[];
};

export type DataPackageJoinGroup = {
  groupName: string;
};
