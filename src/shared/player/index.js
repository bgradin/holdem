"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(details, client) {
        this.chips = 0;
        this.bet = 0;
        this.cards = [];
        this.afk = false;
        this.folded = false;
        this.id = details.id;
        this.ip = details.ip;
        this.publicId = details.publicId;
        this.name = details.name;
        this.client = client;
    }
    setChips(chips) {
        this.chips = chips;
    }
    setBet(bet) {
        this.bet = bet;
    }
    setFolded(folded) {
        this.folded = folded;
    }
    setLatestAction(action) {
        this.latestAction = action;
    }
    addCards(...cards) {
        cards.forEach((card) => {
            this.cards.push(card);
        });
    }
}
exports.default = Player;
