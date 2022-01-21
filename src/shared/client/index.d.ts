/// <reference types="node" />
import EventEmitter from 'events';
import ws from 'ws';
import Message from '../message';
export default class Client extends EventEmitter {
    #private;
    static EVENT_MESSAGE: string;
    static EVENT_TERMINATED: string;
    connected: boolean;
    constructor(client: ws);
    send(message: Message): void;
    sendAsync(message: Message, timeout?: number): Promise<Message>;
    close(): void;
}
