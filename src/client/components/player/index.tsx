import * as React from 'react';
import { GamePublicState } from 'shared/game-state';
import { PlayerPublicDetails } from 'shared/player';

interface PlayerProps {
  state: GamePublicState;
  details: PlayerPublicDetails;
}

export default function Player({ state, details }: PlayerProps) {
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
    </div>
  );
}
