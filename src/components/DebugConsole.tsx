import { useEffect, useState, useRef, memo } from 'react';
import { Pane } from './Pane';
import { Button } from './Button';
import { BugIcon } from './Icons';
import { useSync } from '../hooks/useSync';
import { useAudio } from '../hooks/useAudio';
import { useIncidentStore } from '../store/useIncidentStore';
import '../styles/DebugConsole.scss';

interface DebugLog {
  timestamp: string;
  action: string;
  data: string;
}

const DebugMenuControls = memo(({ 
    chatMultiplier, 
    setChatMultiplier,
    logMultiplier,
    setLogMultiplier
}: { 
    chatMultiplier: number, 
    setChatMultiplier: (val: number) => void,
    logMultiplier: number,
    setLogMultiplier: (val: number) => void
}) => {
    const { 
      playSlackPing, 
      playTeamsPing, 
      playTagPing, 
      playLoginChime, 
      playLogoutChime, 
      playPostBeep, 
      playMitigationSuccess,
      playAlert 
    } = useAudio();

    return (
        <div className="debug-menu__controls">
          <div className="debug-menu__row">
            <div className="debug-menu__section">
              <h3 className="debug-menu__section-title">Log Settings</h3>
              <div className="debug-menu__field">
                <label htmlFor="debug-logs" className="debug-menu__label">
                  LOG_DELAY_MULTIPLIER
                </label>
                <input 
                  id="debug-logs"
                  type="number" 
                  min="0.1" 
                  max="10.0" 
                  step="0.1" 
                  value={logMultiplier} 
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setLogMultiplier(val);
                  }}
                  className="debug-menu__input"
                />
              </div>
            </div>

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

          <div className="debug-menu__section">
            <h3 className="debug-menu__section-title">Audio Engine Diagnostics</h3>
            <div className="debug-menu__audio-grid">
              <div className="debug-menu__audio-group">
                <h4 className="debug-menu__sub-label">NOTIFICATION_PINGS</h4>
                <div className="debug-menu__button-row">
                  <Button onClick={playSlackPing} size="x-small">SLACK</Button>
                  <Button onClick={playTeamsPing} size="x-small">TEAMS</Button>
                  <Button onClick={playTagPing} size="x-small">TAG</Button>
                  <Button onClick={playPostBeep} size="x-small">POST</Button>
                </div>
              </div>
              <div className="debug-menu__audio-group">
                <h4 className="debug-menu__sub-label">SYSTEM_ALERTS</h4>
                <div className="debug-menu__button-row">
                  <Button onClick={() => playAlert('P0')} size="x-small" style={{ color: 'var(--terminal-red)', borderColor: 'var(--terminal-red)' }}>P0</Button>
                  <Button onClick={() => playAlert('P1')} size="x-small" style={{ color: 'var(--terminal-amber)', borderColor: 'var(--terminal-amber)' }}>P1</Button>
                  <Button onClick={() => playAlert('P3')} size="x-small" style={{ color: 'var(--terminal-cobalt)', borderColor: 'var(--terminal-cobalt)' }}>P3</Button>
                </div>
              </div>
              <div className="debug-menu__audio-group">
                <h4 className="debug-menu__sub-label">STATE_CHIMES</h4>
                <div className="debug-menu__button-row">
                  <Button onClick={playLoginChime} size="x-small">LOGIN</Button>
                  <Button onClick={playLogoutChime} size="x-small">LOGOUT</Button>
                  <Button onClick={playMitigationSuccess} size="x-small">SUCCESS</Button>
                </div>
              </div>
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
    isPoppedOut?: boolean,
    onPopOutToggle?: () => void,
    isSnappedMain?: boolean,
    onSnapMainToggle?: () => void
}) => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useSync();
  
  const chatMultiplier = useIncidentStore(state => state.chatMultiplier);
  const logMultiplier = useIncidentStore(state => state.logMultiplier);
  const setChatMultiplier = useIncidentStore(state => state.setChatMultiplier);
  const setLogMultiplier = useIncidentStore(state => state.setLogMultiplier);

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
            logMultiplier={logMultiplier}
            setLogMultiplier={setLogMultiplier}
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
