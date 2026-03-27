import { createContext } from 'react';
import type { TerminalContextType, IncidentContextType, AudioContextType } from './types';

export const TerminalContext = createContext<TerminalContextType | undefined>(undefined);
export const IncidentContext = createContext<IncidentContextType | undefined>(undefined);
export const AudioContextInstance = createContext<AudioContextType | undefined>(undefined);
