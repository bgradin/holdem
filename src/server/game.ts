import Message from './message';
import Player, { PlayerPublicDetails } from './player';

interface GamePublicState {
  id: string;
  name: string;
  ownerId: string;
  players: PlayerPublicDetails[];
}

export default class Game {
  id: string;
  name: string;
  owner: Player;
  players: Player[] = [];

  constructor(id: string, name: string, owner: Player) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.players.push(this.owner);
  }

  addPlayer(player: Player) {
    this.players.push(player);

    const state = this.getState();
    this.players
      .forEach((p) => {
        const isNewPlayer = p === player;
        if (p.client.connected) {
          p.client.send(new Message({
            type: isNewPlayer ? Message.TYPE_CONFIRM : Message.TYPE_GAME_STATE,
            subtype: isNewPlayer ? Message.TYPE_GAME_STATE : undefined,
            data: { state },
          }));
        }
      });
  }

  removePlayer(player: Player) {
    const index = this.players.indexOf(player);
    if (index >= 0) {
      this.players.splice(index, 1);

      const state = this.getState();
      this.players
        .forEach((p) => {
          if (p.client.connected) {
            p.client.send(new Message({
              type: Message.TYPE_GAME_STATE,
              data: { state },
            }));
          }
        });
    }
  }

  getState(): GamePublicState {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.owner.id,
      players: this.players.map((player) => ({
        name: player.name,
        connected: player.client.connected,
      })),
    };
  }
}
