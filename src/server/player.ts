import Client from './client';

export interface PlayerPublicDetails {
  name: string;
  connected: boolean;
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
  client: Client;

  constructor(details: PlayerDetails, client: Client) {
    this.id = details.id;
    this.ip = details.ip;
    this.name = details.name;
    this.client = client;
  }
}
