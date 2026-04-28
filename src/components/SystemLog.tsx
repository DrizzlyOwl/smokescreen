import { useEffect, useState, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { LogsIcon } from './Icons';
import type { Severity } from '../data/incidents';
import { Pane } from './Pane';
import { useSync } from '../hooks/useSync';
import { useIncidentStore } from '../store/useIncidentStore';
import LogWorker from '../utils/logWorker?worker';
import '../styles/SystemLog.scss';

export const SystemLog = ({ 
    severity, 
    logMultiplier,
    terminalId,
    zIndex, 
    onFocus, 
    isActive, 
    onClose, 
    isMinimized, 
    onMinimizeToggle,
    initialPos = { x: 300, y: 150 },
    initialSize = { width: 500, height: 400 },
    isPoppedOut,
    onPopOutToggle,
    isSnappedMain,
    onSnapMainToggle
}: { 
    severity: Severity, 
    logMultiplier: number,
    terminalId: string, 
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
    const [logs, setLogs] = useState<string[]>([]);
    const { send } = useSync();
    const isPaused = useIncidentStore(state => state.isPaused);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (!workerRef.current) {
            workerRef.current = new LogWorker();
            
            workerRef.current.onmessage = (e) => {
                if (e.data.type === 'LOG') {
                    if (isPaused) return;
                    const { log: newLog, spike } = e.data;
                    setLogs(prev => [...prev, newLog].slice(-200));
                    send({ type: 'LOG_MESSAGE', log: newLog });

                    if (spike) {
                        window.dispatchEvent(new CustomEvent('METRIC_SPIKE', { detail: spike }));
                    }
                }
            };
        }

        workerRef.current.postMessage({ type: 'START', severity, multiplier: logMultiplier });

        const handleInjectLog = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const newLog = customEvent.detail;
            setLogs(prev => [...prev, newLog].slice(-200));
            send({ type: 'LOG_MESSAGE', log: newLog });
        };
        window.addEventListener('INJECT_LOG', handleInjectLog);

        return () => {
            window.removeEventListener('INJECT_LOG', handleInjectLog);
        };
    }, [severity, send, logMultiplier, isPaused, terminalId]);

    useEffect(() => {
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    const isP0 = severity === 'P0';

    const getLogClass = (log: string) => {
        if (log.includes('PANIC')) return 'system-log__content--panic';
        if (log.includes('FATAL') || log.includes('CRITICAL') || log.includes('shutt down')) return 'system-log__content--critical';
        if (log.includes('error') || log.includes('BUG') || log.includes('failed')) return 'system-log__content--warning';
        return '';
    };

    return (
        <Pane
          id="logs"
          title="TAILING: /VAR/LOG/KERN.LOG"
          icon={<LogsIcon />}
          iconColor={isP0 ? 'var(--terminal-red)' : 'var(--terminal-green)'}
          initialPos={initialPos}
          initialSize={initialSize}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          isMinimized={isMinimized}
          onMinimizeToggle={onMinimizeToggle}
          severityColor={isP0 ? 'var(--terminal-red)' : undefined}
          onClose={onClose}
          isPoppedOut={isPoppedOut}
          onPopOutToggle={onPopOutToggle}
          isSnappedMain={isSnappedMain}
          onSnapMainToggle={onSnapMainToggle}
        >
          <div className="system-log-wrapper" style={{ flex: 1, height: '100%', minHeight: 0 }}>
            <Virtuoso
              className={`system-log ${isP0 ? 'system-log--p0' : ''}`}
              data={logs}
              totalCount={logs.length}
              followOutput={(isAtBottom) => {
                if (isAtBottom) return 'smooth';
                return false;
              }}
              alignToBottom
              itemContent={(_index, log) => (
                <div className="system-log__entry">
                  <span className={getLogClass(log)}>
                    {log}
                  </span>
                </div>
              )}
            />
          </div>
        </Pane>
    );
};
