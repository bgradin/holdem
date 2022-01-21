import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  Modal,
} from 'react-bootstrap';
import Client from '../../client';
import { ErrorMessage, ErrorType } from '../../../shared/message';
import { parseError } from '../../parsing';

interface FormProps {
  client: Client;
  goBack: () => void;
}

export default function CreateGame({
  client,
  goBack,
}: FormProps) {
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const secretRef = React.useRef<HTMLInputElement>(null);
  const playerNameRef = React.useRef<HTMLInputElement>(null);
  const gameNameRef = React.useRef<HTMLInputElement>(null);
  const startingChipsRef = React.useRef<HTMLInputElement>(null);
  const submitRef = React.useRef<HTMLButtonElement>(null);

  const enableSubmitButtonIfNecessary = () => {
    const allValuesProvided = ([
      secretRef,
      gameNameRef,
      playerNameRef,
      startingChipsRef,
    ] as React.RefObject<HTMLInputElement>[])
      .map((ref) => ref.current?.value || '')
      .every((x) => x.length > 0);
    setButtonDisabled(!allValuesProvided);
  };

  const goBackOnEscape = <T extends unknown>(event: React.KeyboardEvent<T>) => {
    if (event.key === 'Escape'
      || event.code === 'Escape'
      || event.which === 27
      || event.keyCode === 27) {
      goBack();
    }
  };

  return (
    <Modal.Body>
      {
        error && <Alert variant="danger">{error}</Alert>
      }
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group className="mb-3" controlId="formBasicSecret">
          <Form.Label>Server Secret</Form.Label>
          <Form.Control
            ref={secretRef}
            type="password"
            placeholder="Enter server secret"
            autoFocus
            onChange={enableSubmitButtonIfNecessary}
            onKeyDown={goBackOnEscape}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPlayerName">
          <Form.Label>Owner/Player Name</Form.Label>
          <Form.Control
            ref={playerNameRef}
            type="text"
            placeholder="Enter player name"
            onChange={enableSubmitButtonIfNecessary}
            onKeyDown={goBackOnEscape}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicGameName">
          <Form.Label>Game Name</Form.Label>
          <Form.Control
            ref={gameNameRef}
            type="text"
            placeholder="Enter game name"
            onChange={enableSubmitButtonIfNecessary}
            onKeyDown={goBackOnEscape}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicStartingChips">
          <Form.Label>Starting chips</Form.Label>
          <Form.Control
            ref={startingChipsRef}
            type="number"
            placeholder="Enter starting chips"
            onChange={enableSubmitButtonIfNecessary}
            onKeyDown={goBackOnEscape}
          />
        </Form.Group>
        <Button
          disabled={buttonDisabled}
          variant="primary"
          type="submit"
          ref={submitRef}
          onClick={
            () => {
              const secret = secretRef.current?.value || '';
              const gameName = gameNameRef.current?.value || '';
              const playerName = playerNameRef.current?.value || '';
              const startingChips = parseInt(startingChipsRef.current?.value || '', 10);
              if (secret.length > 0
                && gameName.length > 0
                && playerName.length > 0
                && startingChips > 0) {
                client.connect({ name: playerName }, {
                  secret,
                  name: gameName,
                  startingChips,
                }).catch((reason) => {
                  const message = reason as ErrorMessage;
                  if (!message || typeof message.subtype !== 'string') {
                    setError('Error: An unknown error occurred!');
                  } else {
                    setError(`Error: ${parseError(message.subtype as ErrorType)}`);
                  }
                });
              }
            }
          }
        >
          Join
        </Button>
      </Form>
    </Modal.Body>
  );
}
