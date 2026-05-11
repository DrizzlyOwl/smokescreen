import React, { useMemo } from 'react';
import { StatReadout } from './StatReadout';
import { ActivityIcon, DeployIcon } from './Icons';
import { MissionHUD } from './MissionHUD';
import { type Severity, type Stack, stackJargon, commonJargon } from '../data/incidents';
import { useSystemMetrics } from '../hooks/useSystemMetrics';
import { useIncidentStore } from '../store/useIncidentStore';
import { getNodeType, NODE_TYPE_REMEDIATION } from '../utils/nodeTypes';
import type { Scenario } from '../data/scenarios/types';
import '../styles/TacticalOverview.scss';

interface TacticalOverviewProps {
  severity: Severity;
  stack: Stack;
  isDeclared: boolean;
  activeScenario: Scenario | null;
  objective: import('../contexts/types').Objective | null;
}

export const TacticalOverview = ({ 
  severity, 
  stack, 
  isDeclared,
  activeScenario,
  objective
}: TacticalOverviewProps) => {
  const addTerminalLine = useIncidentStore(state => state.addTerminalLine);
  const serviceHealth = useIncidentStore(state => state.serviceHealth);

  const isPaused = useIncidentStore(state => state.isPaused);
  const metrics = useSystemMetrics(severity, isPaused);
  const coreCount = React.useMemo(() => Math.min(navigator.hardwareConcurrency || 8, 4), []); // Cap at 4 for space
  
  const [coreHistory, setCoreHistory] = React.useState<number[][]>(() => 
    Array.from({ length: coreCount }, () => Array(40).fill(0))
  );
  const [memHistory, setMemHistory] = React.useState<number[]>(Array(40).fill(0));

  // Sync sparklines with global metrics
  React.useEffect(() => {
    setCoreHistory(prev => prev.map(history => {
      // Individual cores vary slightly around the global average
      const variance = (Math.random() - 0.5) * 10;
      const nextValue = Math.min(100, Math.max(0, metrics.cpu + variance));
      return [...history.slice(1), nextValue];
    }));

    setMemHistory(prev => {
      const memPercent = (metrics.ram / 32) * 100;
      return [...prev.slice(1), memPercent];
    });
  }, [metrics]);

  const statusColor = useMemo(() => {
    switch (severity) {
      case 'P0': return 'var(--terminal-red)';
      case 'P1': return 'var(--terminal-amber)';
      case 'P3': return 'var(--terminal-green)';
      default: return 'var(--terminal-green)';
    }
  }, [severity]);

  // CSS Bar Chart generator
  const renderCssSparkline = (history: number[]) => {
    return (
      <div className="tactical-overview__css-chart">
        {history.map((val, idx) => (
          <div 
            key={idx} 
            className="tactical-overview__css-bar" 
            style={{ height: `${Math.max(4, val)}%` }} 
          />
        ))}
      </div>
    );
  };

  // Generate service nodes from stack-specific jargon
  const services = useMemo(() => {
    const systems = stackJargon[stack]?.systems || commonJargon.systems;
    return systems.map(name => {
      const status = serviceHealth[name.toUpperCase()] || 'UP';
      
      const baseLatency = severity === 'P0' ? 400 : severity === 'P1' ? 150 : 20;
      const jitter = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % (severity === 'P0' ? 600 : 80);
      
      return {
        name: name.toUpperCase(),
        status,
        latency: status === 'DN' ? 'TIMED_OUT' : `${baseLatency + jitter}ms`
      };
    });
  }, [severity, stack, serviceHealth]);

  const handleNodeClick = (svc: { name: string, status: string }) => {
    if (svc.status === 'UP') {
        addTerminalLine({ text: `PROBE_SUCCESS: ${svc.name} IS STABLE. NO ACTION REQUIRED.`, type: 'system' });
        return;
    }

    const type = getNodeType(svc.name);
    const hint = NODE_TYPE_REMEDIATION[type];

    addTerminalLine({ text: `TECHNICAL_SITREP: ${svc.name} IS UNSTABLE.`, type: 'error' });
    addTerminalLine({ text: `REMEDIATION_HINT: EXECUTE "${hint}" TO STABILIZE.`, type: 'system' });
  };

  return (
    <div className={`tactical-overview tactical-overview--${severity.toLowerCase()}`}>
      <MissionHUD objective={objective} />
      <div className="tactical-overview__grid">
        {/* Hero Section: System Status */}
        <div className="tactical-overview__hero">
          <div className="tactical-overview__hero-header">
            <ActivityIcon />
            <h2>PRIMARY_SYSTEM_OVERVIEW</h2>
          </div>
          <div className="tactical-overview__hero-metrics">
            <StatReadout label="SCENARIO" value={activeScenario?.name.split(': ')[1] || 'MANUAL'} color="var(--terminal-cyan)" />
            <StatReadout label="STACK" value={stack} />
            <StatReadout label="THREAT" value={severity} color={statusColor} />
            <StatReadout label="STATUS" value={isDeclared ? 'ACTIVE' : 'NOMINAL'} color={isDeclared ? 'var(--terminal-red)' : 'var(--terminal-green)'} />
          </div>
          
          <div className="tactical-overview__visualizer">
            <div className="tactical-overview__cpu-grid">
               <div className="tactical-overview__core tactical-overview__mem-block" style={{ color: 'var(--terminal-amber)' }}>
                  <div className="tactical-overview__core-label">
                    CLUSTER_MEM <span className="tactical-overview__core-usage">{metrics.ram}Gi / 32Gi</span>
                  </div>
                  {renderCssSparkline(memHistory)}
               </div>

               {coreHistory.map((history, i) => {
                 const currentUsage = history[history.length - 1];
                 return (
                   <div key={i} className="tactical-overview__core" style={{ color: statusColor }}>
                      <div className="tactical-overview__core-label">
                        CORE_{i} <span className="tactical-overview__core-usage">{Math.round(currentUsage)}%</span>
                      </div>
                      {renderCssSparkline(history)}
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
              <div 
                key={svc.name} 
                className={`tactical-overview__service-node tactical-overview__service-node--${svc.status.toLowerCase()}`}
                onClick={() => handleNodeClick(svc)}
              >
                <div className="tactical-overview__service-name">{svc.name}</div>
                <div className="tactical-overview__service-status">[{svc.status}]</div>
                <div className="tactical-overview__service-latency">{svc.latency}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="tactical-overview__footer">
        <div className="tactical-overview__timestamp">
          SYSTEM_TIME: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
};
