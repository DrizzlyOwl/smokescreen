import { useEffect, useState } from 'react';
import { MapIcon } from './Icons';
import type { Severity } from '../data/incidents';
import { Pane } from './Pane';
import { useTerminal } from '../hooks/useTerminal';
import '../styles/OutageMap.scss';

interface IncidentNode {
    id: string;
    lat: number;
    lng: number;
    label: string;
    status: 'healthy' | 'warning' | 'critical';
}

const REGIONS = [
    { label: 'US-EAST-1 (N. Virginia)', lat: 38.0, lng: -77.0 },
    { label: 'US-WEST-2 (Oregon)', lat: 45.0, lng: -120.0 },
    { label: 'EU-WEST-2 (London)', lat: 51.5, lng: -0.12 },
    { label: 'EU-CENTRAL-1 (Frankfurt)', lat: 50.1, lng: 8.6 },
    { label: 'AP-SOUTH-1 (Mumbai)', lat: 19.0, lng: 72.8 },
    { label: 'AP-NORTHEAST-1 (Tokyo)', lat: 35.6, lng: 139.6 },
    { label: 'SA-EAST-1 (São Paulo)', lat: -23.5, lng: -46.6 },
    { label: 'AF-SOUTH-1 (Cape Town)', lat: -33.9, lng: 18.4 }
];

export const OutageMap = ({ severity, zIndex, onFocus, isActive, onClose, isMinimized, onMinimizeToggle }: { 
    severity: Severity, 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void
}) => {
    const [nodes, setNodes] = useState<IncidentNode[]>([]);
    const { isEcoMode } = useTerminal();

    useEffect(() => {
        const updateNodes = () => {
            setNodes(REGIONS.map(reg => {
                let status: IncidentNode['status'] = 'healthy';
                
                if (severity !== 'NOMINAL') {
                    const rand = Math.random();
                    if (severity === 'P0') {
                        status = rand > 0.3 ? 'critical' : 'warning';
                    } else if (severity === 'P1') {
                        status = rand > 0.6 ? 'critical' : rand > 0.3 ? 'warning' : 'healthy';
                    } else {
                        status = rand > 0.8 ? 'warning' : 'healthy';
                    }
                }

                return {
                    id: reg.label,
                    lat: reg.lat,
                    lng: reg.lng,
                    label: reg.label.split(' ')[0],
                    status
                };
            }));
        };

        updateNodes();
        const interval = setInterval(updateNodes, 5000);
        return () => clearInterval(interval);
    }, [severity]);

    const getPos = (lat: number, lng: number) => {
        const x = ((lng + 180) / 360) * 100;
        const y = ((90 - lat) / 180) * 100;
        return { x: `${x}%`, y: `${y}%` };
    };

    const isP0 = severity === 'P0';

    return (
        <Pane
          id="map"
          title="GLOBAL_INCIDENT_MONITOR"
          icon={<MapIcon />}
          iconColor={severity === 'NOMINAL' ? 'var(--terminal-green)' : isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)'}
          initialPos={{ x: window.innerWidth - 650, y: 40 }}
          initialSize={{ width: 600, height: 400 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          isMinimized={isMinimized}
          onMinimizeToggle={onMinimizeToggle}
          severityColor={severity === 'NOMINAL' ? undefined : (isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)')}
          onClose={onClose}
        >
            <div className="outage-map">
                <svg 
                    viewBox="0 0 1000 500" 
                    preserveAspectRatio="xMidYMid slice"
                    className="outage-map__svg"
                >
                    {/* North America */}
                    <path d="M120,80 L280,80 L320,150 L280,220 L200,240 L120,200 L80,150 Z" />
                    {/* South America */}
                    <path d="M250,260 L350,260 L380,350 L320,450 L260,450 L220,350 Z" />
                    {/* Europe & Africa */}
                    <path d="M450,80 L580,80 L620,150 L580,220 L550,240 L580,350 L520,450 L450,450 L420,350 L450,240 L420,150 Z" />
                    {/* Asia */}
                    <path d="M600,80 L850,80 L920,150 L880,280 L750,320 L620,280 L600,150 Z" />
                    {/* Australia */}
                    <path d="M800,350 L900,350 L920,420 L880,450 L820,450 Z" />
                </svg>

                {nodes.map(node => {
                    const pos = getPos(node.lat, node.lng);
                    const color = node.status === 'healthy' ? 'var(--status-nominal)' : 
                                 node.status === 'warning' ? 'var(--status-p3)' : 'var(--status-p0)';
                    
                    return (
                        <div key={node.id} className="outage-map__node" style={{
                            left: pos.x,
                            top: pos.y,
                        }}>
                            {node.status !== 'healthy' && !isEcoMode && (
                                <div 
                                    className="outage-map__node-pulse" 
                                    style={{ background: color }} 
                                />
                            )}
                            
                            <div 
                                className="outage-map__node-dot"
                                style={{
                                    background: color,
                                    boxShadow: isEcoMode ? 'none' : `0 0 10px ${color}`,
                                }} 
                                title={node.label} 
                            />
                            
                            <div 
                                className="outage-map__node-label" 
                                style={{
                                    color: node.status === 'healthy' ? 'var(--ui-text-dim)' : color,
                                    fontWeight: node.status === 'healthy' ? 'normal' : 'bold',
                                }}
                            >
                                {node.label}
                            </div>
                        </div>
                    );
                })}

                <div className="outage-map__legend">
                    <div className="outage-map__legend-item">
                        <div className="outage-map__legend-dot" style={{ background: 'var(--status-nominal)' }} /> NOMINAL
                    </div>
                    <div className="outage-map__legend-item">
                        <div className="outage-map__legend-dot" style={{ background: 'var(--status-p3)' }} /> WARNING
                    </div>
                    <div className="outage-map__legend-item">
                        <div className="outage-map__legend-dot" style={{ background: 'var(--status-p0)' }} /> CRITICAL
                    </div>
                </div>
            </div>
        </Pane>
    );
};
