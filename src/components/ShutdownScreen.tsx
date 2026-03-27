import { useState, useEffect, useMemo } from 'react';

export const ShutdownScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const shutdownLogs = useMemo(() => [
    'SIGTERM RECEIVED. INITIALIZING SHUTDOWN SEQUENCE...',
    'SAVING PERSISTENT DATA TO LOCAL_STORAGE... [OK]',
    'TERMINATING CLOUD_JARGON_ENGINE... [OK]',
    'CLOSING SECURE UPLINK CHANNELS... [OK]',
    'RELEASING ALLOCATED VIRTUAL ASSETS... [OK]',
    'FLUSHING VOLATILE MEMORY BUFFERS... [DONE]',
    'DISCONNECTING SYSTEM CENTRAL CORE...',
    'PARKING DISK HEADS...',
    '',
    'SHUTDOWN COMPLETE.',
    'HALTING SYSTEM.',
    '',
    'GOODBYE, OPERATOR.'
  ], []);

  useEffect(() => {
    if (index < shutdownLogs.length) {
      const delay = Math.random() * 150 + 50;
      const timeout = setTimeout(() => {
        setVisibleLines(prev => [...prev, shutdownLogs[index]]);
        setIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      const finishTimeout = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(finishTimeout);
    }
  }, [index, onComplete, shutdownLogs]);

  return (
    <div className="crt-container" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0a0a0a',
      zIndex: 10000,
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      overflow: 'hidden',
      color: 'var(--terminal-green)',
      fontFamily: 'monospace',
      fontSize: 'var(--text-l3)',
    }}>
      <div style={{ textShadow: '0 0 10px var(--terminal-green)' }}>
        {visibleLines.map((line, i) => (
          <div key={i} style={{ marginBottom: '5px', minHeight: '1.2em' }}>
            {line ? `> ${line}` : ''}
          </div>
        ))}
        {index < shutdownLogs.length && (
          <span style={{ 
            display: 'inline-block', 
            width: '10px', 
            height: '1.2rem', 
            backgroundColor: 'var(--terminal-green)',
            animation: 'flicker 0.1s infinite'
          }} />
        )}
      </div>
      
      {index >= shutdownLogs.length && (
        <div style={{ 
          marginTop: 'auto', 
          textAlign: 'center', 
          opacity: 0.5, 
          fontSize: 'var(--text-l4)',
          animation: 'flicker 0.2s infinite'
        }}>
          CONNECTION_LOST
        </div>
      )}
    </div>
  );
};
