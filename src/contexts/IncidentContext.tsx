import React, { useState, useEffect, useCallback } from 'react';
import { generateExcuse, generateAIExcuse, type Severity, type Stack } from '../data/excuses';
import { IncidentContext } from './instances';

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const [severity, setInternalSeverity] = useState<Severity>('NOMINAL');
  const [stack, setStack] = useState<Stack>('AWS');
  const [incidentReport, setInternalIncidentReport] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [status, setStatus] = useState('SYSTEMS NOMINAL');
  const [moneyLost, setMoneyLost] = useState(0);
  const [isSlowBurn, setIsSlowBurn] = useState(false);
  const [slowBurnCountdown, setSlowBurnCountdown] = useState(30);
  
  const [totalSaved, setTotalSaved] = useState(() => {
    return parseInt(localStorage.getItem('saved_minutes') || '0');
  });

  useEffect(() => {
    localStorage.setItem('saved_minutes', totalSaved.toString());
  }, [totalSaved]);

  const setSeverity = useCallback((s: Severity) => {
    setInternalSeverity(s);
    setIsSlowBurn(false);
    setInternalIncidentReport('');
    if (s === 'NOMINAL') {
        setMoneyLost(0);
        setStatus('SYSTEMS NOMINAL');
    } else if (s === 'P3') setStatus('MINOR DEGRADATION');
    else if (s === 'P1') setStatus('CRITICAL ALERT');
    else if (s === 'P0') setStatus('BREACH DETECTED');
  }, []);

  const declareIncident = useCallback(async (playAlert: (s: Severity) => void) => {
    if (severity === 'NOMINAL') return;
    setStatus('BREACH DETECTED');
    playAlert(severity);
    
    const apiKey = localStorage.getItem('gemini_api_key');
    let result;
    if (apiKey) {
        result = await generateAIExcuse(severity, stack, apiKey);
    } else {
        result = generateExcuse(severity, stack);
    }
    
    setInternalIncidentReport(result.text);
    setTicketId(result.ticketId);
    setTotalSaved(prev => prev + result.timeSaved);
    setIsSlowBurn(false);
  }, [severity, stack]);

  const ceaseTheatre = useCallback(() => {
    setInternalSeverity('NOMINAL');
    setInternalIncidentReport('');
    setTicketId('');
    setMoneyLost(0);
    setIsSlowBurn(false);
    setStatus('SYSTEMS NOMINAL');
  }, []);

  // Burn rate logic
  useEffect(() => {
    if (severity === 'NOMINAL') return;
    const rates = { NOMINAL: 0, P3: 0.08, P1: 0.83, P0: 8.33 };
    const rate = rates[severity as keyof typeof rates];
    const interval = setInterval(() => {
      setMoneyLost(prev => prev + rate);
    }, 1000);
    return () => clearInterval(interval);
  }, [severity]);

  // Slow burn logic
  useEffect(() => {
    let countdownInterval: number | undefined;
    let p1Timer: number | undefined;
    let p0Timer: number | undefined;
    
    if (isSlowBurn) {
      setTimeout(() => {
          setInternalSeverity('P3');
          setStatus('MINOR DEGRADATION');
          setSlowBurnCountdown(30);
      }, 0);
      
      countdownInterval = window.setInterval(() => {
        setSlowBurnCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      p1Timer = window.setTimeout(() => {
        setInternalSeverity('P1');
        setStatus('CRITICAL ALERT');
      }, 10000); 

      p0Timer = window.setTimeout(() => {
        setInternalSeverity('P0');
        setStatus('BREACH DETECTED');
      }, 25000); 

      return () => {
        window.clearInterval(countdownInterval);
        window.clearTimeout(p1Timer);
        window.clearTimeout(p0Timer);
      };
    }
  }, [isSlowBurn]);

  return (
    <IncidentContext.Provider value={{
      severity,
      stack,
      incidentReport,
      ticketId,
      status,
      moneyLost,
      isSlowBurn,
      slowBurnCountdown,
      totalSaved,
      setSeverity,
      setStack,
      setIncidentReport: setInternalIncidentReport,
      setIsSlowBurn,
      declareIncident,
      ceaseTheatre
    }}>
      {children}
    </IncidentContext.Provider>
  );
}
export default IncidentProvider;
