import { useEffect, useState, useRef, memo } from 'react';
import { Pane } from './Pane';
import { BugIcon } from './Icons';
import { useSync } from '../hooks/useSync';
import '../styles/DebugConsole.scss';

interface DebugLog {
  timestamp: string;
  action: string;
  data: string;
}

const DebugMenuControls = memo(({ 
    chatMultiplier, 
    setChatMultiplier 
}: { 
    chatMultiplier: number, 
    setChatMultiplier: (val: number) => void 
}) => {
    return (
        <div className="debug-menu__controls">
          <div className="debug-menu__section">
            <h3 className="debug-menu__section-title">Chat Settings</h3>
            <div className="debug-menu__field">
              <label htmlFor="debug-chattiness" className="debug-menu__label">
                DELAY_MULTIPLIER
              </label>
              <input 
                id="debug-chattiness"
                type="number" 
                min="0.1" 
                max="10.0" 
                step="0.1" 
                value={chatMultiplier} 
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setChatMultiplier(val);
                }}
                className="debug-menu__input"
              />
            </div>
          </div>
        </div>
    );
});

export const DebugConsole = ({ 
    zIndex, 
    onFocus, 
    isActive, 
    onClose,
    isMinimized,
    onMinimizeToggle,
    initialPos = { x: 50, y: 400 },
    initialSize = { width: 500, height: 400 },
    chatMultiplier = 1,
    setChatMultiplier = () => {},
    isPoppedOut,
    onPopOutToggle,
    isSnappedMain,
    onSnapMainToggle
}: { 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void,
    initialPos?: { x: number, y: number },
    initialSize?: { width: number, height: number },
    chatMultiplier?: number,
    setChatMultiplier?: (val: number) => void,
    isPoppedOut?: boolean,
    onPopOutToggle?: () => void,
    isSnappedMain?: boolean,
    onSnapMainToggle?: () => void
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
      const container = scrollRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [logs]);

  return (
    <Pane
      id="debug"
      title="SYSTEM_DEBUG_MENU"
      icon={<BugIcon />}
      initialPos={initialPos}
      initialSize={initialSize}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
      isPoppedOut={isPoppedOut}
      onPopOutToggle={onPopOutToggle}
      isSnappedMain={isSnappedMain}
      onSnapMainToggle={onSnapMainToggle}
    >
      <div className="debug-menu">
        <DebugMenuControls 
            chatMultiplier={chatMultiplier} 
            setChatMultiplier={setChatMultiplier} 
        />

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
      </div>
    </Pane>
  );
};
