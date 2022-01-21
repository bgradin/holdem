import { Cards } from '../cards';
import Client from '../client';
import { BetAction } from '../game-state';

export interface PlayerPublicDetails {
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
  ip: string;
  name: string;
}

export default class Player {
  id: string;
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
    this.name = details.name;
    this.client = client;
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