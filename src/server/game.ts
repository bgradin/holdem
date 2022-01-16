import Client from './client';

export default class Game {
  id: string;
  owner: Client;
  clients: Client[] = [];

  constructor(id: string, owner: Client) {
    this.id = id;
    this.owner = owner;
  }

  addPlayer(client: Client) {
    this.clients.push(client);
  }
}
