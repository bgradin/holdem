import * as React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import Client from '../../client';

interface FormProps {
  client: Client;
}

export default function CreateGame({
  client,
}: FormProps) {
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const secretRef = React.useRef<HTMLInputElement>(null);
  const playerNameRef = React.useRef<HTMLInputElement>(null);
  const gameNameRef = React.useRef<HTMLInputElement>(null);
  const submitRef = React.useRef<HTMLButtonElement>(null);

  const enableSubmitButtonIfNecessary = () => {
    const allValuesProvided = ([
      secretRef,
      gameNameRef,
      playerNameRef,
    ] as React.RefObject<HTMLInputElement>[])
      .map((ref) => ref.current?.value || '')
      .every((x) => x.length > 0);
    setButtonDisabled(!allValuesProvided);
  };

  return (
    <Modal.Body>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group className="mb-3" controlId="formBasicSecret">
          <Form.Label>Server Secret</Form.Label>
          <Form.Control
            ref={secretRef}
            type="password"
            placeholder="Enter server secret"
            autoFocus
            onChange={enableSubmitButtonIfNecessary}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicGameName">
          <Form.Label>Game Name</Form.Label>
          <Form.Control
            ref={gameNameRef}
            type="text"
            placeholder="Enter game name"
            onChange={enableSubmitButtonIfNecessary}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPlayerName">
          <Form.Label>Player Name</Form.Label>
          <Form.Control
            ref={playerNameRef}
            type="text"
            placeholder="Enter player name"
            onChange={enableSubmitButtonIfNecessary}
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
              if (secret.length > 0
                && gameName.length > 0
                && playerName.length > 0) {
                client.connect({ name: playerName }, { secret, name: gameName });
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
