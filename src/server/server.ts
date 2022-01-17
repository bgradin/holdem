import fs from 'fs';
import { IncomingMessage } from 'http';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import ws from 'ws';
import Client from './client';
import Errors from './errors';
import Game from './game';
import Message, {
  ConfirmationMessage,
  ErrorMessage,
} from './message';
import Player from './player';

const SECRET = fs.readFileSync(path.resolve(__dirname, 'SECRET'), { encoding: 'utf8' });

const port = 3030;

const games: Record<string, Game> = {};
const players: Record<string, Player> = {};

function validateClientIdentity(data: any): boolean {
  return typeof data === 'object'
    && (!data.id || typeof data.id === 'string')
    && typeof data.name === 'string';
}

function newId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 10);
}

function getPlayerId(client: Client) {
  return Object.keys(players).find((key) => players[key].client === client);
}

function registerPlayer(client: Client, data: any, ip: string) {
  if (!validateClientIdentity) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_REGISTER));
  } else {
    const id = data.id || newId();
    const player = new Player({
      id,
      ip,
      name: data.name,
    }, client);

    if (data.id) {
      if (players[data.id]) {
        if (players[data.id].ip !== ip) {
          client.send(new ErrorMessage(Errors.INVALID_DATA));
          return;
        }

        players[data.id].client.close();
        delete players[data.id];
      }
    }

    players[data.id] = player;
    client.send(new ConfirmationMessage({ id }));
  }
}

function createGame(client: Client, data: any) {
  const playerId = getPlayerId(client);
  if (typeof data !== 'object' || data.secret !== SECRET || !data.name) {
    client.send(new ErrorMessage(Errors.INVALID_DATA));
  } else if (!playerId) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_REGISTER));
  } else if (Object.keys(games).some((key) => games[key].players.some((p) => p.id === playerId))) {
    client.send(new ErrorMessage(Errors.ALREADY_IN_GAME));
  } else {
    const id = newId();
    games[id] = new Game(id, data.name, players[playerId]);
    client.send(new ConfirmationMessage({ state: games[id].getState() }));
  }
}

function joinGame(client: Client, data: any) {
  const playerId = getPlayerId(client);
  if (typeof data !== 'object') {
    client.send(new ErrorMessage(Errors.INVALID_DATA));
  } else if (!playerId) {
    client.send(new ErrorMessage(Errors.PLAYER_MUST_REGISTER));
  } else if (typeof data.gameId !== 'string' || !games[data.gameId]) {
    client.send(new ErrorMessage(Errors.GAME_NOT_FOUND));
  } else {
    games[data.gameId].addPlayer(players[playerId]);
  }
}

function removePlayer(client: Client) {
  const playerKey = getPlayerId(client);
  if (playerKey) {
    Object.keys(games).forEach((key) => {
      games[key].removePlayer(players[playerKey]);
    });

    delete players[playerKey];
  }
}

function start() {
  const server = new ws.Server({ port });
  server.on('connection', (socket, req: IncomingMessage) => {
    const client = new Client(socket);
    client.on(
      Message.TYPE_REGISTER_PLAYER,
      (data) => registerPlayer(client, data, req.socket.remoteAddress || ''),
    );
    client.on(Message.TYPE_CREATE_GAME, (data) => createGame(client, data));
    client.on(Message.TYPE_JOIN_GAME, (data) => joinGame(client, data));
    client.on(Client.EVENT_TERMINATED, removePlayer);
  });
}

export default {
  start,
};
