import React, { useState, useEffect, useRef } from 'react';
import { BatteryIcon } from './Icons';
import { useClientStats } from '../hooks/useClientStats';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';

export const StatusBar: React.FC = () => {
  const severity = useIncidentStore(state => state.severity);
  const stack = useIncidentStore(state => state.stack);
  const status = useIncidentStore(state => state.status);
  const isChaos = useIncidentStore(state => state.isChaos);
  
  const isEcoMode = useTerminalStore(state => state.isEcoMode);
  const setIsEcoMode = useTerminalStore(state => state.setIsEcoMode);

  const [fps, setFps] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    lastTime.current = performance.now();
    let frameId: number;
    const calculateFps = (time: number) => {
      frameCount.current++;
      if (time >= lastTime.current + 1000) {
        setFps(Math.round((frameCount.current * 1000) / (time - lastTime.current)));
        lastTime.current = time;
        frameCount.current = 0;
      }
      frameId = requestAnimationFrame(calculateFps);
    };
    frameId = requestAnimationFrame(calculateFps);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const { batteryLevel, isCharging } = useClientStats();

  useEffect(() => {
    if (batteryLevel !== null && batteryLevel < 20 && !isCharging && !isEcoMode) {
      setIsEcoMode(true);
    }
  }, [batteryLevel, isCharging, isEcoMode, setIsEcoMode]);

  const getBatteryLevel = (): 'critical' | 'low' | 'medium' | 'high' | 'plugged' => {
    if (isCharging || batteryLevel === null) return 'plugged';
    if (batteryLevel < 20) return 'critical';
    if (batteryLevel < 40) return 'low';
    if (batteryLevel < 60) return 'medium';
    return 'high';
  };

  return (
    <div className={`status-line status-line--${severity.toLowerCase()}`}>
      <div className="status-line__left">
        <span>SRE_OS v5.0 // SYS_STATUS: {status}</span>
        {isChaos && <span className="unstable-tag">!! UNSTABLE !!</span>}
      </div>
      <div className="status-line__right">
        <span>STACK:{stack}</span>
        <span className="separator">|</span>
        <span>FPS:{fps}</span>
        <span className="separator">|</span>
        <div 
          className={`status-line__battery ${isEcoMode ? 'eco-active' : ''}`}
          onClick={() => setIsEcoMode(!isEcoMode)}
          title="Toggle Eco Mode"
        >
          <BatteryIcon level={getBatteryLevel()} />
          {batteryLevel}%
        </div>
      </div>
    </div>
  );
};
