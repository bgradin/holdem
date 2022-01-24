import { Cards } from 'shared/cards';
import { BetAction, GamePublicState } from 'shared/game-state';
import Message, { MessageType, ErrorType, ErrorMessage } from 'shared/message';
import EventEmitter from './event-emitter';
import { GameDetails } from './components/game';
import { parseCloseEvent } from './parsing';

const PORT = 3030;
const MAX_TIMEOUT = 10000;

export interface PlayerDetails {
  name: string;
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
  publicId?: string;
  player?: PlayerDetails;
  cards?: Cards;
  status = ConnectionStatus.Disconnected;

  #socket?: WebSocket;
  #internalEmitter = new EventEmitter();

  async connect(player: PlayerDetails, game: GameDetails | string): Promise<Message | void> {
    return new Promise((resolve, reject) => {
      const id = localStorage.getItem(Client.LOCALSTORAGE_KEY_ID);
      this.#socket = new WebSocket(`ws://${window.location.hostname}:${PORT}`);
      this.#socket.onmessage = this.#onMessage.bind(this);
      this.#socket.onclose = this.#onClose.bind(this);
      this.#socket.onerror = this.#onError.bind(this);
      this.status = ConnectionStatus.Connecting;

      this.#socket.onopen = async () => {
        try {
          const state = await this.#register(player, id || undefined)
            || (
              typeof game === 'string'
                ? await this.#joinGame(game)
                : await this.#createGame(game)
            );
          resolve();
          this.emit(MessageType.TYPE_GAME_UPDATE, new Message({
            type: MessageType.TYPE_GAME_UPDATE,
            data: { state },
          }));
        } catch (obj) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(obj as ErrorMessage);
        }
      };
    });
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

  check() {
    this.send(new Message({
      type: MessageType.TYPE_CONFIRM,
      subtype: MessageType.TYPE_BET,
      data: {
        action: BetAction.CHECK,
      },
    }));
  }

  fold() {
    this.send(new Message({
      type: MessageType.TYPE_CONFIRM,
      subtype: MessageType.TYPE_BET,
      data: {
        action: BetAction.FOLD,
      },
    }));
  }

  call() {
    this.send(new Message({
      type: MessageType.TYPE_CONFIRM,
      subtype: MessageType.TYPE_BET,
      data: {
        action: BetAction.CALL,
      },
    }));
  }

  raise(amount: number) {
    this.send(new Message({
      type: MessageType.TYPE_CONFIRM,
      subtype: MessageType.TYPE_BET,
      data: {
        action: BetAction.RAISE,
        amount,
      },
    }));
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
        this.#internalEmitter.off(MessageType.TYPE_ERROR, errorCallback);
      };
      errorCallback = (errorMessage: Message) => {
        resolved = true;
        reject(errorMessage);
        this.#internalEmitter.off(MessageType.TYPE_CONFIRM, successCallback);
      };

      this.#internalEmitter.one(MessageType.TYPE_CONFIRM, successCallback);
      this.#internalEmitter.one(MessageType.TYPE_ERROR, errorCallback);

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

  async #register(player: PlayerDetails, id?: string): Promise<GamePublicState | void> {
    return this.#closeOnRuntimeError(async () => {
      const response = await this.sendAsync(new Message({
        type: MessageType.TYPE_REGISTER_PLAYER,
        data: { ...player, id },
      }));
      if (response.type === MessageType.TYPE_CONFIRM
        && typeof response.data.id === 'string'
        && typeof response.data.publicId === 'string') {
        this.id = response.data.id as string;
        this.publicId = response.data.publicId as string;
        localStorage.setItem(Client.LOCALSTORAGE_KEY_ID, this.id);
        return;
      }

      if (id
        && response.type === MessageType.TYPE_CONFIRM
        && response.subtype === MessageType.TYPE_GAME_UPDATE
        && response.data.state) {
        this.id = id as string;
        localStorage.setItem(Client.LOCALSTORAGE_KEY_ID, this.id);
        // eslint-disable-next-line consistent-return
        return response.data.state as GamePublicState;
      }

      throw new ErrorMessage(ErrorType.UNEXPECTED_CONFIRMATION_DATA);
    });
  }

  async #createGame(game: GameDetails): Promise<GamePublicState> {
    return this.#closeOnRuntimeError(async () => {
      const response = await this.sendAsync(new Message({
        type: MessageType.TYPE_CREATE_GAME,
        data: { ...game },
      }));
      if (response.type !== MessageType.TYPE_CONFIRM || !response.data.state) {
        throw new ErrorMessage(ErrorType.UNEXPECTED_CONFIRMATION_DATA);
      } else {
        return response.data.state;
      }
    });
  }

  async #joinGame(gameId: string): Promise<GamePublicState> {
    return this.#closeOnRuntimeError(async () => {
      const response = await this.sendAsync(new Message({
        type: MessageType.TYPE_JOIN_GAME,
        data: { gameId },
      }));
      if (response.type !== MessageType.TYPE_CONFIRM || !response.data.state) {
        throw new ErrorMessage(ErrorType.UNEXPECTED_CONFIRMATION_DATA);
      } else {
        return response.data.state;
      }
    });
  }

  async #onError() {
    this.#close();
  }

  #onClose(event: CloseEvent) {
    if (event.code !== 1000) {
      console.error(parseCloseEvent(event));
    }
    this.#close();
  }

  #onMessage(event: MessageEvent<any>) {
    const message = JSON.parse(event.data) as Message;
    if (message.type === MessageType.TYPE_CONFIRM || message.type === MessageType.TYPE_ERROR) {
      this.#internalEmitter.emit(message.type, message);
    } else if (message.type === MessageType.TYPE_DEAL_PLAYER
      && Array.isArray(message.data.cards)
      && message.data.cards.every((card: any) => typeof card === 'string')) {
      this.cards = message.data.cards;
    } else {
      this.emit(message.type, message);
    }

    if (message.type === MessageType.TYPE_END_GAME) {
      this.cards = [];
    }
  }
}
