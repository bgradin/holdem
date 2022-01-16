import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import ConnectionStatus from './connection';
import store, { updateConnectionStatus, useAppDispatch, useAppSelector } from './store';

function getConnectionLabel(status: ConnectionStatus) {
  switch (status) {
    case ConnectionStatus.Connected:
      return 'Connected!';
    case ConnectionStatus.Connecting:
      return 'Connecting...';
    case ConnectionStatus.Disconnected:
      return 'Disconnected';
    default:
      return '';
  }
}

class Socket {
  initialized = false;

  #socket?: WebSocket;

  close() {
    this.#socket?.close();
    this.initialized = false;
  }

  connect(callbacks: { onOpen: () => void, onMessage: (message: any) => void}) {
    this.#socket = new WebSocket('ws://localhost:3030');
    this.#socket.onopen = () => {
      callbacks.onOpen();
      this.#socket?.send(JSON.stringify({
        type: 'identify',
        data: {
          name: 'Brian',
        },
      }));
    };
    this.#socket.onmessage = (event: MessageEvent<any>) => {
      callbacks.onMessage(event.data);
    };
    this.initialized = true;
  }

  createGame() {
    this.#socket?.send(JSON.stringify({
      type: 'create',
      data: {
        secret: 'secret',
      },
    }));
  }
}

const socket = new Socket();
let id: string;

function ConnectionStatusLabel() {
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector((state) => state.connectionStatus).value;

  const label = id || getConnectionLabel(connectionStatus);

  if (!socket.initialized) {
    socket.connect({
      onOpen: () => {
        dispatch(updateConnectionStatus(ConnectionStatus.Connecting));
      },
      onMessage: (data) => {
        const json = JSON.parse(data);
        if (typeof json !== 'object' || typeof json.type !== 'string') {
          console.error('Invalid data received!');
        } else if (json.type === 'error') {
          dispatch(updateConnectionStatus(ConnectionStatus.Error));
        } else if (json.type === 'confirm') {
          if (typeof json.data === 'object' && json.data.id) {
            id = json.data.id;
          } else {
            socket.createGame();
          }

          dispatch(updateConnectionStatus(ConnectionStatus.Connected));
        }
      },
    });
  }

  return (
    <h1>
      { label }
    </h1>
  );
}

ReactDOM.render(
  <Provider store={store}>
    <ConnectionStatusLabel />
  </Provider>,
  document.getElementById('root'),
);
