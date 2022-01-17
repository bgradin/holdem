import * as React from 'react';
import { ClientDetails } from '../../client';

export interface GameDetails {
  secret: string;
}

export interface GamePublicState {
  id: string;
  clients: ClientDetails[];
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
        state && (
          <>
            <p>Clients:</p>
            {state.clients.map(
              (x: ClientDetails) => (<p key={x.id}>{x.player.name}</p>),
            )}
          </>
        )
      }
    </div>
  );
}
