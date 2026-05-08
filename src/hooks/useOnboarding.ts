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
        if (incidentStore.onboardingStep === 0) {
            incidentStore.setOnboardingStep(1);
            incidentStore.setTerminalHistory([
                { text: '!!! OPERATOR CERTIFICATION REQUIRED !!!', type: 'error' },
                { text: "TYPE 'aws' TO INITIALIZE PRIMARY STACK.", type: 'system' }
            ]);
        } else {
            if (incidentStore.gameMode === 'ARCADE') {
                incidentStore.setTerminalHistory([{ text: 'CRITICAL_INCIDENT_LOADED... [OK]', type: 'system' }, { text: 'PREPARE FOR MISSION BRIEFING.', type: 'system' }]);
            } else {
                incidentStore.setTerminalHistory([{ text: 'SYSTEM_READY. AWAITING_COMMAND...', type: 'system' }]);
            }
        }
    }
  }, [terminalStore.appState, incidentStore.gameMode, incidentStore.onboardingStep, incidentStore.setOnboardingStep, incidentStore]);

  const lastStepRef = useRef(incidentStore.onboardingStep);
  useEffect(() => {
    if (incidentStore.onboardingStep !== lastStepRef.current) {
        const step = incidentStore.onboardingStep;
        lastStepRef.current = step;
        
        if (step === 2) {
            incidentStore.setTerminalHistory(prev => [...prev, { text: "TYPE 'p3' TO ESCALATE THREAT LEVEL.", type: 'system' }]);
        } else if (step === 3) {
            incidentStore.setTerminalHistory(prev => [...prev, { text: "TYPE 'declare' TO ENGAGE THEATRE.", type: 'system' }]);
        } else if (step === 4) {
            incidentStore.setTerminalHistory(prev => [...prev, { text: "TYPE 'resolve' TO CEASE THEATRE.", type: 'system' }]);
        }
    }
  }, [incidentStore.onboardingStep, incidentStore]);
};
