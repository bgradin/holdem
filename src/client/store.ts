import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { configureStore, createAction, createReducer } from '@reduxjs/toolkit';
import ConnectionStatus from './connection';

interface ConnectionStatusState {
  value: ConnectionStatus;
}

export const updateConnectionStatus = createAction<ConnectionStatus>('connectionStatus/update');
const initialConnectionStatus = { value: ConnectionStatus.Disconnected } as ConnectionStatusState;
const connectionStatusReducer = createReducer(initialConnectionStatus, (builder) => {
  builder.addCase(updateConnectionStatus, (state, action) => ({ ...state, value: action.payload }));
});

const store = configureStore({
  reducer: {
    connectionStatus: connectionStatusReducer,
  },
});

export const useAppSelector: TypedUseSelectorHook<ReturnType<typeof store.getState>> = useSelector;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();

export default store;
