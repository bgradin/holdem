import * as React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import Client from '../../../client';

interface FormProps {
  client: Client;
}

export default function CreateGame({
  client,
}: FormProps) {
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  const secretRef = React.useRef<HTMLInputElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const submitRef = React.useRef<HTMLButtonElement>(null);

  const enableSubmitButtonIfNecessary = () => {
    const allValuesProvided = ([
      secretRef,
      nameRef,
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
        <Form.Group className="mb-3" controlId="formBasicName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            ref={nameRef}
            type="text"
            placeholder="Enter name"
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
              const name = nameRef.current?.value || '';
              if (secret.length > 0 && name.length > 0) {
                client.connect({ name }, { secret });
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
