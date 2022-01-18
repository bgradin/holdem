import fs from 'fs';
import path from 'path';
import Message, { ErrorMessage } from './message';
import Player, { PlayerPublicDetails } from './player';
import shuffleCards, { Cards } from './cards';
import Errors from './errors';

const SECRET = fs.readFileSync(path.resolve(__dirname, 'SECRET'), { encoding: 'utf8' });
const BET_TIMEOUT = 11000;

export enum GameStatus {
  INTERMISSION,
  ACTIVE,
}

export enum BetAction {
  CHECK,
  CALL,
  RAISE,
  FOLD,
}

export interface GameConfiguration {
  name: string;
  startingChips: number;
}

export function validateGameConfiguration(data: any): boolean {
  return typeof data === 'object'
    && data.secret === SECRET
    && typeof data.name === 'string'
    && typeof data.startingChips === 'number'
    && data.startingChips > 0;
}

interface GamePublicState {
  id: string;
  status: GameStatus;
  name: string;
  ownerId: string;
  smallBlindId: string;
  largeBlindId: string;
  currentBetIndex?: number;
  pot: number;
  bet: number;
  cards: Cards;
  players: PlayerPublicDetails[];
}

async function deal(player: Player, ...cards: Cards): Promise<Message> {
  player.addCards(...cards);

  return player.client.sendAsync(new Message({
    type: Message.TYPE_DEAL,
    data: {
      cards: player.cards,
    },
  }));
}

export default class Game {
  id: string;
  status = GameStatus.INTERMISSION;
  owner: Player;
  dealerIndex = 0;
  smallBlindIndex = 0;
  largeBlindIndex = 0;
  currentBetIndex?: number;
  name: string;
  startingChips: number;
  pot = 0;
  bet = 0;
  players: Player[] = [];
  deck: Cards = [];
  cards: Cards = [];

  constructor(id: string, owner: Player, config: GameConfiguration) {
    this.id = id;
    this.owner = owner;
    this.name = config.name;
    this.startingChips = config.startingChips;

    this.owner.client.on(Message.TYPE_START_ROUND, this.#startRound.bind(this));

    this.players.push(this.owner);
  }

  addPlayer(player: Player) {
    player.setChips(this.startingChips);
    this.players.push(player);

    if (this.dealerIndex === this.smallBlindIndex) {
      this.smallBlindIndex += 1;
    }
    if (this.status !== GameStatus.ACTIVE) {
      this.largeBlindIndex = this.#nextActivePlayerIndex(this.smallBlindIndex);
    }

    this.updatePlayers(player);
  }

  removePlayer(player: Player) {
    const index = this.players.indexOf(player);
    if (index >= 0) {
      this.players.splice(index, 1);

      if (this.status !== GameStatus.ACTIVE) {
        if (this.dealerIndex >= index) {
          this.dealerIndex -= 1;
        }

        this.smallBlindIndex = this.#nextActivePlayerIndex(this.dealerIndex);
        this.largeBlindIndex = this.#nextActivePlayerIndex(this.smallBlindIndex);
      }

      this.updatePlayers();
    }
  }

  updatePlayers(exceptPlayer?: Player) {
    const state = this.getState();
    this.players
      .forEach((p) => {
        if (p !== exceptPlayer && p.client.connected) {
          p.client.send(new Message({
            type: Message.TYPE_GAME_STATE,
            data: { state },
          }));
        }
      });
  }

  getState(): GamePublicState {
    return {
      id: this.id,
      status: this.status,
      name: this.name,
      ownerId: this.owner.id,
      smallBlindId: this.players[this.smallBlindIndex].id,
      largeBlindId: this.players[this.largeBlindIndex].id,
      currentBetIndex: this.currentBetIndex,
      pot: this.pot,
      bet: this.bet,
      cards: this.cards,
      players: this.players.map((player) => ({
        name: player.name,
        chips: player.chips,
        bet: player.bet,
        afk: player.afk,
        folded: player.folded,
        connected: player.client.connected,
        latestAction: player.latestAction,
      })),
    };
  }

  #nextActivePlayerIndex(index: number): number {
    let i = index + 1;
    while (i !== index || this.players[i].afk || !this.players[i].client.connected) {
      i = this.players.length - 1 ? 0 : i + 1;
    }
    return i;
  }

