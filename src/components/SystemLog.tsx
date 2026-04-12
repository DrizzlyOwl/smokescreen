import { useEffect, useState, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { LogsIcon } from './Icons';
import type { Severity } from '../data/incidents';
import { Pane } from './Pane';
import { useSync } from '../hooks/useSync';
import LogWorker from '../utils/logWorker?worker';
import '../styles/SystemLog.scss';

export const SystemLog = ({ 
    severity, 
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
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    uplinkId: string, 
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
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = new LogWorker();
        
        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'LOG') {
                const newLog = e.data.log;
                setLogs(prev => [...prev, newLog].slice(-200));
                send({ type: 'LOG_MESSAGE', log: newLog });
            }
        };

        const handleInjectLog = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            const newLog = customEvent.detail;
            setLogs(prev => [...prev, newLog].slice(-200));
            send({ type: 'LOG_MESSAGE', log: newLog });
        };
        window.addEventListener('INJECT_LOG', handleInjectLog);

        return () => {
            window.removeEventListener('INJECT_LOG', handleInjectLog);
            workerRef.current?.terminate();
        };
    }, [send]);

    useEffect(() => {
        workerRef.current?.postMessage({ type: 'START', severity });
    }, [severity]);

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
          <Virtuoso
            className={`system-log ${isP0 ? 'system-log--p0' : ''}`}
            data={logs}
            followOutput="smooth"
            itemContent={(_index, log) => (
              <div className="system-log__entry">
                <span className={getLogClass(log)}>
                  {log}
                </span>
              </div>
            )}
          />
        </Pane>
    );
};
