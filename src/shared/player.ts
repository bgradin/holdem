import { Cards } from './cards';
import Client from './client';
import { BetAction } from './game-state';
import { MessageType } from './message';

export interface PlayerPublicDetails {
  id: string;
  name: string;
  chips: number;
  bet: number,
  connected: boolean;
  afk: boolean;
  folded: boolean;
  latestAction?: BetAction;
}

export interface PlayerDetails {
  id: string;
  publicId: string;
  ip: string;
  name: string;
}

export default class Player {
  id: string;
  publicId: string;
  ip: string;
  name: string;
  chips = 0;
  bet = 0;
  cards: Cards = [];
  client: Client;
  afk = false;
  folded = false;
  latestAction?: BetAction;

  constructor(details: PlayerDetails, client: Client) {
    this.id = details.id;
    this.ip = details.ip;
    this.publicId = details.publicId;
    this.name = details.name;
    this.client = client;

    this.client.on(MessageType.TYPE_AFK, (data) => {
      this.afk = !!data.afk;
    });
  }

  setChips(chips: number) {
    this.chips = chips;
  }

  setBet(bet: number) {
    this.bet = bet;
  }

  setFolded(folded: boolean) {
    this.folded = folded;
  }

  setLatestAction(action: BetAction) {
    this.latestAction = action;
  }

  addCards(...cards: Cards) {
    cards.forEach((card) => {
      this.cards.push(card);
    });
  }
}
