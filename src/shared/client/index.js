"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Client_instances, _Client_client, _Client_pongReceived, _Client_interval, _Client_internalEmitter, _Client_onClose, _Client_onMessage, _Client_onPong, _Client_ping;
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = __importDefault(require("console"));
const events_1 = __importDefault(require("events"));
const timers_1 = require("timers");
const Message_1 = require("../Message");
const PING_INTERVAL = 10000;
const MAX_TIMEOUT = 10000;
class Client extends events_1.default {
    constructor(client) {
        super();
        _Client_instances.add(this);
        _Client_client.set(this, void 0);
        _Client_pongReceived.set(this, true);
        _Client_interval.set(this, void 0);
        _Client_internalEmitter.set(this, new events_1.default());
        __classPrivateFieldSet(this, _Client_client, client, "f");
        this.connected = true;
        __classPrivateFieldGet(this, _Client_client, "f").on('message', __classPrivateFieldGet(this, _Client_instances, "m", _Client_onMessage).bind(this));
        __classPrivateFieldGet(this, _Client_client, "f").on('pong', __classPrivateFieldGet(this, _Client_instances, "m", _Client_onPong).bind(this));
        __classPrivateFieldGet(this, _Client_client, "f").on('close', __classPrivateFieldGet(this, _Client_instances, "m", _Client_onClose).bind(this));
        __classPrivateFieldSet(this, _Client_interval, setInterval(__classPrivateFieldGet(this, _Client_instances, "m", _Client_ping).bind(this), PING_INTERVAL), "f");
    }
    send(message) {
        __classPrivateFieldGet(this, _Client_client, "f").send(JSON.stringify({
            type: message.type,
            subtype: message.subtype,
            data: message.data,
        }));
    }
    sendAsync(message, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            let resolved = false;
            return new Promise((resolve, reject) => {
                if (!__classPrivateFieldGet(this, _Client_client, "f")) {
                    console_1.default.error('Client: Message send failed: No socket available!');
                    reject();
                    return;
                }
                setTimeout(() => { if (!resolved)
                    reject(); }, timeout || MAX_TIMEOUT);
                let errorCallback;
                const successCallback = (successMessage) => {
                    resolved = true;
                    resolve(successMessage);
                    __classPrivateFieldGet(this, _Client_internalEmitter, "f").off(Message_1.MessageType.TYPE_ERROR, errorCallback);
                };
                errorCallback = (errorMessage) => {
                    resolved = true;
                    reject(errorMessage);
                    __classPrivateFieldGet(this, _Client_internalEmitter, "f").off(Message_1.MessageType.TYPE_CONFIRM, successCallback);
                };
                __classPrivateFieldGet(this, _Client_internalEmitter, "f").once(Message_1.MessageType.TYPE_CONFIRM, successCallback);
                __classPrivateFieldGet(this, _Client_internalEmitter, "f").once(Message_1.MessageType.TYPE_ERROR, errorCallback);
                this.send(message);
            });
        });
    }
    close() {
        __classPrivateFieldGet(this, _Client_client, "f").close();
        (0, timers_1.clearInterval)(__classPrivateFieldGet(this, _Client_interval, "f"));
        this.emit(Client.EVENT_TERMINATED, this);
    }
}
exports.default = Client;
_Client_client = new WeakMap(), _Client_pongReceived = new WeakMap(), _Client_interval = new WeakMap(), _Client_internalEmitter = new WeakMap(), _Client_instances = new WeakSet(), _Client_onClose = function _Client_onClose() {
    this.close();
}, _Client_onMessage = function _Client_onMessage(message) {
    const rawData = message.toString('utf8');
    try {
        const json = JSON.parse(message.toString('utf8'));
        if (typeof json.type === 'string' && (!json.data || typeof json.data === 'object')) {
            this.emit(json.type, json.data);
        }
        else {
            throw new Error();
        }
    }
    catch (err) {
        console_1.default.error(`Invalid message received: ${rawData}`);
    }
}, _Client_onPong = function _Client_onPong() {
    __classPrivateFieldSet(this, _Client_pongReceived, true, "f");
}, _Client_ping = function _Client_ping() {
    if (!__classPrivateFieldGet(this, _Client_pongReceived, "f")) {
        this.connected = false;
        __classPrivateFieldGet(this, _Client_client, "f").terminate();
        this.emit(Client.EVENT_TERMINATED);
    }
    __classPrivateFieldSet(this, _Client_pongReceived, false, "f");
    __classPrivateFieldGet(this, _Client_client, "f").ping();
};
Client.EVENT_MESSAGE = 'message';
Client.EVENT_TERMINATED = 'terminated';
