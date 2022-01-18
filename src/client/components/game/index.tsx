import * as React from 'react';
import { Button } from 'react-bootstrap';
import Table from '../table';
import Client from '../../client';
import { PlayerPublicDetails } from '../player';
import Message from '../../message';

export interface GameDetails {
  secret: string;
  name: string;
  startingChips: number;
}

export interface GamePublicState {
  id: string;
  name: string;
  ownerId: string,
  players: PlayerPublicDetails[];
}

interface GameProps {
  state: GamePublicState | null;
  client: Client;
}

export default function Game({ state, client }: GameProps) {
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
      <div className="title-area">
        <h1 className="title">
          Holdem
          {state && `: ${state.name}`}
        </h1>
        {
          state && state.ownerId === client.id && (
            <div className="owner-options">
              <Button
                className="owner-option"
                variant="link"
                onClick={() => {
                  client.send(new Message({ type: Message.TYPE_START_ROUND }));
                }}
              >
                Start Round
              </Button>
              <Button className="owner-option" variant="link">End Game</Button>
            </div>
          )
        }
      </div>
      <div className="play-area">
        <div className="inner">
          {/* HACK: Use 1:1 image to keep the table a circle */}
          <img
            className="spacer"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt=""
          />

          <div className="table-wrapper">
            <Table state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}
