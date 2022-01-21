import { Cards } from '../cards';
import Client from '../client';
import { BetAction } from '../game-state';
export interface PlayerPublicDetails {
    id: string;
    name: string;
    chips: number;
    bet: number;
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
    chips: number;
    bet: number;
    cards: Cards;
    client: Client;
    afk: boolean;
    folded: boolean;
    latestAction?: BetAction;
    constructor(details: PlayerDetails, client: Client);
    setChips(chips: number): void;
    setBet(bet: number): void;
    setFolded(folded: boolean): void;
    setLatestAction(action: BetAction): void;
    addCards(...cards: Cards): void;
}
