import React, { useEffect, useState, useRef, memo } from 'react';
import { Button } from './Button';
import { BugIcon, CloseIcon } from './Icons';
import { useSync } from '../hooks/useSync';
import { useAudio } from '../hooks/useAudio';
import { useIncidentStore } from '../store/useIncidentStore';
import '../styles/DebugOverlay.scss';

interface DebugLog {
  timestamp: string;
  action: string;
  data: string;
}

interface DebugOverlayProps {
  isOpen: boolean;
  onClose: () => void;
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
    playSimplePing,
    playSequencePing,
    playDirectPing,
    playLoginChime, 
    playLogoutChime, 
    playPostBeep, 
    playMitigationSuccess,
    playAlert 
  } = useAudio();

  return (
    <div className="debug-overlay__controls">
      <div className="debug-overlay__row">
        <div className="debug-overlay__section">
          <h3 className="debug-overlay__section-title">Log Settings</h3>
          <div className="debug-overlay__field">
            <label htmlFor="debug-logs" className="debug-overlay__label">
              LOG_DELAY_MULTIPLIER
            </label>
            <input 
              id="debug-logs"
              type="number" 
              min="0.1" 
              max="10.0" 
              step="0.1" 
              value={logMultiplier} 
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setLogMultiplier(val);
              }}
              className="debug-overlay__input"
            />
          </div>
        </div>

        <div className="debug-overlay__section">
          <h3 className="debug-overlay__section-title">Chat Settings</h3>
          <div className="debug-overlay__field">
            <label htmlFor="debug-chattiness" className="debug-overlay__label">
              DELAY_MULTIPLIER
            </label>
            <input 
              id="debug-chattiness"
              type="number" 
              min="0.1" 
              max="10.0" 
              step="0.1" 
              value={chatMultiplier} 
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setChatMultiplier(val);
              }}
              className="debug-overlay__input"
            />
          </div>
        </div>
      </div>

      <div className="debug-overlay__section">
        <h3 className="debug-overlay__section-title">Audio Engine Diagnostics</h3>
        <div className="debug-overlay__audio-grid">
          <div className="debug-overlay__audio-group">
            <h4 className="debug-overlay__sub-label">NOTIFICATION_PINGS</h4>
            <div className="debug-overlay__button-row">
              <Button onClick={playSimplePing} size="x-small">SIMPLE</Button>
              <Button onClick={playSequencePing} size="x-small">SEQUENCE</Button>
              <Button onClick={playDirectPing} size="x-small">DIRECT</Button>
              <Button onClick={playPostBeep} size="x-small">POST</Button>
            </div>
          </div>
          <div className="debug-overlay__audio-group">
            <h4 className="debug-overlay__sub-label">SYSTEM_ALERTS</h4>
            <div className="debug-overlay__button-row">
              <Button onClick={() => playAlert('P0')} size="x-small" style={{ color: 'var(--terminal-red)', borderColor: 'var(--terminal-red)' }}>P0</Button>
              <Button onClick={() => playAlert('P1')} size="x-small" style={{ color: 'var(--terminal-amber)', borderColor: 'var(--terminal-amber)' }}>P1</Button>
              <Button onClick={() => playAlert('P3')} size="x-small" style={{ color: 'var(--terminal-cobalt)', borderColor: 'var(--terminal-cobalt)' }}>P3</Button>
            </div>
          </div>
          <div className="debug-overlay__audio-group">
            <h4 className="debug-overlay__sub-label">STATE_CHIMES</h4>
            <div className="debug-overlay__button-row">
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

/**
 * DebugOverlay is a slide-in panel that overlays the current screen.
 * Activated via Ctrl+\ or the `debug` command.
 */
export const DebugOverlay: React.FC<DebugOverlayProps> = ({ isOpen, onClose }) => {
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

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="debug-overlay__backdrop" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div className="debug-overlay" role="dialog" aria-label="Debug Console">
        <div className="debug-overlay__header">
          <div className="debug-overlay__title">
            <BugIcon />
            <span>SYSTEM_DEBUG_MENU</span>
            <span className="debug-overlay__shortcut">[^\]</span>
          </div>
          <button 
            className="debug-overlay__close"
            onClick={onClose}
            title="Close debug panel"
          >
            <CloseIcon />
          </button>
        </div>

        <DebugMenuControls 
          chatMultiplier={chatMultiplier} 
          setChatMultiplier={setChatMultiplier} 
          logMultiplier={logMultiplier}
          setLogMultiplier={setLogMultiplier}
        />

        <div 
          ref={scrollRef}
          className="debug-overlay__logs"
        >
          {logs.length === 0 && (
            <div className="debug-overlay__idle">AWAITING_SYSTEM_HOOKS...</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="debug-overlay__entry">
              <span className="debug-overlay__timestamp">[{log.timestamp}]</span>
              <span className="debug-overlay__action">{log.action}</span>
              <span className="debug-overlay__data">{log.data}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
