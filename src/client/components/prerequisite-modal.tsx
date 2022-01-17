import * as React from 'react';
import { Modal } from 'react-bootstrap';
import EnumRouter from './enum-router';
import CreateGame from './forms/create-game';
import JoinGame from './forms/join-game';
import Initial from './forms/initial';
import Client from '../client';

enum ViewMode {
  ViewModeInitial,
  ViewModeJoinGame,
  ViewModeCreateGame,
}

interface ModalProps {
  client: Client;
}

export default function PrerequisiteModal({
  client,
}: ModalProps) {
  const [mode, setMode] = React.useState(ViewMode.ViewModeInitial);

  return (
    <Modal show backdrop="static" keyboard={false} centered>
      <EnumRouter state={mode}>
        <EnumRouter.Route stateKey={ViewMode.ViewModeInitial}>
          <Initial
            joinGame={() => setMode(ViewMode.ViewModeJoinGame)}
            createGame={() => setMode(ViewMode.ViewModeCreateGame)}
          />
        </EnumRouter.Route>
        <EnumRouter.Route stateKey={ViewMode.ViewModeJoinGame}>
          <JoinGame client={client} />
        </EnumRouter.Route>
        <EnumRouter.Route stateKey={ViewMode.ViewModeCreateGame}>
          <CreateGame client={client} />
        </EnumRouter.Route>
      </EnumRouter>
    </Modal>
  );
}