  #resetGame() {
    this.status = GameStatus.ACTIVE;
    this.pot = 0;
    this.deck = shuffleCards();
    this.cards = [];

    for (let i = 0; i < this.players.length; i += 1) {
      this.players[i].folded = false;
      this.players[i].bet = 0;
      delete this.players[i].latestAction;
    }
  }

  async #startRound() {
    if (this.players.length < 2) {
      this.owner.client.send(new ErrorMessage(Errors.TOO_FEW_PLAYERS));
    }

    this.#resetGame();

    await this.#deal();
    await this.#takeBets();
    await this.#dealFlop();
    await this.#takeBets();
    await this.#dealCard();
    await this.#takeBets();
    await this.#dealCard();
    await this.#takeBets();
    await this.#endRound();
    await this.#incrementBlindsAndDealer();
  }

  async #dealAllPlayers(fn: () => Cards) {
    const promises: Promise<Message>[] = [];
    for (let i = 0; i < this.players.length; i += 1) {
      promises.push(deal(
        this.players[i],
        ...fn(),
      ));
    }

    return Promise.all(promises);
  }

  async #deal() {
    return this.#dealAllPlayers(() => [
      this.deck.pop() as string, // Ugly, but guaranteed to be safe
      this.deck.pop() as string,
    ]);
  }

  #dealFlop() {
    this.cards.concat([
      this.deck.pop() as string,
      this.deck.pop() as string,
      this.deck.pop() as string,
    ]);
    this.updatePlayers();
  }

  #dealCard() {
    this.cards.push(this.deck.pop() as string);
    this.updatePlayers();
  }

  async #takeBets() {
    const leftOfDealer = this.#nextActivePlayerIndex(this.dealerIndex);
    for (let i = leftOfDealer; i !== leftOfDealer; i = i !== this.players.length - 1 ? i + 1 : 0) {
      const player = this.players[i];
      if (!player.folded) {
        if (this.bet && (player.afk || !player.client.connected)) {
          this.#handleBet(player, { action: BetAction.FOLD });
        } else {
          this.currentBetIndex = i;
          this.updatePlayers();

          // We want the below code to be blocking
          // eslint-disable-next-line no-await-in-loop
          const response = await this.players[i].client.sendAsync(new Message({
            type: Message.TYPE_BET,
          }), BET_TIMEOUT);
          this.#handleBet(this.players[i], response.data);
          this.updatePlayers();
        }
      }
    }

    delete this.currentBetIndex;

    for (let i = 0; i < this.players.length; i += 1) {
      this.pot += this.players[i].bet;
      this.players[i].bet = 0;
    }

    this.updatePlayers();
  }

  #handleBet(player: Player, data: any) {
    const betAction = data.action
      ? data.action as BetAction
      : BetAction.FOLD;

    if (betAction === BetAction.RAISE
      && typeof data.amount === 'number'
      && player.chips >= data.amount) {
      this.bet += data.amount;

      player.setChips(player.chips - (this.bet - player.bet));
      player.setBet(this.bet);
      player.setLatestAction(BetAction.RAISE);
    } else if (betAction === BetAction.CALL
      && player.chips >= this.bet - player.bet) {
      player.setChips(player.chips - (this.bet - player.bet));
      player.setBet(this.bet);
      player.setLatestAction(BetAction.CALL);
    } else if (betAction !== BetAction.CHECK || this.bet > 0) {
      player.setFolded(true);
      player.setLatestAction(BetAction.FOLD);
    } else {
      player.setLatestAction(BetAction.CHECK);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async #endRound() {
    // Evaluate hands and payout winner
  }

  async #incrementBlindsAndDealer() {
    this.dealerIndex = this.#nextActivePlayerIndex(this.dealerIndex);
    this.smallBlindIndex = this.#nextActivePlayerIndex(this.dealerIndex);
    this.largeBlindIndex = this.#nextActivePlayerIndex(this.smallBlindIndex);
  }
}
