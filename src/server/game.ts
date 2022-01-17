import Client from './client';
import Message from './message';

interface GamePublicState {

}

export default class Game {
  id: string;
  owner: Client;
  clients: Client[] = [];

  constructor(id: string, owner: Client) {
    this.id = id;
    this.owner = owner;
    this.clients.push(this.owner);
  }

  addPlayer(client: Client) {
    this.clients.push(client);

    const state = this.getState();
    this.clients
      .forEach((gameClient) => {
        const isNewPlayer = gameClient === client;
        gameClient.send(new Message({
          type: isNewPlayer ? Message.TYPE_CONFIRM : Message.TYPE_GAME_STATE,
          subtype: isNewPlayer ? Message.TYPE_GAME_STATE : undefined,
          data: { state },
        }));
      });
  }

  removePlayer(client: Client) {
    const index = this.clients.indexOf(client);
    if (index >= 0) {
      this.clients.splice(index, 1);

      const state = this.getState();
      this.clients
        .forEach((gameClient) => {
          gameClient.send(new Message({
            type: Message.TYPE_GAME_STATE,
            data: { state },
          }));
        });
    }
  }

  getState(): GamePublicState {
    return {
      id: this.id,
      owner: this.owner.id,
      clients: this.clients.map((client) => ({
        alive: client.alive,
        id: client.id,
        player: client.player,
      })),
    };
  }
}
