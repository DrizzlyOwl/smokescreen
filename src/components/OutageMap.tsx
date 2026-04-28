import { useEffect, useState, useRef, useCallback } from 'react';
import { MapIcon } from './Icons';
import type { Severity } from '../data/incidents';
import { Pane } from './Pane';
import { useTerminal } from '../hooks/useTerminal';
import { useAudio } from '../hooks/useAudio';
import { useIncidentStore } from '../store/useIncidentStore';
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

export const OutageMap = ({ 
    severity, 
    zIndex, 
    onFocus, 
    isActive, 
    onClose, 
    isMinimized, 
    onMinimizeToggle,
    initialPos = { x: 50, y: 50 },
    initialSize = { width: 900, height: 500 },
    isPoppedOut,

    onPopOutToggle,
    isSnappedMain,
    onSnapMainToggle
}: { 
    severity: Severity, 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void,
    initialPos?: { x: number, y: number },
    initialSize?: { width: number, height: number },
    isPoppedOut?: boolean,
    onPopOutToggle?: () => void,
    isSnappedMain?: boolean,
    onSnapMainToggle?: () => void
}) => {
    const [nodes, setNodes] = useState<IncidentNode[]>([]);
    const { isEcoMode } = useTerminal();
    const { playMitigationSuccess } = useAudio();
    const { setSeverity, incrementMitigationCount } = useIncidentStore();
    const mapRef = useRef<HTMLDivElement>(null);
    
    // Drag state
    const [dragStartNode, setDragStartNode] = useState<IncidentNode | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateNodes = () => {
            setNodes(prev => {
                const next = REGIONS.map(reg => {
                    const existing = prev.find(n => n.id === reg.label);
                    // If node was manually fixed, keep it healthy for a bit
                    if (existing && existing.status === 'healthy' && prev.some(n => n.status !== 'healthy')) {
                        if (Math.random() > 0.2) return existing;
                    }

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
                });

                // Guarantee at least one healthy node for failover target
                if (severity !== 'NOMINAL' && !next.some(n => n.status === 'healthy')) {
                    const randomIndex = Math.floor(Math.random() * next.length);
                    next[randomIndex].status = 'healthy';
                }

                return next;
            });
        };

        updateNodes();
        const interval = setInterval(updateNodes, 10000);
        return () => clearInterval(interval);
    }, [severity]);

    const getPos = useCallback((lat: number, lng: number) => {
        const x = ((lng + 180) / 360) * 100;
        const y = ((90 - lat) / 180) * 100;
        return { x: `${x}%`, y: `${y}%`, xRaw: x, yRaw: y };
    }, []);

    const handleMouseDown = (e: React.MouseEvent, node: IncidentNode) => {
        if (node.status === 'healthy') return;
        e.preventDefault();
        setDragStartNode(node);
        
        if (mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            setMousePos({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragStartNode || !mapRef.current) return;
        
        const rect = mapRef.current.getBoundingClientRect();
        setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100
        });
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (!dragStartNode || !mapRef.current) return;

        const rect = mapRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Check if dropped on a healthy node
        const targetNode = nodes.find(node => {
            if (node.status !== 'healthy') return false;
            const pos = getPos(node.lat, node.lng);
            const dx = Math.abs(x - pos.xRaw);
            const dy = Math.abs(y - pos.yRaw);
            return dx < 5 && dy < 5; // 5% tolerance
        });

        if (targetNode) {
            playMitigationSuccess();
            incrementMitigationCount();
            const nextNodes = nodes.map(n => 
                n.id === dragStartNode.id ? { ...n, status: 'healthy' as const } : n
            );
            setNodes(nextNodes);

            // Scale back priority as operator fixes issues
            const criticalCount = nextNodes.filter(n => n.status === 'critical').length;
            const warningCount = nextNodes.filter(n => n.status === 'warning').length;

            if (severity === 'P0' && criticalCount === 0) {
                setSeverity('P1');
            } else if (severity === 'P1' && criticalCount === 0 && warningCount === 0) {
                setSeverity('P3');
            } else if (severity === 'P3' && warningCount === 0) {
                setSeverity('NOMINAL');
            }
        }

        setDragStartNode(null);
    };

    const handleTouchStart = (e: React.TouchEvent, node: IncidentNode) => {
        if (node.status === 'healthy') return;
        const touch = e.touches[0];
        setDragStartNode(node);
        
        if (mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            setMousePos({
                x: ((touch.clientX - rect.left) / rect.width) * 100,
                y: ((touch.clientY - rect.top) / rect.height) * 100
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragStartNode || !mapRef.current) return;
        const touch = e.touches[0];
        const rect = mapRef.current.getBoundingClientRect();
        setMousePos({
            x: ((touch.clientX - rect.left) / rect.width) * 100,
            y: ((touch.clientY - rect.top) / rect.height) * 100
        });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!dragStartNode || !mapRef.current) return;
        const touch = e.changedTouches[0];
        const rect = mapRef.current.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;

        // Check if dropped on a healthy node
        const targetNode = nodes.find(node => {
            if (node.status !== 'healthy') return false;
            const pos = getPos(node.lat, node.lng);
            const dx = Math.abs(x - pos.xRaw);
            const dy = Math.abs(y - pos.yRaw);
            return dx < 7 && dy < 7; // Higher tolerance for touch
        });

        if (targetNode) {
            playMitigationSuccess();
            incrementMitigationCount();
            const nextNodes = nodes.map(n => 
                n.id === dragStartNode.id ? { ...n, status: 'healthy' as const } : n
            );
            setNodes(nextNodes);

            // Scale back priority as operator fixes issues
            const criticalCount = nextNodes.filter(n => n.status === 'critical').length;
            const warningCount = nextNodes.filter(n => n.status === 'warning').length;

            if (severity === 'P0' && criticalCount === 0) {
                setSeverity('P1');
            } else if (severity === 'P1' && criticalCount === 0 && warningCount === 0) {
                setSeverity('P3');
            } else if (severity === 'P3' && warningCount === 0) {
                setSeverity('NOMINAL');
            }
        }

        setDragStartNode(null);
    };

    const isP0 = severity === 'P0';

    return (
        <Pane
          id="map"
          title="GLOBAL_INCIDENT_MONITOR"
          icon={<MapIcon />}
          iconColor={severity === 'NOMINAL' ? 'var(--terminal-green)' : isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)'}
          initialPos={initialPos}
          initialSize={initialSize}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          isMinimized={isMinimized}
          onMinimizeToggle={onMinimizeToggle}
          severityColor={severity === 'NOMINAL' ? undefined : (isP0 ? 'var(--terminal-red)' : 'var(--terminal-amber)')}
          onClose={onClose}
          isPoppedOut={isPoppedOut}
          onPopOutToggle={onPopOutToggle}
          isSnappedMain={isSnappedMain}
          onSnapMainToggle={onSnapMainToggle}
        >
            <div 
                ref={mapRef}
                className="outage-map"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setDragStartNode(null)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: dragStartNode ? 'crosshair' : 'default' }}
            >
                <svg 
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                    className="outage-map__overlay-svg"
                >
                    {dragStartNode && (
                        <line 
                            x1={`${getPos(dragStartNode.lat, dragStartNode.lng).xRaw}`} 
                            y1={`${getPos(dragStartNode.lat, dragStartNode.lng).yRaw}`} 
                            x2={`${mousePos.x}`} 
                            y2={`${mousePos.y}`} 
                            className="outage-map__drag-line"
                        />
                    )}
                </svg>

                <pre className="outage-map__ascii">
{`
      _..-''--'.._                                     _..-''--'.._
    .'            '.                                 .'            '.
   /   AMERICAS     \\        _..-''--'.._           /    ASIA      \\
  |                  |      .'            '.        |      &         |
  |      (WEST)      |     /    EMEA        \\       |   PACIFIC      |
  |                  |    |                 |       |                |
   \\                /     |     (CENTER)    |        \\              /
    '.            .'       \\               /          '.          .'
      '--..__..--'          '.           .'             '--..__..--'
                              '--..__..--'
`}
                </pre>

                {nodes.map(node => {
                    const pos = getPos(node.lat, node.lng);
                    const color = node.status === 'healthy' ? 'var(--status-nominal)' : 
                                 node.status === 'warning' ? 'var(--status-p3)' : 'var(--status-p0)';
                    
                    return (
                        <div 
                            key={node.id} 
                            className={`outage-map__node ${node.status !== 'healthy' ? 'outage-map__node--interactive' : ''}`}
                            style={{
                                left: pos.x,
                                top: pos.y,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, node)}
                            onTouchStart={(e) => handleTouchStart(e, node)}
                        >
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
