import React, { useState, useEffect } from 'react';
import { BatteryIcon, NetworkIcon } from './Icons';
import { useClientStats } from '../hooks/useClientStats';
import { useIncidentStore, type GameMode } from '../store/useIncidentStore';
import type { Severity, Stack } from '../data/incidents';
import type { Objective } from '../contexts/types';
import '../styles/SystemControlCluster.scss';

interface StatusBarProps {
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  isEcoMode: boolean;
  setIsEcoMode: (on: boolean) => void;
  gameMode: GameMode;
  activeObjective: Objective | null;
  playbookProgress?: { current: number, total: number };
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  severity, 
  stack, 
  isDeclared, 
  isEcoMode, 
  setIsEcoMode,
  gameMode,
  activeObjective,
  playbookProgress
}) => {
  const { fps, batteryLevel, isCharging, connectionType, downlink } = useClientStats();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const mitigationScore = useIncidentStore(state => state.mitigationScore);
  const isDeployStabilized = useIncidentStore(state => state.isDeployStabilized);
  const strikes = useIncidentStore(state => state.strikes);
  const isPaused = useIncidentStore(state => state.isPaused);
  const setIsPaused = useIncidentStore(state => state.setIsPaused);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getBatteryLevel = (): 'critical' | 'low' | 'medium' | 'high' | 'plugged' => {
    if (isCharging) return 'plugged';
    if (batteryLevel === null) return 'high';
    if (batteryLevel > 80) return 'high';
    if (batteryLevel > 30) return 'medium';
    if (batteryLevel > 10) return 'low';
    return 'critical';
  };

  return (
    <div className={`status-bar status-bar--${severity.toLowerCase()} ${isDeclared ? 'status-bar--declared' : ''}`}>
        <div className="status-line">
            <div className="status-line__left">
                <span className="status-line__os-ver">SMOKESCREEN_OS v6.0.4</span>
                <span className="separator">|</span>
                <span className="status-line__status">{severity} // {stack}</span>
                <span className="separator">|</span>
                <span className="status-line__score">SCORE: {mitigationScore}</span>
                {gameMode === 'ARCADE' && (
                    <>
                        <span className="separator">|</span>
                        <span className="status-line__strikes" title="System Integrity Strikes">
                            INTEGRITY: [{'█'.repeat(strikes)}{'░'.repeat(Math.max(0, 5 - strikes))}]
                        </span>
                    </>
                )}
                {!isDeployStabilized && isDeclared && (
                    <span className="unstable-tag">UNSTABLE</span>
                )}
            </div>

            <div className="status-line__center">
                {activeObjective && (
                    <div className={`active-objective active-objective--${activeObjective.status}`}>
                        <span className="active-objective__label">OBJ:</span>
                        <span className="active-objective__title">{activeObjective.title}</span>
                    </div>
                )}
                {gameMode === 'ARCADE' && playbookProgress && playbookProgress.total > 0 && (
                    <div className="playbook-progress">
                        <span className="playbook-progress__label">PROGRESS:</span>
                        <div className="playbook-progress__bar">
                            {Array.from({ length: playbookProgress.total }).map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`playbook-progress__segment ${i < playbookProgress.current ? 'playbook-progress__segment--filled' : ''}`} 
                                />
                            ))}
                        </div>
                        <span className="playbook-progress__count">{playbookProgress.current}/{playbookProgress.total}</span>
                    </div>
                )}
            </div>

            <div className="status-line__right">
                <div 
                    className={`status-line__pause ${isPaused ? 'paused' : ''}`}
                    onClick={() => setIsPaused(!isPaused)}
                    title={isPaused ? "Resume Simulation" : "Pause Simulation"}
                >
                    {isPaused ? '[RESUME]' : '[PAUSE]'}
                </div>
                <span className="separator">|</span>
                <div className="status-line__network">
                    <NetworkIcon connectionType={connectionType} downlink={downlink} />
                </div>
                <span className="separator">|</span>
                <span className="status-line__fps">{fps} FPS</span>
                <span className="separator">|</span>
                <div 
                   className="status-line__battery" 
                   onClick={() => setIsEcoMode(!isEcoMode)}
                   title="Toggle Eco Mode"
                >
                    <BatteryIcon level={getBatteryLevel()} />
                    {batteryLevel !== null ? `${batteryLevel}%` : 'AC'}
                </div>
                <span className="separator">|</span>
                <span className="status-line__time">{time}</span>
            </div>
        </div>
    </div>
  );
};
