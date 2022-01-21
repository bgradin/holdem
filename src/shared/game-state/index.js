"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetAction = exports.GameStatus = void 0;
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["INTERMISSION"] = 0] = "INTERMISSION";
    GameStatus[GameStatus["ACTIVE"] = 1] = "ACTIVE";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
var BetAction;
(function (BetAction) {
    BetAction[BetAction["CHECK"] = 0] = "CHECK";
    BetAction[BetAction["CALL"] = 1] = "CALL";
    BetAction[BetAction["RAISE"] = 2] = "RAISE";
    BetAction[BetAction["FOLD"] = 3] = "FOLD";
})(BetAction = exports.BetAction || (exports.BetAction = {}));
