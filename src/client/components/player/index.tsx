import * as React from 'react';
import { GamePublicState } from 'shared/game-state';
import { PlayerPublicDetails } from 'shared/player';
import { v4 as uuidv4 } from 'uuid';
import Card from '../card';
import Client from '../../client';

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
        state.currentBetId && state.currentBetId === details.id && (
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
      {
        details.id === client.publicId && (
          <div className="cards">
            {
              client.cards && client.cards.map((card) => (
                <div key={uuidv4()} className="card-wrapper">
                  <Card code={card} />
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
}
