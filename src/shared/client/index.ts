import console from 'console';
import EventEmitter from 'events';
import { clearInterval } from 'timers';
import ws from 'ws';
import Message, { MessageType } from '../Message';

const PING_INTERVAL = 10000;
const MAX_TIMEOUT = 10000;

export default class Client extends EventEmitter {
  static EVENT_MESSAGE = 'message';
  static EVENT_TERMINATED = 'terminated';

  connected: boolean;

  #client: ws;
  #pongReceived = true;
  #interval: ReturnType<typeof setInterval>;
  #internalEmitter = new EventEmitter();

  constructor(client: ws) {
    super();

    this.#client = client;
    this.connected = true;

    this.#client.on('message', this.#onMessage.bind(this));
    this.#client.on('pong', this.#onPong.bind(this));
    this.#client.on('close', this.#onClose.bind(this));

    this.#interval = setInterval(this.#ping.bind(this), PING_INTERVAL);
  }

  send(message: Message) {
    this.#client.send(JSON.stringify({
      type: message.type,
      subtype: message.subtype,
      data: message.data,
    }));
  }

  async sendAsync(message: Message, timeout?: number): Promise<Message> {
    let resolved = false;
    return new Promise((resolve, reject) => {
      if (!this.#client) {
        console.error('Client: Message send failed: No socket available!');
        reject();
        return;
      }

      setTimeout(() => { if (!resolved) reject(); }, timeout || MAX_TIMEOUT);
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

      this.#internalEmitter.once(MessageType.TYPE_CONFIRM, successCallback);
      this.#internalEmitter.once(MessageType.TYPE_ERROR, errorCallback);

      this.send(message);
    });
  }

  close() {
    this.#client.close();
    clearInterval(this.#interval);
    this.emit(Client.EVENT_TERMINATED, this);
  }

  #onClose() {
    this.close();
  }

  #onMessage(message: ws.RawData) {
    const rawData = message.toString('utf8');
    try {
      const json = JSON.parse(message.toString('utf8'));
      if (typeof json.type === 'string' && (!json.data || typeof json.data === 'object')) {
        this.emit(json.type, json.data);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(`Invalid message received: ${rawData}`);
    }
  }

  #onPong() {
    this.#pongReceived = true;
  }

  #ping() {
    if (!this.#pongReceived) {
      this.connected = false;
      this.#client.terminate();
      this.emit(Client.EVENT_TERMINATED);
    }

    this.#pongReceived = false;
    this.#client.ping();
  }
}
