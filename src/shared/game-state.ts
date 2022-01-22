import { Cards } from './cards';
import { PlayerPublicDetails } from './player';

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

export interface GamePublicState {
  id: string;
  status: GameStatus;
  name: string;
  ownerId: string;
  smallBlindId: string;
  largeBlindId: string;
  currentBetId?: string;
  pot: number;
  bet: number;
  cards: Cards;
  players: PlayerPublicDetails[];
}
