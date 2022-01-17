import console from 'console';
import EventEmitter from 'events';
import ws from 'ws';
import Message from './message';

const PING_INTERVAL = 10000;

export interface PlayerDetails {
  name: string;
}

export default class Client extends EventEmitter {
  static EVENT_MESSAGE = 'message';
  static EVENT_TERMINATED = 'terminated';

  alive: boolean;
  id: string;
  player?: PlayerDetails;

  #client: ws;
  #pongReceived = true;

  constructor(client: ws, id: string) {
    super();

    this.#client = client;
    this.alive = true;
    this.id = id;

    this.#client.on('message', this.#onMessage.bind(this));
    this.#client.on('pong', this.#onPong.bind(this));
    this.#client.on('close', this.#onClose.bind(this));

    setInterval(this.#ping.bind(this), PING_INTERVAL);
  }

  send(message: Message) {
    this.#client.send(JSON.stringify({
      type: message.type,
      subtype: message.subtype,
      data: message.data,
    }));
  }

  close() {
    this.#client.close();
    this.emit(Client.EVENT_TERMINATED, this);
  }

  identify(player: PlayerDetails) {
    this.player = player;
  }

  #onClose() {
    this.close();
  }

  #onMessage(message: ws.RawData) {
    const rawData = message.toString('utf8');
    try {
      const json = JSON.parse(message.toString('utf8'));
      if (typeof json.type === 'string' && typeof json.data === 'object') {
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
      this.alive = false;
      this.#client.terminate();
      this.emit(Client.EVENT_TERMINATED);
    }

    this.#pongReceived = false;
    this.#client.ping();
  }
}
