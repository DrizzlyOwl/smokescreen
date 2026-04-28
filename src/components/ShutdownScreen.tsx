import { useState, useEffect, useMemo } from 'react';

export const ShutdownScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const shutdownLogs = useMemo(() => [
    'SIGTERM RECEIVED. INITIALIZING SHUTDOWN SEQUENCE...',
    'SAVING PERSISTENT DATA TO LOCAL_STORAGE... [OK]',
    'TERMINATING CLOUD_JARGON_ENGINE... [OK]',
    'CLOSING SECURE CONNECTION CHANNELS... [OK]',
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
    <div className="boot-screen">
      <div className="boot-screen__content">
        {visibleLines.map((line, i) => (
          <div key={i} className="boot-screen__line">
            {line ? `> ${line}` : ''}
          </div>
        ))}
        {index < shutdownLogs.length && (
          <span className="boot-screen__cursor" />
        )}
      </div>
      
      {index >= shutdownLogs.length && (
        <div className="boot-screen__footer">
          CONNECTION_LOST
        </div>
      )}
    </div>
  );
};
