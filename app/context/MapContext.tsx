"use client";

import { createContext, useContext, useReducer } from 'react';

type State = {
  visibleDevices: string[];
  selectedDevice: string | null;
  showHistory: boolean;
  loading: boolean;
};

type Action =
  | { type: 'TOGGLE_DEVICE'; deviceId: string }
  | { type: 'SELECT_DEVICE'; deviceId: string }
  | { type: 'TOGGLE_HISTORY' }
  | { type: 'SET_LOADING'; loading: boolean };

const initialState: State = {
  visibleDevices: [],
  selectedDevice: "",
  showHistory: false,
  loading: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'TOGGLE_DEVICE':
      return {
        ...state,
        visibleDevices: state.visibleDevices.includes(action.deviceId)
          ? state.visibleDevices.filter(id => id !== action.deviceId)
          : [...state.visibleDevices, action.deviceId]
      };
    case 'SELECT_DEVICE':
      return {
        ...state,
        selectedDevice: action.deviceId,
        showHistory: true
      };
    case 'TOGGLE_HISTORY':
      return { ...state, showHistory: !state.showHistory };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    default:
      return state;
  }
};

const MapContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <MapContext.Provider value={{ state, dispatch }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);
