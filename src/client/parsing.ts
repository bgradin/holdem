import { ConnectionStatus } from './client';
import { ErrorType } from '../shared/message';

export function parseCloseEvent(event: CloseEvent): string {
  switch (event.code) {
    case 1000:
      return 'Normal closure, meaning that the purpose for which the connection was established has been fulfilled.';
    case 1001:
      return 'An endpoint is "going away", such as a server going down or a browser having navigated away from a page.';
    case 1002:
      return 'An endpoint is terminating the connection due to a protocol error';
    case 1003:
      return 'An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).';
    case 1004:
      return 'Reserved. The specific meaning might be defined in the future.';
    case 1005:
      return 'No status code was actually present.';
    case 1006:
      return 'The connection was closed abnormally, e.g., without sending or receiving a Close control frame';
    case 1007:
      return 'An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [https://www.rfc-editor.org/rfc/rfc3629] data within a text message).';
    case 1008:
      return 'An endpoint is terminating the connection because it has received a message that "violates its policy". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.';
    case 1009:
      return 'An endpoint is terminating the connection because it has received a message that is too big for it to process.';
    case 1010:
      return 'An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn\'t return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reaso';
    case 1011:
      return 'A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.';
    case 1015:
      return 'The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can\'t be verified).';
    default:
      return 'Unknown reason';
  }
}

export function parseError(errorSubtype?: ErrorType) {
  switch (errorSubtype) {
    case ErrorType.ALREADY_IN_GAME:
      return 'Already in game!';
    case ErrorType.GAME_NOT_FOUND:
      return 'Game not found!';
    case ErrorType.INVALID_DATA:
      return 'Invalid data sent to server!';
    case ErrorType.PLAYER_MUST_REGISTER:
      return 'Player must register!';
    case ErrorType.UNEXPECTED_CONFIRMATION_DATA:
      return 'Unexpected confirmation data from server!';
    case ErrorType.GAME_IS_FULL:
      return 'Game is full!';
    default:
      return 'An unexpected error occurred!';
  }
}

export function parseConnectionLabel(status: ConnectionStatus) {
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
