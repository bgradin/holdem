import * as React from 'react';
import { Button, Modal, Stack } from 'react-bootstrap';

interface FormProps {
  joinGame: () => void,
  createGame: () => void,
}

export default function Initial({
  joinGame,
  createGame,
}: FormProps) {
  return (
    <Modal.Body>
      <Stack gap={2} className="col-md-5 mx-auto">
        <Button
          variant="primary"
          size="lg"
          onClick={joinGame}
        >
          Join Game
        </Button>
        <Button
          variant="outline-primary"
          size="lg"
          onClick={createGame}
        >
          Create Game
        </Button>
      </Stack>
    </Modal.Body>
  );
}
