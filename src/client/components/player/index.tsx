import * as React from 'react';
import Client from '../../client';
import { GamePublicState } from '../../../shared/game-state';

export interface PlayerPublicDetails {
  name: string;
  chips: number;
  connected: boolean;
}

interface PlayerProps {
  client: Client;
  state: GamePublicState;
  details: PlayerPublicDetails;
}

export default function Player({ client, state, details }: PlayerProps) {
  const connectionStateClass = details.connected ? 'connected' : 'disconnected';

  return (
    <div className={`player ${connectionStateClass}`}>
      {
        state.currentBetId && state.currentBetId === client.id && (
          <svg
            className="timer"
            viewBox="0 0 100 100"
          >
            <g>
              <path
                className="timer-circle"
                d="M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0"
              />
            </g>
          </svg>
        )
      }
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
