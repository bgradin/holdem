import * as React from 'react';
import Client from '../client';
import Game from './game';
import PrerequisiteModal from './prerequisite-modal';
import Message, { MessageType } from '../../server/message';

let client: Client;

export default function App() {
  const [connected, setConnected] = React.useState(false);
  const [gameState, setGameState] = React.useState(null);

  if (!client) {
    client = new Client();
    client.on(MessageType.TYPE_CONFIRM, (message: Message) => {
      if (message.subtype === MessageType.TYPE_GAME_UPDATE) {
        setConnected(true);
        setGameState(message.data.state);
      }
    });
    client.on(MessageType.TYPE_GAME_UPDATE, (message: Message) => {
      setConnected(true);
      setGameState(message.data.state);
    });
    client.on(Client.EVENT_TERMINATED, () => {
      setConnected(false);
      setGameState(null);
    });
  }

  return (
    <>
      <Game state={gameState} client={client} />
      {
        !connected && <PrerequisiteModal client={client} />
      }
    </>
  );
}
