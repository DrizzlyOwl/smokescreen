import React, { useMemo } from 'react';
import { StatReadout } from './StatReadout';
import { ActivityIcon, DeployIcon, BurnIcon } from './Icons';
import type { Severity, Stack } from '../data/incidents';
import '../styles/TacticalOverview.scss';

interface TacticalOverviewProps {
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
}

export const TacticalOverview = ({ 
  severity, 
  stack, 
  isDeclared 
}: TacticalOverviewProps) => {
  const [streamData, setStreamData] = React.useState<string[]>([]);
  const coreCount = React.useMemo(() => navigator.hardwareConcurrency || 8, []);
  const [coreHistory, setCoreHistory] = React.useState<number[][]>(() => 
    Array.from({ length: coreCount }, () => Array(20).fill(0))
  );

  React.useEffect(() => {
    const generateLine = () => 
      `${Math.random().toString(16).substring(2, 10).toUpperCase()} ${Math.random().toString(16).substring(2, 10).toUpperCase()} ${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
    
    setStreamData(Array.from({ length: 10 }, generateLine));

    const interval = setInterval(() => {
      setStreamData(prev => [...prev.slice(1), generateLine()]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Update CPU core history for sparkline effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCoreHistory(prev => prev.map(history => {
        const base = severity === 'P0' ? 60 : severity === 'P1' ? 30 : 5;
        const range = severity === 'P0' ? 40 : severity === 'P1' ? 50 : 20;
        const nextValue = base + Math.random() * range;
        return [...history.slice(1), nextValue];
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [severity]);

  const statusColor = useMemo(() => {
    switch (severity) {
      case 'P0': return 'var(--terminal-red)';
      case 'P1': return 'var(--terminal-amber)';
      case 'P3': return 'var(--terminal-green)';
      default: return 'var(--terminal-green)';
    }
  }, [severity]);

  // ASCII Sparkline generator
  const getAsciiSparkline = (history: number[]) => {
    const chars = [' ', ' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    return history.map(val => {
        const idx = Math.min(Math.floor((val / 100) * chars.length), chars.length - 1);
        return chars[idx];
    }).join('');
  };

  // Generate some "service blocks" for visual density
  const services = useMemo(() => {
    const names = ['AUTH', 'DB-CORE', 'API-GW', 'CACHE', 'QUEUE', 'CDN', 'IMG-SRV', 'LOG-COLL'];
    return names.map(name => {
      // Deterministic but "random-looking" status based on name and severity
      const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const threshold = severity === 'P0' ? 0.6 : severity === 'P1' ? 0.3 : 0.05;
      const isUp = (nameHash % 100) / 100 > threshold;
      
      // Deterministic latency based on name and severity
      const baseLatency = severity === 'P0' ? 400 : severity === 'P1' ? 150 : 20;
      const jitter = nameHash % (severity === 'P0' ? 600 : 80);
      
      return {
        name,
        status: isUp ? 'UP' : 'DN',
        latency: `${baseLatency + jitter}ms`
      };
    });
  }, [severity]);

  return (
    <div className={`tactical-overview tactical-overview--${severity.toLowerCase()}`}>
      <div className="tactical-overview__grid">
        {/* Hero Section: System Status */}
        <div className="tactical-overview__hero">
          <div className="tactical-overview__hero-header">
            <ActivityIcon />
            <h2>PRIMARY_SYSTEM_OVERVIEW</h2>
          </div>
          <div className="tactical-overview__hero-metrics">
            <StatReadout label="STACK" value={stack} />
            <StatReadout label="THREAT" value={severity} color={statusColor} />
            <StatReadout label="STATUS" value={isDeclared ? 'ACTIVE' : 'NOMINAL'} color={isDeclared ? 'var(--terminal-red)' : 'var(--terminal-green)'} />
          </div>
          
          <div className="tactical-overview__visualizer">
            <div className="tactical-overview__cpu-grid">
               {coreHistory.map((history, i) => {
                 const currentUsage = history[history.length - 1];
                 return (
                   <div key={i} className="tactical-overview__core" style={{ color: statusColor }}>
                      <div className="tactical-overview__core-label">
                        CPU_{i} <span className="tactical-overview__core-usage">{Math.round(currentUsage)}%</span>
                      </div>
                      <div className="tactical-overview__ascii-chart">
                          {getAsciiSparkline(history)}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* Service Grid */}
        <div className="tactical-overview__services">
          <div className="tactical-overview__section-header">
            <DeployIcon />
            <h3>SERVICE_TOPOLOGY</h3>
          </div>
          <div className="tactical-overview__service-grid">
            {services.map(svc => (
              <div key={svc.name} className={`tactical-overview__service-node tactical-overview__service-node--${svc.status.toLowerCase()}`}>
                <div className="tactical-overview__service-name">{svc.name}</div>
                <div className="tactical-overview__service-status">[{svc.status}]</div>
                <div className="tactical-overview__service-latency">{svc.latency}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Data Stream */}
        <div className="tactical-overview__stream">
           <div className="tactical-overview__section-header">
            <BurnIcon />
            <h3>DATA_EXFILTRATION_STREAM</h3>
          </div>
          <div className="tactical-overview__stream-content">
            {streamData.map((line, i) => (
              <div key={i} className="tactical-overview__stream-line">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="tactical-overview__footer">
        <div className="tactical-overview__scanline"></div>
        <div className="tactical-overview__timestamp">
          SYSTEM_TIME: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
};
