import { useEffect, useRef } from 'react';
import type { Severity } from '../data/excuses';

export const FakeCharts = ({ severity }: { severity: Severity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // console.log('Severity:', severity);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points: number[] = Array(50).fill(50);
    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Shift and add new point
      points.shift();
      const lastPoint = points[points.length - 1];
      
      // Spikier charts for higher severity
      const volatility = severity === 'P0' ? 20 : severity === 'P1' ? 10 : 5;
      const nextPoint = Math.max(0, Math.min(100, lastPoint + (Math.random() - 0.5) * volatility));
      
      points.push(nextPoint);

      ctx.beginPath();
      ctx.strokeStyle = nextPoint > 80 ? '#ff0000' : '#00ff41';
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
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      width: '300px',
      height: '150px',
      opacity: 0.2,
      border: '1px solid var(--terminal-green)',
      pointerEvents: 'none',
      zIndex: 0
    }}>
      <canvas ref={canvasRef} width={300} height={150} />
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: '1rem' }}>METRICS: INGRESS_LATENCY_99P</div>
    </div>
  );
};
