import * as React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import Client from '../../client';

interface FormProps {
  client: Client;
}

export default function JoinGame({
  client,
}: FormProps) {
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const gameIdRef = React.useRef<HTMLInputElement>(null);
  const submitRef = React.useRef<HTMLButtonElement>(null);

  const enableSubmitButtonIfNecessary = () => {
    const allValuesProvided = ([
      nameRef,
      gameIdRef,
    ] as React.RefObject<HTMLInputElement>[])
      .map((ref) => ref.current?.value || '')
      .every((x) => x.length > 0);
    setButtonDisabled(!allValuesProvided);
  };

  return (
    <Modal.Body>
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group className="mb-3" controlId="formBasicName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            ref={nameRef}
            type="text"
            placeholder="Enter name"
            autoFocus
            onChange={enableSubmitButtonIfNecessary}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicGameId">
          <Form.Label>Game ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Game ID"
            ref={gameIdRef}
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
              const name = nameRef.current?.value || '';
              const gameId = gameIdRef.current?.value || '';
              if (name.length > 0 && gameId.length > 0) {
                client.connect({ name }, gameId);
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
