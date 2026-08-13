'use client';

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { JourneyState, JourneyAction } from '@/app/config/types';

const initialState: JourneyState = {
  stage: 'loading',
  // Preview default — replaced by the guest's own pick in the name modal.
  side: 'groom',
  eventIdx: 0,
  previousEventIdx: 0,
  guestName: 'Friend',
  cameraMode: 'guided',
  soundOn: true,
  panelOpen: true,
};

function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.stage };
    case 'SET_SIDE':
      // Sides can have different event lists — restart at the entrance.
      return { ...state, side: action.side, eventIdx: 0, previousEventIdx: 0 };
    case 'SET_EVENT':
      return { ...state, previousEventIdx: state.eventIdx, eventIdx: action.idx };
    case 'SET_GUEST':
      return { ...state, guestName: action.name || 'Friend' };
    case 'SET_CAMERA_MODE':
      return { ...state, cameraMode: action.mode };
    case 'TOGGLE_SOUND':
      return { ...state, soundOn: !state.soundOn };
    case 'SET_PANEL_OPEN':
      return { ...state, panelOpen: action.open };
    case 'DRIVE_TO':
      return { ...state, stage: 'driving', cameraMode: 'guided', panelOpen: false, previousEventIdx: state.eventIdx, eventIdx: action.idx };
    case 'ARRIVE':
      return { ...state, stage: 'event', cameraMode: 'guided', panelOpen: true, previousEventIdx: state.eventIdx };
    default:
      return state;
  }
}

const JourneyContext = createContext<JourneyState>(initialState);
const JourneyDispatchContext = createContext<Dispatch<JourneyAction>>(() => {});

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journeyReducer, initialState);
  return (
    <JourneyContext.Provider value={state}>
      <JourneyDispatchContext.Provider value={dispatch}>
        {children}
      </JourneyDispatchContext.Provider>
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  return useContext(JourneyContext);
}

export function useJourneyDispatch() {
  return useContext(JourneyDispatchContext);
}
