import { useEffect } from 'react';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';
import { getRandomExecutive } from '../utils/team';

interface UseChaosEventsProps {
    sendMessage: (text: string, user: string, id?: string, isBot?: boolean, bioOverride?: string) => void;
}

export const useChaosEvents = ({ sendMessage }: UseChaosEventsProps) => {
  const incidentStore = useIncidentStore();
  const terminalStore = useTerminalStore();

  // Chaos Loop
  useEffect(() => {
    if (!incidentStore.isDeclared || incidentStore.isPaused) return;

    const interval = setInterval(() => {
        const threshold = incidentStore.severity === 'P0' ? 0.4 : incidentStore.severity === 'P1' ? 0.6 : 0.8;
        const roll = Math.random();

        if (roll > threshold) {
            incidentStore.setApproval({
                id: Math.random().toString(36).substring(2, 9),
                type: 'phrase',
                message: 'AUTHORIZE INFRASTRUCTURE ROTATION?',
                phrase: 'rotate-now'
            });
        } else if (roll > threshold - 0.1 && incidentStore.activeApproval) {
            incidentStore.setOverride({
                code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                message: 'CRITICAL SYSTEM OVERRIDE REQUIRED'
            });
        } else if (roll < threshold - 0.15 && !incidentStore.activeInterruption) {
            // Trigger Executive Interruption
            const exec = getRandomExecutive();
            const duration = 60 + Math.floor(Math.random() * 31); // 60-90s
            const penalty = 150000 + Math.floor(Math.random() * 50000);
            
            incidentStore.setInterruption({
                id: Math.random().toString(36).substring(2, 9),
                execName: exec.name,
                deadline: Date.now() + (duration * 1000),
                penalty
            });

            const userTag = `@${terminalStore.operatorName.split(' ')[0].toLowerCase()}`;
            sendMessage(`${userTag} I need a SITREP immediately! The board is asking questions.`, exec.name, undefined, false, exec.role.toUpperCase());
        }
    }, 15000);

    return () => clearInterval(interval);
  }, [incidentStore.isDeclared, incidentStore.isPaused, incidentStore.severity, incidentStore.activeApproval, incidentStore.activeInterruption, terminalStore.operatorName, sendMessage, incidentStore]);

  // Interruption Countdown Handler
  useEffect(() => {
    if (!incidentStore.activeInterruption || incidentStore.isPaused) return;

    const checkInterval = setInterval(() => {
        const now = Date.now();
        if (now >= incidentStore.activeInterruption!.deadline) {
            const { penalty, execName } = incidentStore.activeInterruption!;
            incidentStore.setMoneyLost(prev => prev + penalty);
            incidentStore.deductStrike();
            incidentStore.addTerminalLine({ 
                text: `ALERT: EXECUTIVE INTERRUPTION TIMEOUT (${execName}) - £${penalty.toLocaleString()} PENALTY | STRIKE_DEDUCTED`, 
                type: 'error' 
            });
            incidentStore.setInterruption(null);
        }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [incidentStore.activeInterruption, incidentStore.isPaused, incidentStore]);

  // P0 Sustained Outage Tracking (3 mins = 180s)
  useEffect(() => {
    if (incidentStore.severity !== 'P0' || !incidentStore.isDeclared || incidentStore.isPaused) {
        if (incidentStore.timeInP0 !== 0) incidentStore.setTimeInP0(0);
        return;
    }

    const interval = setInterval(() => {
        incidentStore.setTimeInP0(prev => {
            const next = prev + 1;
            if (next >= 180) {
                incidentStore.deductStrike();
                incidentStore.addTerminalLine({ text: 'CRITICAL: SUSTAINED P0 OUTAGE PENALTY. STRIKE DEDUCTED.', type: 'error' });
                return 0;
            }
            return next;
        });
    }, 1000);

    return () => clearInterval(interval);
  }, [incidentStore.severity, incidentStore.isDeclared, incidentStore.isPaused, incidentStore]);

  // Game Over Transition
  useEffect(() => {
    if (incidentStore.strikes <= 0 && incidentStore.gameMode === 'ARCADE' && terminalStore.appState !== 'TERMINATED') {
        terminalStore.setAppState('TERMINATED');
    }
  }, [incidentStore.strikes, incidentStore.gameMode, terminalStore.appState, terminalStore.setAppState, terminalStore, incidentStore]);
};
