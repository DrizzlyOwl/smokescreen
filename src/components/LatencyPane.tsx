import { useEffect, useRef, useState } from 'react';
import { Pane } from './Pane';
import { useIncident } from '../hooks/useIncident';
import { MetricsIcon } from './Icons';
import { useTerminal } from '../hooks/useTerminal';
import '../styles/LatencyPane.scss';

export const LatencyPane = ({ 
    zIndex, 
    onFocus, 
    isActive, 
    onClose,
    isMinimized,
    onMinimizeToggle
}: { 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentLatency, setCurrentLatency] = useState(24);
    const { severity } = useIncident();
    const { isEcoMode } = useTerminal();
    
    // Initial data points in ms
    const dataPoints = useRef<number[]>(Array(50).fill(24));

    useEffect(() => {
        const interval = setInterval(() => {
            const last = dataPoints.current[dataPoints.current.length - 1];
            let next;
            
            // Generate realistic latency spikes based on severity
            if (severity === 'P0') {
                // Catastrophic: 1500ms - 5000ms
                next = last + (Math.random() * 800 - 300);
                next = Math.max(1500, Math.min(5000, next));
            } else if (severity === 'P1') {
                // Critical: 400ms - 1200ms
                next = last + (Math.random() * 200 - 80);
                next = Math.max(400, Math.min(1200, next));
            } else if (severity === 'P3') {
                // Warning: 80ms - 250ms
                next = last + (Math.random() * 50 - 20);
                next = Math.max(80, Math.min(250, next));
            } else {
                // Nominal: 18ms - 45ms
                next = 20 + Math.random() * 15;
            }
            
            dataPoints.current = [...dataPoints.current.slice(1), next];
            setCurrentLatency(Math.round(next));
            
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;
            ctx.clearRect(0, 0, width, height);
            
            // Dynamic scaling based on max value in current buffer
            const maxVal = Math.max(...dataPoints.current) * 1.2;
            const step = width / (dataPoints.current.length - 1);
            
            const rootStyle = getComputedStyle(document.documentElement);
            const nominalColor = rootStyle.getPropertyValue('--status-nominal').trim();
            const p3Color = rootStyle.getPropertyValue('--status-p3').trim();
            const p0Color = rootStyle.getPropertyValue('--status-p0').trim();

            ctx.beginPath();
            ctx.strokeStyle = severity === 'P0' ? p0Color : severity === 'P1' ? p3Color : nominalColor;
            ctx.lineWidth = 2;
            
            dataPoints.current.forEach((p, i) => {
                const x = i * step;
                const y = height - (p / maxVal) * height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            if (!isEcoMode) {
                const gradient = ctx.createLinearGradient(0, 0, 0, height);
                const baseColor = severity === 'P0' ? p0Color : severity === 'P1' ? p3Color : nominalColor;
                gradient.addColorStop(0, `${baseColor}33`); // 33 is hex for 20% opacity
                gradient.addColorStop(1, `${baseColor}00`); // 00 is hex for 0% opacity
                
                ctx.fillStyle = gradient;
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.fill();
            }
        }, 150);

        return () => clearInterval(interval);
    }, [severity, isEcoMode]);

    const latencyColor = severity === 'P0' ? 'var(--status-p0)' : severity === 'P1' ? 'var(--status-p3)' : 'var(--status-nominal)';

    return (
        <Pane
          id="metrics"
          title="LATENCY_ANALYSIS_99th"
          icon={<MetricsIcon />}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          isMinimized={isMinimized}
          onMinimizeToggle={onMinimizeToggle}
          onClose={onClose}
          initialPos={{ x: 600, y: 300 }}
          initialSize={{ width: 350, height: 200 }}
        >
          <div className="latency-metrics">
            <div className="latency-metrics__header">
                <div className="latency-metrics__status">
                    <span>UPLINK: ACTIVE</span>
                    <span>TARGET: 99th_PERCENTILE</span>
                </div>
                <div className="latency-metrics__counter" style={{ color: latencyColor }}>
                    <span className="latency-metrics__value">{currentLatency}</span>
                    <span className="latency-metrics__unit">ms</span>
                </div>
            </div>
            <canvas 
                ref={canvasRef} 
                width={330} 
                height={120} 
                className="latency-metrics__canvas"
            />
          </div>
        </Pane>
    );
};
