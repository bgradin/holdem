import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ws from 'ws';
import Client from './client';
import Errors from './errors';
import Game from './game';
import Message, {
  ConfirmationMessage,
  ErrorMessage,
  SimpleConfirmationMessage,
} from './message';

const SECRET = fs.readFileSync(path.resolve(__dirname, 'SECRET'), { encoding: 'utf8' });

const port = 3030;

const clients: Client[] = [];
const games: Record<string, Game> = {};

function createGame(client: Client, data: any) {
  if (typeof data !== 'object' || data.secret !== SECRET) {
    client.send(new ErrorMessage(Errors.INVALID_DATA));
  } else if (!client.id) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_IDENTIFY));
  } else if (Object.keys(games).some((key) => games[key].clients.some((x) => x === client))) {
    client.send(new ErrorMessage(Errors.ALREADY_IN_GAME));
  } else {
    const id = uuidv4().replace(/-/g, '');
    games[id] = new Game(id, client);
    client.send(new ConfirmationMessage({ id }));
  }
}

function joinGame(client: Client, data: any) {
  if (typeof data !== 'object') {
    client.send(new ErrorMessage(Errors.INVALID_DATA));
  } else if (!client.id) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_IDENTIFY));
  } else if (typeof data.gameId !== 'string' || games[data.gameId]) {
    client.send(new ErrorMessage(Errors.GAME_NOT_FOUND));
  } else {
    games[data.gameId].addPlayer(client);
    client.send(new SimpleConfirmationMessage());
  }
}

function removeClient(client: Client) {
  const index = clients.indexOf(client);
  if (index >= 0) {
    clients.splice(index, 1);
  }
}

function start() {
  const server = new ws.Server({ port });
  server.on('connection', (socket) => {
    const client = new Client(socket);
    clients.push(client);

    client.on(Message.TYPE_CREATE_GAME, (data) => createGame(client, data));
    client.on(Message.TYPE_JOIN_GAME, (data) => joinGame(client, data));
    client.on(Client.EVENT_TERMINATED, removeClient);
  });
}

export default {
  start,
};
