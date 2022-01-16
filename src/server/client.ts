import console from 'console';
import EventEmitter from 'events';
import ws from 'ws';
import Message, { ErrorMessage } from './message';

const PING_INTERVAL = 10000;

interface PlayerId {
  name: string;
}

export default class Client extends EventEmitter {
  static EVENT_MESSAGE = 'message';
  static EVENT_TERMINATED = 'terminated';

  static ERROR_PLAYER_MUST_IDENTIFY = 'identify';

  alive: boolean;
  id?: PlayerId;

  #client: ws;
  #pongReceived = true;

  constructor(client: ws) {
    super();

    this.#client = client;
    this.alive = true;

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

  #identify(data: any) {
    if (typeof data === 'object' && typeof data.name === 'string') {
      this.id = data;
      this.send(new Message({ type: Message.TYPE_CONFIRM }));
    } else {
      console.error(`Invalid player data: ${data.toString()}`);
      this.send(new ErrorMessage(Client.ERROR_PLAYER_MUST_IDENTIFY));
    }
  }

  #onClose() {
    this.#client.close();
    this.emit(Client.EVENT_TERMINATED, this);
  }

  #onMessage(message: ws.RawData) {
    const rawData = message.toString('utf8');
    try {
      const json = JSON.parse(message.toString('utf8'));
      if (typeof json.type === 'string' && typeof json.data === 'object') {
        if (json.type === Message.TYPE_IDENTIFY_PLAYER) {
          this.#identify(json.data);
        } else {
          this.emit(json.type, json.data);
        }
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
