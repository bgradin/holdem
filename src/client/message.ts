interface MessageConfig {
  type: string;
  subtype?: string;
  data?: any;
}

export default class Message {
  static TYPE_CREATE_GAME = 'create';
  static TYPE_START_GAME = 'start';
  static TYPE_JOIN_GAME = 'join';
  static TYPE_REGISTER_PLAYER = 'register';
  static TYPE_GAME_STATE = 'state';
  static TYPE_CARDS = 'cards';
  static TYPE_BET = 'bet';
  static TYPE_CONFIRM = 'confirm';
  static TYPE_ERROR = 'error';

  type: string;
  subtype?: string;
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
      type: Message.TYPE_CONFIRM,
    });
  }
}

export class ConfirmationMessage extends Message {
  constructor(data: object) {
    super({
      type: Message.TYPE_CONFIRM,
      data,
    });
  }
}

export class ErrorMessage extends Message {
  constructor(subtype?: string) {
    super({
      type: Message.TYPE_ERROR,
      subtype,
    });
  }
}
