import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import ws from 'ws';
import Client from 'shared/client';
import Message, {
  ConfirmationMessage,
  ErrorMessage,
  ErrorType,
  MessageType,
} from 'shared/message';
import Player from 'shared/player';
import Game, { validateGameConfiguration } from './game';

const MAX_PLAYERS = 9;

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
    client.send(new ErrorMessage(ErrorType.PLAYER_MUST_REGISTER));
  } else {
    let derelictClient;
    const id = data.id || newId();
    const player = new Player({
      id,
      publicId: newId(),
      ip,
      name: data.name,
    }, client);

    if (data.id && players[data.id]) {
      if (players[data.id].ip !== ip) {
        client.send(new ErrorMessage(ErrorType.INVALID_DATA));
        return;
      }

      derelictClient = players[data.id].client;
      players[data.id].client = client;
      players[data.id].name = data.name;

      const activeGameKey = Object.keys(games).find(
        (key) => games[key].players.includes(players[data.id]),
      );
      if (activeGameKey) {
        games[activeGameKey].updatePlayers(players[data.id]);
        client.send(new Message({
          type: MessageType.TYPE_CONFIRM,
          subtype: MessageType.TYPE_GAME_UPDATE,
          data: { state: games[activeGameKey].getState() },
        }));
      }
    } else {
      players[player.id] = player;
      client.send(new ConfirmationMessage({ id, publicId: player.publicId }));
    }

    if (derelictClient) {
      derelictClient.close();
    }
  }
}

function createGame(client: Client, data: any) {
  const playerId = getPlayerId(client);
  if (!validateGameConfiguration(data)) {
    client.send(new ErrorMessage(ErrorType.INVALID_DATA));
  } else if (!playerId) {
    client.send(new ErrorMessage(ErrorType.PLAYER_MUST_REGISTER));
  } else if (Object.keys(games).some((key) => games[key].players.some((p) => p.id === playerId))) {
    client.send(new ErrorMessage(ErrorType.ALREADY_IN_GAME));
  } else {
    const id = newId();
    games[id] = new Game(id, players[playerId], data);
    players[playerId].setChips(games[id].startingChips);
    client.send(new ConfirmationMessage({ state: games[id].getState() }));
  }
}

function joinGame(client: Client, data: any) {
  const playerId = getPlayerId(client);
  if (typeof data !== 'object') {
    client.send(new ErrorMessage(ErrorType.INVALID_DATA));
  } else if (!playerId) {
    client.send(new ErrorMessage(ErrorType.PLAYER_MUST_REGISTER));
  } else if (typeof data.gameId !== 'string' || !games[data.gameId]) {
    client.send(new ErrorMessage(ErrorType.GAME_NOT_FOUND));
  } else if (games[data.gameId].players.length >= MAX_PLAYERS) {
    client.send(new ErrorMessage(ErrorType.GAME_IS_FULL));
  } else {
    games[data.gameId].addPlayer(players[playerId]);
    client.send(new Message({
      type: MessageType.TYPE_CONFIRM,
      subtype: MessageType.TYPE_GAME_UPDATE,
      data: { state: games[data.gameId].getState() },
    }));
  }
}

function removePlayer(client: Client) {
  const playerKey = getPlayerId(client);
  if (playerKey) {
    const ownedGameKey = Object.keys(games).find((key) => (
      games[key].owner.client === client
    ));
    if (ownedGameKey) {
      while (games[ownedGameKey].players.length > 1) {
        const player = games[ownedGameKey].players.pop() as Player;
        player.client.send(new Message({ type: MessageType.TYPE_GAME_CLOSED }));
        player.client.close();
        delete players[player.id];
      }

      delete games[ownedGameKey];
    } else {
      Object.keys(games).forEach((key) => {
        games[key].removePlayer(players[playerKey]);
      });
    }

    delete players[playerKey];
  }
}

function start() {
  const server = new ws.Server({ port });
  server.on('connection', (socket, req: IncomingMessage) => {
    const client = new Client(socket);
    client.on(
      MessageType.TYPE_REGISTER_PLAYER,
      (data) => registerPlayer(client, data, req.socket.remoteAddress || ''),
    );
    client.on(MessageType.TYPE_CREATE_GAME, (data) => createGame(client, data));
    client.on(MessageType.TYPE_JOIN_GAME, (data) => joinGame(client, data));
    client.on(Client.EVENT_TERMINATED, removePlayer);
  });
}

export default {
  start,
};
