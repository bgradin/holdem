import { Cards } from '../cards';
import { PlayerPublicDetails } from '../player';
export declare enum GameStatus {
    INTERMISSION = 0,
    ACTIVE = 1
}
export declare enum BetAction {
    CHECK = 0,
    CALL = 1,
    RAISE = 2,
    FOLD = 3
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
