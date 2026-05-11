import { useEffect, useRef, useState, useCallback } from 'react';
import type { Scenario, ScenarioEvent } from '../data/scenarios/types';
import { type Severity, type Stack } from '../data/incidents';
import type { ChatMessage } from '../contexts/types';
import { getStackBot } from '../utils/team';
import { useIncidentStore } from '../store/useIncidentStore';
import { useDebugLogger } from './useDebugLogger';

interface ScenarioEngineProps {
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean, bio?: string) => void;
  injectLog: (log: string) => void;
  setSeverity: (s: Severity) => void;
  setIsChaos: (on: boolean) => void;
  addBeacon: (id: string) => void;
  triggerApproval: (type?: 'phrase' | 'hold' | 'slider') => void;
  triggerOverride: () => void;
  triggerInterrupt: () => void;
  setObjective: (obj: import('../contexts/types').Objective | null) => void;
  stack: Stack;
  operatorName: string;
  declareIncident: () => void;
}

export const useScenarioEngine = ({ 
  sendMessage, 
  injectLog, 
  setSeverity, 
  setIsChaos, 
  addBeacon, 
  triggerApproval,
  triggerOverride,
  triggerInterrupt,
  setObjective,
  stack, 
  operatorName,
  declareIncident 
}: ScenarioEngineProps) => {
  const { log } = useDebugLogger();
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [currentEventIndex, setCurrentIndex] = useState(-1);
  const [isWaiting, setIsWaiting] = useState(false);
  const isPaused = useIncidentStore(state => state.isPaused);
  
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  }, []);

  const stopScenario = useCallback(() => {
    log('SCENARIO', 'STOP_SCENARIO', activeScenario?.id);
    clearTimer();
    setActiveScenario(null);
    setCurrentIndex(-1);
    setIsWaiting(false);
    setIsChaos(false);
    setObjective(null);
  }, [clearTimer, setIsChaos, setObjective, log, activeScenario]);

  const resumeScenario = useCallback(() => {
    if (!isWaiting) return;
    log('SCENARIO', 'RESUME_SCENARIO', activeScenario?.id);
    setIsWaiting(false);
    setCurrentIndex(prev => prev + 1);
  }, [isWaiting, log, activeScenario]);

  const parseText = useCallback((text: string) => {
    return text
        .replace(/\{\{STACK\}\}/g, stack)
        .replace(/@operator/g, `@${operatorName.split(' ')[0].toLowerCase()}`);
  }, [stack, operatorName]);

  const executeEvent = useCallback((event: ScenarioEvent) => {
    log('SCENARIO', `EXEC_EVENT_${event.type}`, event.payload);
    switch (event.type) {
      case 'CHAT': {
        const p = event.payload as ChatMessage;
        let user = p.user;
        let bio = p.bio;

        if (p.isBot) {
            const bot = getStackBot(stack, p.user);
            user = bot.name;
            bio = bot.bio;
        }

        let text = parseText(p.text);
        if (p.isBot) {
            text = text.replace(/!/g, '.');
        }

        sendMessage(text, user, p.id, p.isBot, bio);
        break;
      }
      case 'LOG':
        injectLog(parseText(event.payload as string));
        break;
      case 'SEVERITY': {
        const sev = event.payload as Severity;
        setSeverity(sev);
        if (sev === 'P0' || sev === 'P1') {
            declareIncident();
        }
        break;
      }
      case 'CHAOS':
        setIsChaos(event.payload as boolean);
        break;
      case 'BEACON':
        addBeacon(event.payload as string);
        break;
      case 'APPROVAL':
        triggerApproval(event.payload as 'phrase' | 'hold' | 'slider' | undefined);
        break;
      case 'OVERRIDE':
        triggerOverride();
        break;
      case 'INTERRUPT':
        triggerInterrupt();
        break;
      case 'OBJECTIVE':
        setObjective(event.payload as import('../contexts/types').Objective);
        break;
      case 'WAIT':
        setIsWaiting(true);
        break;
    }
  }, [sendMessage, injectLog, setSeverity, setIsChaos, addBeacon, triggerApproval, triggerOverride, triggerInterrupt, setObjective, declareIncident, parseText, stack, log]);

  // Main execution loop
  useEffect(() => {
    if (!activeScenario || currentEventIndex < 0 || isWaiting || isPaused) return;

    if (currentEventIndex >= activeScenario.events.length) {
        // Scenario finished
        const timeout = window.setTimeout(() => {
            setActiveScenario(null);
            setObjective(null);
            setCurrentIndex(-1);
        }, 1000);
        return () => window.clearTimeout(timeout);
    }

    const event = activeScenario.events[currentEventIndex];
    const prevEvent = currentEventIndex > 0 ? activeScenario.events[currentEventIndex - 1] : null;
    const delay = event.offsetMs - (prevEvent ? prevEvent.offsetMs : 0);

    timerRef.current = window.setTimeout(() => {
        executeEvent(event);
        if (event.type !== 'WAIT') {
            setCurrentIndex(prev => prev + 1);
        }
    }, Math.max(0, delay));

    return () => clearTimer();
  }, [activeScenario, currentEventIndex, isWaiting, isPaused, executeEvent, clearTimer, setObjective]);

  const startScenario = useCallback((scenario: Scenario) => {
    stopScenario();
    setActiveScenario(scenario);
    setCurrentIndex(0);
  }, [stopScenario]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    activeScenario,
    startScenario,
    stopScenario,
    resumeScenario,
    isWaiting,
    currentEventIndex
  };
};
