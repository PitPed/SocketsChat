CREATE TABLE IF NOT EXISTS clients(
    clientId INTEGER UNSIGNED PRIMARY KEY ,
    clientName TEXT
);

CREATE TABLE IF NOT EXISTS groups(
    groupId INTEGER UNSIGNED PRIMARY KEY ,
    groupName TEXT 
);

CREATE TABLE IF NOT EXISTS messages(
    messageId INTEGER UNSIGNED PRIMARY KEY,
    messageFrom TEXT,
    messageTo TEXT,
    messageBody TEXT,
    messageDate TEXT,
    FOREIGN KEY (messageFrom) REFERENCES clients(clientName),
    FOREIGN KEY (messageTo) REFERENCES groups(groupName)
);

CREATE TABLE IF NOT EXISTS groupMembers(
    groupId INTEGER,
    clientId INTEGER,
    PRIMARY KEY(groupId, clientId),
    FOREIGN KEY(groupId) REFERENCES groups(groupId),
    FOREIGN KEY(clientId) REFERENCES clientId(clientId)
);