import { useState, useEffect } from 'react';
import type { Severity } from '../data/incidents';

export const useSystemMetrics = (severity: Severity) => {
  const [metrics, setMetrics] = useState({
    cpu: 12,
    ram: 4.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(() => {
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

        const newCpu = Math.min(100, Math.max(0, baseCpu + (Math.random() - 0.5) * cpuVolatility));
        const newRam = Math.min(32, Math.max(0, baseRam + (Math.random() - 0.5) * ramVolatility));

        return {
          cpu: Math.round(newCpu),
          ram: parseFloat(newRam.toFixed(1))
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [severity]);

  return metrics;
};
