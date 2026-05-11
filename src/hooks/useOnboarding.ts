import { useEffect, useRef } from 'react';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';

export const useOnboarding = () => {
  const incidentStore = useIncidentStore();
  const terminalStore = useTerminalStore();

  const initialReadySet = useRef(false);
  useEffect(() => {
    if (terminalStore.appState === 'READY' && !initialReadySet.current) {
        initialReadySet.current = true;
        
        if (incidentStore.gameMode === 'ARCADE') {
            incidentStore.setTerminalHistory([
                { text: '--- ARCADE_MODE_ACTIVE ---', type: 'system' },
                { text: '!!! OPERATOR_CERTIFICATION_REQUIRED !!!', type: 'error' },
                { text: "TYPE 'playbook start l0-certification' TO BEGIN TRAINING.", type: 'system' }
            ]);
        } else {
            incidentStore.setTerminalHistory([
                { text: '--- SANDBOX_MODE_ACTIVE ---', type: 'system' },
                { text: 'SYSTEM_READY. UNRESTRICTED_ACCESS_GRANTED.', type: 'system' },
                { text: "TYPE 'help' FOR SYSTEM_MANUAL.", type: 'system' }
            ]);
            // Ensure Sandbox users aren't blocked by legacy onboarding logic
            incidentStore.setOnboardingStep(-1);
        }
    }
  }, [terminalStore.appState, incidentStore.gameMode, incidentStore.setTerminalHistory, incidentStore.setOnboardingStep, incidentStore]);
};
