import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
// import Client from '../../client';
import { GamePublicState } from '../game';
import Player from '../player';

interface TableProps {
  state: GamePublicState | null;
  // client: Client;
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
                    <Player details={player} />
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
