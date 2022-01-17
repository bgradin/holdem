import EventEmitter from './event-emitter';
import { GameDetails, GamePublicState } from './components/game';
import Message, { ErrorMessage } from './message';
import { parseCloseEvent, parseError } from './parsing';
import Errors from './errors';

const PORT = 3030;
const MAX_TIMEOUT = 10000;

export interface PlayerDetails {
  name: string;
}

export interface ClientDetails {
  alive: boolean;
  id: string;
  player: PlayerDetails;
}

export enum ConnectionStatus {
  Disconnected,
  Connecting,
  Connected,
}

export default class Client extends EventEmitter {
  static LOCALSTORAGE_KEY_ID = '__holdem_client_id';

  static EVENT_TERMINATED = 'terminated';

  id?: string;
  player?: PlayerDetails;
  status = ConnectionStatus.Disconnected;

  #socket?: WebSocket;
  #internalEmitter = new EventEmitter();

  connect(player: PlayerDetails, game: GameDetails | string) {
    const id = localStorage.getItem(Client.LOCALSTORAGE_KEY_ID);
    this.#socket = new WebSocket(`ws://${window.location.hostname}:${PORT}`);
    this.#socket.onopen = () => this.#onOpen(player, game, id || undefined);
    this.#socket.onmessage = this.#onMessage.bind(this);
    this.#socket.onclose = this.#onClose.bind(this);
    this.#socket.onerror = this.#onError.bind(this);
    this.status = ConnectionStatus.Connecting;
  }

  send(message: Message) {
    if (this.#socket) {
      this.#socket.send(JSON.stringify({
        type: message.type,
        subtype: message.subtype,
        data: message.data,
      }));
    }
  }

  async sendAsync(message: Message): Promise<Message> {
    let resolved = false;
    return new Promise((resolve, reject) => {
      if (!this.#socket) {
        console.error('Client: Message send failed: No socket available!');
        reject();
        return;
      }

      setTimeout(() => { if (!resolved) reject(); }, MAX_TIMEOUT);
      let errorCallback: (errorMessage: Message) => void;
      const successCallback = (successMessage: Message) => {
        resolved = true;
        resolve(successMessage);
        this.#internalEmitter.off(Message.TYPE_ERROR, errorCallback);
      };
      errorCallback = (errorMessage: Message) => {
        resolved = true;
        reject(errorMessage);
        this.#internalEmitter.off(Message.TYPE_CONFIRM, successCallback);
      };

      this.#internalEmitter.one(Message.TYPE_CONFIRM, successCallback);
      this.#internalEmitter.one(Message.TYPE_ERROR, errorCallback);

      this.send(message);
    });
  }

  #close() {
    delete this.id;
    delete this.player;
    this.status = ConnectionStatus.Disconnected;
    this.emit(Client.EVENT_TERMINATED, this);
  }

  async #closeOnRuntimeError<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return fn();
    } catch (obj) {
      this.#close();
      throw obj;
    }
  }

  async #identify(player: PlayerDetails, id?: string): Promise<void> {
    await this.#closeOnRuntimeError(async () => {
      const response = await this.sendAsync(new Message({
        type: Message.TYPE_IDENTIFY_PLAYER,
        data: { ...player, id },
      }));
      if (response.type !== Message.TYPE_CONFIRM || typeof response.data.id !== 'string') {
        throw new ErrorMessage(Errors.UNEXPECTED_CONFIRMATION_DATA);
      } else {
        this.id = response.data.id as string;
        localStorage.setItem(Client.LOCALSTORAGE_KEY_ID, this.id);
      }
    });
  }

  async #createGame(game: GameDetails): Promise<GamePublicState> {
    return this.#closeOnRuntimeError(async () => {
      const response = await this.sendAsync(new Message({
        type: Message.TYPE_CREATE_GAME,
        data: { ...game },
      }));
      if (response.type !== Message.TYPE_CONFIRM || !response.data.state) {
        throw new ErrorMessage(Errors.UNEXPECTED_CONFIRMATION_DATA);
      } else {
        return response.data.state;
      }
    });
  }

  async #joinGame(gameId: string): Promise<GamePublicState> {
    return this.#closeOnRuntimeError(async () => {
      const response = await this.sendAsync(new Message({
        type: Message.TYPE_JOIN_GAME,
        data: { gameId },
      }));
      if (response.type !== Message.TYPE_CONFIRM || !response.data.state) {
        throw new ErrorMessage(Errors.UNEXPECTED_CONFIRMATION_DATA);
      } else {
        return response.data.state;
      }
    });
  }

  async #onError() {
    this.#close();
  }

  async #onOpen(player: PlayerDetails, game: GameDetails | string, id?: string) {
    try {
      await this.#identify(player, id);
      const state = typeof game === 'string'
        ? await this.#joinGame(game)
        : await this.#createGame(game);
      this.emit(Message.TYPE_GAME_STATE, new Message({
        type: Message.TYPE_GAME_STATE,
        data: { state },
      }));
    } catch (obj) {
      const error = obj as ErrorMessage;
      console.error(`Error (${error.subtype}): ${parseError(error.subtype)}`);
    }
  }

  #onClose(event: CloseEvent) {
    if (event.code !== 1000) {
      console.error(parseCloseEvent(event));
    }
    this.#close();
  }

  #onMessage(event: MessageEvent<any>) {
    const message = JSON.parse(event.data) as Message;
    if (message.type === Message.TYPE_CONFIRM || message.type === Message.TYPE_ERROR) {
      this.#internalEmitter.emit(message.type, message);
    } else {
      this.emit(message.type, message);
    }
  }
}
