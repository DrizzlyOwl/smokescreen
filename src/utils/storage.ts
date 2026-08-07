// src/utils/storage.ts
import { ErrorHandler } from './errorHandler';

/**
 * Type representing JSON-serializable values that can be stored in localStorage.
 * Uses `unknown` for flexibility while maintaining type safety at call sites.
 */
export type StorageValue = unknown;

/**
 * Type representing the centralized state object stored in localStorage.
 */
export type StorageState = Record<string, StorageValue>;

export interface SavedGameSession {
  operatorName: string;
  timestamp: number;
  incidentState: StorageState;
}

export const FIELDS_TO_SAVE = [
  'gameMode',
  'selectedPlaybookId',
  'severity',
  'stack',
  'incidentReport',
  'ticketId',
  'status',
  'moneyLost',
  'isSlowBurn',
  'isChaos',
  'slowBurnCountdown',
  'mitigationScore',
  'lastScoreEarned',
  'mitigationCount',
  'isDeclared',
  'isDeployStabilized',
  'activePods',
  'serviceHealth',
  'strikes',
  'timeInP0',
  'unreadChat',
  'terminalHistory',
  'view',
  'activeApproval',
  'activeOverride',
  'activeInterruption',
  'diagnosticToken',
  'activeObjective'
] as const;

const STATE_KEY = 'smokescreen_state';

/**
 * Retrieves the entire centralized state object from localStorage.
 */
export function getFullState(): StorageState {
  try {
    const item = localStorage.getItem(STATE_KEY);
    if (!item) return {};
    return JSON.parse(item) as StorageState;
  } catch (error) {
    ErrorHandler.handle(error, 'STORAGE:GET_FULL_STATE');
    return {};
  }
}

/**
 * Saves the entire centralized state object to localStorage.
 */
export function setFullState(state: StorageState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    ErrorHandler.handle(error, 'STORAGE:SET_FULL_STATE');
  }
}

/**
 * Safely retrieves and parses an item from the centralized state.
 */
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const state = getFullState();
    const value = state[key];
    if (value === undefined || value === null) {
      return fallback;
    }
    return value as T;
  } catch (error) {
    ErrorHandler.handle(error, `STORAGE:GET_KEY:${key}`);
    return fallback;
  }
}

/**
 * Safely writes an item to the centralized state.
 */
export function safeLocalStorageSet<T>(key: string, value: T): void {
  try {
    const state = getFullState();
    state[key] = value;
    setFullState(state);
  } catch (error) {
    ErrorHandler.handle(error, `STORAGE:SET_KEY:${key}`);
  }
}

/**
 * Safely removes an item from the centralized state.
 */
export function safeLocalStorageRemove(key: string): void {
  try {
    const state = getFullState();
    delete state[key];
    setFullState(state);
  } catch (error) {
    ErrorHandler.handle(error, `STORAGE:REMOVE_KEY:${key}`);
  }
}

export function saveGameSession(operatorName: string, state: StorageState): void {
  try {
    const incidentState: StorageState = {};
    FIELDS_TO_SAVE.forEach(key => {
      if (state[key] !== undefined) {
        incidentState[key] = state[key];
      }
    });

    const session: SavedGameSession = {
      operatorName,
      timestamp: Date.now(),
      incidentState
    };
    safeLocalStorageSet('smokescreen_saved_game', session);
    console.log(`[SMOKESCREEN_OS: STORAGE] Game session auto-saved successfully for operator ${operatorName}.`);
  } catch (error) {
    ErrorHandler.handle(error, 'STORAGE:AUTO_SAVE');
  }
}

export function clearGameSession(): void {
  try {
    safeLocalStorageRemove('smokescreen_saved_game');
    console.log('[SMOKESCREEN_OS: STORAGE] Game session cleared successfully.');
  } catch (error) {
    ErrorHandler.handle(error, 'STORAGE:CLEAR_SESSION');
  }
}

export function getSavedGameSession(): SavedGameSession | null {
  try {
    return safeLocalStorageGet<SavedGameSession | null>('smokescreen_saved_game', null);
  } catch (error) {
    ErrorHandler.handle(error, 'STORAGE:LOAD_SESSION');
    return null;
  }
}


