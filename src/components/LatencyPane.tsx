import { useEffect, useRef } from 'react';
import { Pane } from './Pane';
import { useIncident } from '../hooks/useIncident';
import { MetricsIcon } from './Icons';

export const LatencyPane = ({ 
    zIndex, 
    onFocus, 
    isActive, 
    onClose 
}: { 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { severity } = useIncident();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: number[] = Array(50).fill(50);
    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      points.shift();
      const lastPoint = points[points.length - 1];
      
      const volatility = severity === 'P0' ? 20 : severity === 'P1' ? 10 : 5;
      const nextPoint = Math.max(0, Math.min(100, lastPoint + (Math.random() - 0.5) * volatility));
      
      points.push(nextPoint);

      // Draw Grid
      ctx.strokeStyle = 'rgba(24, 255, 98, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = nextPoint > 80 ? '#ff0000' : '#18ff62';
      ctx.lineWidth = 2;
      
      const step = canvas.width / (points.length - 1);
      points.forEach((p, i) => {
        const x = i * step;
        const y = canvas.height - (p / 100 * canvas.height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [severity]);

  return (
    <Pane
      title="METRICS: INGRESS_LATENCY_99P"
      icon={<MetricsIcon />}
      initialPos={{ x: 600, y: 400 }}
      initialSize={{ width: 350, height: 220 }}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      onClose={onClose}
    >
      <div style={{ 
          flex: 1, 
          background: '#000', 
          position: 'relative', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '10px'
      }}>
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '0.8rem', 
            opacity: 0.5,
            marginBottom: '5px'
        }}>
            <span>UPLINK: ACTIVE</span>
            <span>TARGET: 99th_PERCENTILE</span>
        </div>
        <canvas 
            ref={canvasRef} 
            width={330} 
            height={140} 
            style={{ width: '100%', height: '100%', border: '1px solid rgba(24, 255, 98, 0.2)' }}
        />
      </div>
    </Pane>
  );
};
