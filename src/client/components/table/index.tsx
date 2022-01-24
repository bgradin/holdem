import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Form } from 'react-bootstrap';
import { GamePublicState, GameStatus } from 'shared/game-state';
import Message, { MessageType } from 'shared/message';
import Client from '../../client';
import Player from '../player';
import { cardSvgs } from '../card';

interface TableProps {
  client: Client;
  state: GamePublicState | null;
}

let cachedClient: Client;
export default function Table({ client, state }: TableProps) {
  const tableSizeClass = state ? `table-size-${state.players.length}` : '';
  const player = state?.players.find((x) => x.id === client.publicId);
  const betting = state?.currentBetId === client.publicId;

  const raiseAmountRef = React.useRef<HTMLInputElement>(null);
  const raiseButtonRef = React.useRef<HTMLButtonElement>(null);

  const [checking, setChecking] = React.useState<boolean>(false);
  const [folding, setFolding] = React.useState<boolean>(false);
  const [calling, setCalling] = React.useState<boolean>(false);
  const [raising, setRaising] = React.useState<boolean>(false);

  if (cachedClient !== client) {
    cachedClient = client;
    client.on(MessageType.TYPE_BET, () => {
      if (!state?.bet && checking) {
        client.check();
      } else if (folding) {
        client.fold();
      } else if (raising && raiseAmountRef.current) {
        client.raise((parseInt(raiseAmountRef.current.value, 10) / 100) * (player?.chips || 0));
      } else if (calling) {
        client.call();
      }
    });
  }

  if (checking && state?.bet) {
    setChecking(false);
  }

  return (
    <div className={`table ${tableSizeClass}`}>
      {
        state && (
          <div className="players">
            {
              state.players.map((p) => (
                <div key={uuidv4()} className="player-positioner">
                  <div className="player-wrapper">
                    <Player client={client} details={p} state={state} />
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
      {
        state && state.cards && (
          <div className="cards">
            {state.cards.map((card) => (
              <div className="card">
                {cardSvgs[card]()}
              </div>
            ))}
          </div>
        )
      }
      {
        state && state.status === GameStatus.ACTIVE && (
          <div className="actions">
            <Button
              disabled={player?.folded}
              variant={betting ? 'primary' : 'outline-dark'}
              active={state.bet ? folding : checking}
              onClick={() => {
                if (betting) {
                  if (state.bet) {
                    client.fold();
                  } else {
                    client.check();
                  }
                } else if (state.bet) {
                  setFolding(!folding);
                } else {
                  setChecking(!checking);
                }
              }}
            >
              {state.bet ? 'Fold' : 'Check'}
            </Button>
            <Button
              disabled={player?.folded || !state.bet}
              variant={betting ? 'primary' : 'outline-dark'}
              active={calling}
              onClick={() => {
                if (betting) {
                  client.call();
                } else {
                  setCalling(!calling);
                }
              }}
            >
              Call
            </Button>
            <br />
            <Form.Range
              ref={raiseAmountRef}
              className="raiseAmount"
              disabled={player?.folded}
              value={0}
              onChange={() => {
                if (raiseAmountRef.current && raiseButtonRef.current) {
                  const raisePercent = parseInt(raiseAmountRef.current.value, 10) / 100;
                  raiseButtonRef.current.innerText = `Raise ${raisePercent * (player?.chips || 0)}`;
                }
              }}
            />
            <Button
              ref={raiseButtonRef}
              className="raiseButton"
              disabled={player?.folded}
              variant={betting ? 'primary' : 'outline-dark'}
              active={raising}
              onClick={() => {
                if (betting && raiseAmountRef.current) {
                  const raisePercent = parseInt(raiseAmountRef.current.value, 10) / 100;
                  client.raise(raisePercent * (player?.chips || 0));
                } else {
                  setRaising(!raising);
                }
              }}
            >
              Raise
            </Button>
            <br />
            <Form.Check
              type="switch"
              label="AFK"
              checked={!!player?.afk}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                client.send(new Message({
                  type: MessageType.TYPE_AFK,
                  data: { afk: event.target.checked },
                }));
              }}
            />
          </div>
        )
      }
    </div>
  );
}
