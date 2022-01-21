"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessage = exports.ConfirmationMessage = exports.SimpleConfirmationMessage = exports.MessageType = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["PLAYER_MUST_REGISTER"] = "player:register";
    ErrorType["INVALID_DATA"] = "invalid";
    ErrorType["ALREADY_IN_GAME"] = "game:exists";
    ErrorType["GAME_NOT_FOUND"] = "game:missing";
    ErrorType["GAME_IS_FULL"] = "game:full";
    ErrorType["TOO_FEW_PLAYERS"] = "game:players";
    ErrorType["UNEXPECTED_CONFIRMATION_DATA"] = "client:blabla";
})(ErrorType = exports.ErrorType || (exports.ErrorType = {}));
var MessageType;
(function (MessageType) {
    MessageType["TYPE_CREATE_GAME"] = "game:create";
    MessageType["TYPE_GAME_CLOSED"] = "game:closed";
    MessageType["TYPE_JOIN_GAME"] = "game:join";
    MessageType["TYPE_REGISTER_PLAYER"] = "player:register";
    MessageType["TYPE_GAME_UPDATE"] = "game:update";
    MessageType["TYPE_DEAL_PLAYER"] = "player:deal";
    MessageType["TYPE_BET"] = "player:bet";
    MessageType["TYPE_CONFIRM"] = "confirm";
    MessageType["TYPE_ERROR"] = "error";
    MessageType["TYPE_START_ROUND"] = "game:start";
    MessageType["TYPE_DEAL_GAME"] = "game:deal";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
class Message {
    constructor(config) {
        this.type = config.type;
        this.subtype = config.subtype;
        this.data = config.data;
    }
}
exports.default = Message;
class SimpleConfirmationMessage extends Message {
    constructor() {
        super({
            type: MessageType.TYPE_CONFIRM,
        });
    }
}
exports.SimpleConfirmationMessage = SimpleConfirmationMessage;
class ConfirmationMessage extends Message {
    constructor(data) {
        super({
            type: MessageType.TYPE_CONFIRM,
            data,
        });
    }
}
exports.ConfirmationMessage = ConfirmationMessage;
class ErrorMessage extends Message {
    constructor(subtype) {
        super({
            type: MessageType.TYPE_ERROR,
            subtype,
        });
    }
}
exports.ErrorMessage = ErrorMessage;
