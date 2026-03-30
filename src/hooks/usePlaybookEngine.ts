import { useEffect, useRef, useState, useCallback } from 'react';
import type { Playbook, PlaybookEvent } from '../data/playbooks/types';
import type { Severity } from '../data/incidents';
import type { ChatMessage } from '../contexts/types';

interface PlaybookEngineProps {
  sendMessage: (text: string, user: string, id?: string, isBot?: boolean) => void;
  injectLog: (log: string) => void;
  setSeverity: (s: Severity) => void;
  setIsChaos: (on: boolean) => void;
}

export const usePlaybookEngine = ({ sendMessage, injectLog, setSeverity, setIsChaos }: PlaybookEngineProps) => {
  const [activePlaybook, setActivePlaybook] = useState<Playbook | null>(null);
  const activeTimeouts = useRef<number[]>([]);

  const clearTimeouts = useCallback(() => {
    activeTimeouts.current.forEach(window.clearTimeout);
    activeTimeouts.current = [];
  }, []);

  const stopPlaybook = useCallback(() => {
    clearTimeouts();
    setActivePlaybook(null);
    setIsChaos(false);
  }, [clearTimeouts, setIsChaos]);

  const startPlaybook = useCallback((playbook: Playbook) => {
    stopPlaybook();
    setActivePlaybook(playbook);

    playbook.events.forEach((event: PlaybookEvent) => {
      const timeoutId = window.setTimeout(() => {
        switch (event.type) {
          case 'CHAT': {
            const p = event.payload as Omit<ChatMessage, 'time'>;
            sendMessage(p.text, p.user, p.id, p.isBot);
            break;
          }
          case 'LOG':
            injectLog(event.payload as string);
            break;
          case 'SEVERITY':
            setSeverity(event.payload as Severity);
            break;
          case 'CHAOS':
            setIsChaos(event.payload as boolean);
            break;
        }
      }, event.offsetMs);
      
      activeTimeouts.current.push(timeoutId);
    });

    // Automatically clear active playbook state when done
    const maxOffset = playbook.events.length > 0 ? Math.max(...playbook.events.map(e => e.offsetMs)) : 0;
    const finalTimeout = window.setTimeout(() => {
      setActivePlaybook(null);
    }, maxOffset + 100);
    activeTimeouts.current.push(finalTimeout);

  }, [sendMessage, injectLog, setSeverity, setIsChaos, stopPlaybook]);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    activePlaybook,
    startPlaybook,
    stopPlaybook
  };
};
