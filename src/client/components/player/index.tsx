import * as React from 'react';
// import Client from '../../client';
// import { GamePublicState } from '../game';

export interface PlayerPublicDetails {
  name: string;
  chips: number;
  connected: boolean;
}

interface PlayerProps {
  // state: GamePublicState;
  // client: Client;
  details: PlayerPublicDetails;
}

export default function Player({ details }: PlayerProps) {
  const connectionStateClass = details.connected ? 'connected' : 'disconnected';

  return (
    <div className={`player ${connectionStateClass}`}>
      <div className="details">
        <div className="name">
          {details.name}
        </div>
        <div className="chips">
          $
          {details.chips}
        </div>
      </div>
    </div>
  );
}
