import { useEffect, useRef, useState, useCallback } from 'react';
import type { Playbook, PlaybookEvent } from '../data/playbooks/types';
import { type Severity, type Stack } from '../data/incidents';
import type { ChatMessage } from '../contexts/types';
import { getStackBot } from '../utils/team';
import { useIncidentStore } from '../store/useIncidentStore';
import { useDebugLogger } from './useDebugLogger';

interface PlaybookEngineProps {
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

export const usePlaybookEngine = ({ 
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
}: PlaybookEngineProps) => {
  const { log } = useDebugLogger();
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
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

  const stopPlaybook = useCallback(() => {
    log('PLAYBOOK', 'STOP_PLAYBOOK', activePlaybook?.id);
    clearTimer();
    setActivePlaybook(null);
    setCurrentIndex(-1);
    setIsWaiting(false);
    setIsChaos(false);
    setObjective(null);
  }, [clearTimer, setIsChaos, setObjective, log, activePlaybook]);

  const resumePlaybook = useCallback(() => {
    if (!isWaiting) return;
    log('PLAYBOOK', 'RESUME_PLAYBOOK', activePlaybook?.id);
    setIsWaiting(false);
    setCurrentIndex(prev => prev + 1);
  }, [isWaiting, log, activePlaybook]);

  const parseText = useCallback((text: string) => {
    return text
        .replace(/\{\{STACK\}\}/g, stack)
        .replace(/@operator/g, `@${operatorName.split(' ')[0].toLowerCase()}`);
  }, [stack, operatorName]);

  const executeEvent = useCallback((event: PlaybookEvent) => {
    log('PLAYBOOK', `EXEC_EVENT_${event.type}`, event.payload);
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
    if (!activePlaybook || currentEventIndex < 0 || isWaiting || isPaused) return;

    if (currentEventIndex >= activePlaybook.events.length) {
        // Playbook finished
        const timeout = window.setTimeout(() => {
            setActivePlaybook(null);
            setObjective(null);
            setCurrentIndex(-1);
        }, 1000);
        return () => window.clearTimeout(timeout);
    }

    const event = activePlaybook.events[currentEventIndex];
    const prevEvent = currentEventIndex > 0 ? activePlaybook.events[currentEventIndex - 1] : null;
    const delay = event.offsetMs - (prevEvent ? prevEvent.offsetMs : 0);

    timerRef.current = window.setTimeout(() => {
        executeEvent(event);
        if (event.type !== 'WAIT') {
            setCurrentIndex(prev => prev + 1);
        }
    }, Math.max(0, delay));

    return () => clearTimer();
  }, [activePlaybook, currentEventIndex, isWaiting, isPaused, executeEvent, clearTimer, setObjective]);

  const startPlaybook = useCallback((playbook: Playbook) => {
    stopPlaybook();
    setActivePlaybook(playbook);
    setCurrentIndex(0);
  }, [stopPlaybook]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    activePlaybook,
    startPlaybook,
    stopPlaybook,
    resumePlaybook,
    isWaiting,
    currentEventIndex
  };
};
