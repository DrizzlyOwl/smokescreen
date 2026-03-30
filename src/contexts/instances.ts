import { createContext } from 'react';
import type { TerminalContextType, IncidentContextType, AudioContextType, SyncContextType } from './types';

export const TerminalContext = createContext<TerminalContextType | undefined>(undefined);
export const IncidentContext = createContext<IncidentContextType | undefined>(undefined);
export const AudioContextInstance = createContext<AudioContextType | undefined>(undefined);
export const SyncContextInstance = createContext<SyncContextType | undefined>(undefined);
