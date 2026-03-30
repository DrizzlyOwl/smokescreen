import { useEffect, useState, useRef } from 'react';
import { Pane } from './Pane';
import { BugIcon } from './Icons';
import { useSync } from '../hooks/useSync';
import '../styles/DebugConsole.scss';

interface DebugLog {
  timestamp: string;
  action: string;
  data: string;
}

export const DebugConsole = ({ 
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
      id="debug"
      title="SYSTEM_DEBUG_CONSOLE"
      icon={<BugIcon />}
      initialPos={{ x: 50, y: 400 }}
      initialSize={{ width: 500, height: 300 }}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
    >
      <div 
        ref={scrollRef}
        className="debug-console"
      >
        {logs.length === 0 && <div className="debug-console__idle">AWAITING_SYSTEM_HOOKS...</div>}
        {logs.map((log, i) => (
          <div key={i} className="debug-console__entry">
            <span className="debug-console__timestamp">[{log.timestamp}]</span>
            <span className="debug-console__action">{log.action}</span>
            <span className="debug-console__data">{log.data}</span>
          </div>
        ))}
      </div>
    </Pane>
  );
};
