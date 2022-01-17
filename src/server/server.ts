import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ws from 'ws';
import Client, { PlayerDetails } from './client';
import Errors from './errors';
import Game from './game';
import Message, {
  ConfirmationMessage,
  ErrorMessage,
} from './message';

const SECRET = fs.readFileSync(path.resolve(__dirname, 'SECRET'), { encoding: 'utf8' });

const port = 3030;

const clients: Record<string, Client> = {};
const games: Record<string, Game> = {};

function validateClientIdentity(data: any): boolean {
  return typeof data === 'object'
    && (!data.id || typeof data.id === 'string')
    && typeof data.name === 'string';
}

function registerClient(client: Client, data: any) {
  if (!validateClientIdentity) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_IDENTIFY));
  } else {
    if (data.id) {
      delete clients[client.id];

      if (clients[data.id]) {
        clients[data.id].close();
        delete clients[data.id];
      }

      clients[data.id] = client;
    }

    client.identify(data as PlayerDetails);
    client.send(new ConfirmationMessage({ id: client.id }));
  }
}

function createGame(client: Client, data: any) {
  if (typeof data !== 'object' || data.secret !== SECRET) {
    client.send(new ErrorMessage(Errors.INVALID_DATA));
  } else if (!client.player) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_IDENTIFY));
  } else if (Object.keys(games).some((key) => games[key].clients.some((x) => x === client))) {
    client.send(new ErrorMessage(Errors.ALREADY_IN_GAME));
  } else {
    const id = uuidv4().replace(/-/g, '');
    games[id] = new Game(id, client);
    client.send(new ConfirmationMessage({ state: games[id].getState() }));
  }
}

function joinGame(client: Client, data: any) {
  if (typeof data !== 'object') {
    client.send(new ErrorMessage(Errors.INVALID_DATA));
  } else if (!client.player) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_IDENTIFY));
  } else if (typeof data.gameId !== 'string' || !games[data.gameId]) {
    client.send(new ErrorMessage(Errors.GAME_NOT_FOUND));
  } else {
    games[data.gameId].addPlayer(client);
  }
}

function removeClient(client: Client) {
  Object.keys(games).forEach((key) => {
    games[key].removePlayer(client);
  });

  Object.keys(clients).forEach((key) => {
    if (clients[key] === client) {
      delete clients[key];
    }
  });
}

function start() {
  const server = new ws.Server({ port });
  server.on('connection', (socket) => {
    const client = new Client(socket, uuidv4().replace(/-/g, ''));
    clients[client.id] = client;

    client.on(Message.TYPE_IDENTIFY_PLAYER, (data) => registerClient(client, data));
    client.on(Message.TYPE_CREATE_GAME, (data) => createGame(client, data));
    client.on(Message.TYPE_JOIN_GAME, (data) => joinGame(client, data));
    client.on(Client.EVENT_TERMINATED, removeClient);
  });
}

export default {
  start,
};
