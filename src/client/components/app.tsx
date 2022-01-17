import * as React from 'react';
import Client from '../client';
import Message from '../message';
import Game from './game';
import PrerequisiteModal from './prerequisite-modal';

let client: Client;

export default function App() {
  const [connected, setConnected] = React.useState(false);
  const [gameState, setGameState] = React.useState(null);

  if (!client) {
    client = new Client();
    client.on(Message.TYPE_CONFIRM, (message: Message) => {
      if (message.subtype === Message.TYPE_GAME_STATE) {
        setConnected(true);
        setGameState(message.data.state);
      }
    });
    client.on(Message.TYPE_GAME_STATE, (message: Message) => {
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
      <Game state={gameState} />
      {
        !connected && <PrerequisiteModal client={client} />
      }
    </>
  );
}
