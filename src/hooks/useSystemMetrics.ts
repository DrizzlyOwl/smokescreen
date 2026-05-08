import { useState, useEffect } from 'react';
import type { Severity } from '../data/incidents';

export const useSystemMetrics = (severity: Severity, isPaused: boolean = false) => {
  const [metrics, setMetrics] = useState({
    cpu: 12,
    ram: 4.2
  });
  const [activeSpikes, setActiveSpikes] = useState<Record<string, { target: number, expiresAt: number }>>({});

  useEffect(() => {
    const handleSpike = (e: Event) => {
      const { metric, target, duration } = (e as CustomEvent).detail;
      setActiveSpikes(prev => ({
        ...prev,
        [metric]: { target, expiresAt: Date.now() + duration }
      }));
    };

    window.addEventListener('METRIC_SPIKE', handleSpike);
    return () => window.removeEventListener('METRIC_SPIKE', handleSpike);
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setMetrics((prev) => {
        let baseCpu = 5;
        let cpuVolatility = 5;
        let baseRam = 4.0;
        let ramVolatility = 0.2;

        switch (severity) {
          case 'P3':
            baseCpu = 25;
            cpuVolatility = 15;
            baseRam = 6.5;
            ramVolatility = 0.5;
            break;
          case 'P1':
            baseCpu = 65;
            cpuVolatility = 25;
            baseRam = 12.8;
            ramVolatility = 1.2;
            break;
          case 'P0':
            baseCpu = 94;
            cpuVolatility = 5; // Stays high and pinning
            baseRam = 28.4;
            ramVolatility = 2.5;
            break;
          default:
            baseCpu = 12;
            cpuVolatility = 5;
            baseRam = 4.2;
            ramVolatility = 0.1;
        }

        const now = Date.now();
        let targetCpu = baseCpu + (Math.random() - 0.5) * cpuVolatility;
        let targetRam = baseRam + (Math.random() - 0.5) * ramVolatility;

        // Apply spikes if active
        if (activeSpikes.cpu && activeSpikes.cpu.expiresAt > now) {
          targetCpu = activeSpikes.cpu.target + (Math.random() - 0.5) * 2;
        }
        if (activeSpikes.ram && activeSpikes.ram.expiresAt > now) {
          targetRam = activeSpikes.ram.target + (Math.random() - 0.5) * 0.5;
        }

        // Clean up expired spikes (optional, or let them stay in state until next spike)
        
        const newCpu = Math.min(100, Math.max(0, targetCpu));
        const newRam = Math.min(32, Math.max(0, targetRam));

        // Smooth transition (lerp) for sustained feel
        const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
        
        return {
          cpu: Math.round(lerp(prev.cpu, newCpu, 0.5)),
          ram: parseFloat(lerp(prev.ram, newRam, 0.5).toFixed(1))
        };
      });
    }, 400); // 2.5Hz update for much better visual fluidity

    return () => clearInterval(interval);
  }, [severity, activeSpikes]);

  return metrics;
};
