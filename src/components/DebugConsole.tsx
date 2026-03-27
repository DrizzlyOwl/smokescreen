import { useEffect, useState, useRef } from 'react';
import { Pane } from './Pane';
import { BugIcon } from './Icons';
import { useSync } from '../contexts/SyncContext';

interface DebugLog {
  timestamp: string;
  action: string;
  data: string;
}

export const DebugConsole = ({ 
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
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useSync();

  useEffect(() => {
    const unsubscribe = subscribe((data) => {
        if (data.type === 'DEBUG_LOG') {
            setLogs(prev => [...prev, data.log].slice(-100));
        }
    });

    return unsubscribe;
  }, [subscribe]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Pane
      title="SYSTEM_DEBUG_CONSOLE"
      icon={<BugIcon />}
      initialPos={{ x: 50, y: 400 }}
      initialSize={{ width: 500, height: 300 }}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      onClose={onClose}
    >
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          background: '#050505', 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          padding: '10px',
          overflowY: 'auto'
      }}>
        {logs.length === 0 && <div style={{ opacity: 0.3 }}>AWAITING_SYSTEM_HOOKS...</div>}
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '4px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#666' }}>[{log.timestamp}]</span>
            <span style={{ color: 'var(--terminal-amber)', fontWeight: 'bold' }}>{log.action}</span>
            <span style={{ color: '#adbac7', wordBreak: 'break-all' }}>{log.data}</span>
          </div>
        ))}
      </div>
    </Pane>
  );
};
