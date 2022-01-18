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
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  });

  return (
    <Modal.Body>
      <Stack gap={2} className="col-md-5 mx-auto">
        <Button
          variant="primary"
          size="lg"
          ref={buttonRef}
          onClick={joinGame}
          onKeyDown={(event) => {
            if (event.key === 'Enter'
              || event.code === 'Enter'
              || event.which === 13
              || event.keyCode === 13) {
              joinGame();
            }
          }}
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
