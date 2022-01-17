import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PlayerDetails } from '../../client';

export interface GameDetails {
  secret: string;
  name: string;
}

export interface GamePublicState {
  id: string;
  name: string;
  ownerId: string,
  players: PlayerDetails[];
}

interface GameProps {
  state: GamePublicState | null;
}

export default function Game({ state }: GameProps) {
  if (state) {
    window.location.hash = state.id.toString();
  } else {
    window.history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search,
    );
  }

  return (
    <div className="game">
      {
        state && <h1>{state.name}</h1>
      }
      {
        state && (
          <>
            <p>Clients:</p>
            {state.players.map(
              (x: PlayerDetails) => (<p key={uuidv4()}>{x.name}</p>),
            )}
          </>
        )
      }
    </div>
  );
}
