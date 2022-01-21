import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GamePublicState } from 'shared/game-state';
import Player from '../player';

interface TableProps {
  state: GamePublicState | null;
}

export default function Table({ state }: TableProps) {
  const tableSizeClass = state ? `table-size-${state.players.length}` : '';

  return (
    <div className={`table ${tableSizeClass}`}>
      {
        state && (
          <div className="players">
            {
              state.players.map((player) => (
                <div key={uuidv4()} className="player-positioner">
                  <div className="player-wrapper">
                    <Player details={player} state={state} />
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  );
}
