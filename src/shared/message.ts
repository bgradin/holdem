export enum ErrorType {
  PLAYER_MUST_REGISTER = 'player:register',
  INVALID_DATA = 'invalid',
  ALREADY_IN_GAME = 'game:exists',
  GAME_NOT_FOUND = 'game:missing',
  GAME_IS_FULL = 'game:full',
  TOO_FEW_PLAYERS = 'game:players',
  UNEXPECTED_CONFIRMATION_DATA = 'client:blabla',
}

export enum MessageType {
  TYPE_CREATE_GAME = 'game:create',
  TYPE_GAME_CLOSED = 'game:closed',
  TYPE_JOIN_GAME = 'game:join',
  TYPE_REGISTER_PLAYER = 'player:register',
  TYPE_GAME_UPDATE = 'game:update',
  TYPE_DEAL_PLAYER = 'player:deal',
  TYPE_BET = 'player:bet',
  TYPE_CONFIRM = 'confirm',
  TYPE_ERROR = 'error',
  TYPE_START_ROUND = 'game:start',
  TYPE_DEAL_GAME = 'game:deal',
  TYPE_AFK = 'player:afk',
}

interface MessageConfig {
  type: MessageType;
  subtype?: MessageType | ErrorType;
  data?: any;
}

export default class Message {
  type: MessageType;
  subtype?: MessageType | ErrorType;
  data?: any;

  constructor(config: MessageConfig) {
    this.type = config.type;
    this.subtype = config.subtype;
    this.data = config.data;
  }
}

export class SimpleConfirmationMessage extends Message {
  constructor() {
    super({
      type: MessageType.TYPE_CONFIRM,
    });
  }
}

export class ConfirmationMessage extends Message {
  constructor(data: object) {
    super({
      type: MessageType.TYPE_CONFIRM,
      data,
    });
  }
}

export class ErrorMessage extends Message {
  constructor(subtype?: ErrorType) {
    super({
      type: MessageType.TYPE_ERROR,
      subtype,
    });
  }
}
