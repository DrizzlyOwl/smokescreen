import { useEffect, useState } from 'react';
import { MapIcon } from './Icons';
import type { Severity } from '../data/excuses';
import { Pane } from './Pane';
import { useTerminal } from '../hooks/useTerminal';

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

export const OutageMap = ({ severity, zIndex, onFocus, isActive, onClose }: { severity: Severity, zIndex: number, onFocus: () => void, isActive: boolean, onClose: () => void }) => {
    const [nodes, setNodes] = useState<IncidentNode[]>([]);
    const { isEcoMode } = useTerminal();

    useEffect(() => {
        // Map regions to nodes with status based on severity
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

    // Convert Lat/Lng to X/Y percentages for a simple Mercator-ish projection
    const getPos = (lat: number, lng: number) => {
        const x = ((lng + 180) / 360) * 100;
        const y = ((90 - lat) / 180) * 100;
        return { x: `${x}%`, y: `${y}%` };
    };

    const isP0 = severity === 'P0';

    return (
        <Pane
          title="GLOBAL_INCIDENT_MONITOR"
          icon={<MapIcon />}
          iconColor={severity === 'NOMINAL' ? 'var(--terminal-green)' : isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)'}
          initialPos={{ x: window.innerWidth - 650, y: 40 }}
          initialSize={{ width: 600, height: 400 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          severityColor={severity === 'NOMINAL' ? undefined : (isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)')}
          onClose={onClose}
        >
            <div className="h-full bg-[#0a0c0f] relative overflow-hidden p-0 border-box">
                {/* SVG World Map Outline */}
                <svg 
                    viewBox="0 0 1000 500" 
                    preserveAspectRatio="xMidYMid slice"
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        opacity: 0.6,
                        fill: '#24292e',
                        stroke: '#444c56',
                        strokeWidth: 1.5
                    }}
                >
                    <path d="M150,120 L180,110 L220,115 L250,140 L240,180 L200,210 L160,200 L140,160 Z" /> {/* N. America simplified */}
                    <path d="M220,250 L260,240 L290,270 L280,330 L240,360 L210,320 Z" /> {/* S. America simplified */}
                    <path d="M460,100 L520,80 L580,100 L560,160 L500,180 L460,150 Z" /> {/* Europe/W. Asia simplified */}
                    <path d="M480,200 L540,190 L580,230 L560,300 L510,320 L470,260 Z" /> {/* Africa simplified */}
                    <path d="M600,120 L750,110 L850,150 L820,250 L700,280 L620,240 Z" /> {/* Asia simplified */}
                    <path d="M780,320 L840,310 L870,360 L830,410 L770,390 Z" /> {/* Australia simplified */}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                    const pos = getPos(node.lat, node.lng);
                    const color = node.status === 'healthy' ? 'var(--terminal-green)' : 
                                 node.status === 'warning' ? 'var(--terminal-amber)' : 'var(--terminal-red)';
                    
                    return (
                        <div key={node.id} style={{
                            position: 'absolute',
                            left: pos.x,
                            top: pos.y,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 5
                        }}>
                            {/* Pulse effect for non-healthy nodes */}
                            {node.status !== 'healthy' && !isEcoMode && (
                                <div style={{
                                    position: 'absolute',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: color,
                                    opacity: 0.4,
                                    animation: 'pulse 1.5s infinite',
                                    left: '-5px',
                                    top: '-5px'
                                }} />
                            )}
                            
                            {/* Actual Dot */}
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: color,
                                boxShadow: isEcoMode ? 'none' : `0 0 10px ${color}`,
                                cursor: 'help'
                            }} title={node.label} />
                            
                            {/* Label */}
                            <div className="absolute top-[12px] left-1/2 translate-x-[-50%] text-[0.8rem] whitespace-nowrap text-shadow-[0_0_4px_#000] pointer-events-none" style={{
                                color: node.status === 'healthy' ? '#768390' : color,
                                fontWeight: node.status === 'healthy' ? 'normal' : 'bold',
                            }}>
                                {node.label}
                            </div>
                        </div>
                    );
                })}

                {/* Map Legend */}
                <div className="absolute bottom-[10px] left-[10px] text-[0.8rem] text-[#768390] flex gap-[15px] bg-[rgba(10,12,15,0.8)] p-[5px] rounded-[4px] border border-solid border-[#1c2128]">
                    <div className="flex items-center gap-1">
                        <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'var(--terminal-green)' }} /> NOMINAL
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'var(--terminal-amber)' }} /> WARNING
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-[6px] h-[6px] rounded-full" style={{ background: 'var(--terminal-red)' }} /> CRITICAL
                    </div>
                </div>
            </div>
        </Pane>
    );
};
