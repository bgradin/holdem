import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  Modal,
} from 'react-bootstrap';
import Client from '../../client';
import { ErrorMessage } from '../../message';
import { parseError } from '../../parsing';

interface FormProps {
  client: Client;
  goBack: () => void;
}

export default function JoinGame({
  client,
  goBack,
}: FormProps) {
  const [buttonDisabled, setButtonDisabled] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const nameRef = React.useRef<HTMLInputElement>(null);
  const gameIdRef = React.useRef<HTMLInputElement>(null);
  const submitRef = React.useRef<HTMLButtonElement>(null);

  const goBackOnEscape = <T extends unknown>(event: React.KeyboardEvent<T>) => {
    if (event.key === 'Escape'
      || event.code === 'Escape'
      || event.which === 27
      || event.keyCode === 27) {
      goBack();
    }
  };

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
      {
        error && <Alert variant="danger">{error}</Alert>
      }
      <Form onSubmit={(e) => e.preventDefault()}>
        <Form.Group className="mb-3" controlId="formBasicName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            ref={nameRef}
            type="text"
            placeholder="Enter name"
            autoFocus
            onChange={enableSubmitButtonIfNecessary}
            onKeyDown={goBackOnEscape}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicGameId">
          <Form.Label>Game ID</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Game ID"
            ref={gameIdRef}
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
              const name = nameRef.current?.value || '';
              const gameId = gameIdRef.current?.value || '';
              if (name.length > 0 && gameId.length > 0) {
                client.connect({ name }, gameId).catch((reason) => {
                  const message = reason as ErrorMessage;
                  if (!message || typeof message.subtype !== 'string') {
                    setError('Error: An unknown error occurred!');
                  } else {
                    setError(`Error: ${parseError(message.subtype)}`);
                  }
                });
              }
            }
          }
          onKeyDown={goBackOnEscape}
        >
          Join
        </Button>
      </Form>
    </Modal.Body>
  );
}
