import { useState, useEffect, useMemo } from 'react';

export const BootScreen = ({ operatorName, uplinkId, onComplete }: { operatorName: string, uplinkId: string, onComplete: () => void }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const [easterEgg] = useState(() => {
    const eggs = [
        'SEARCHING FOR RED OCTOBER... [NOT FOUND]',
        'DECRYPTING ENIGMA STREAM... [SUCCESS]',
        'LOCATING FLUX CAPACITOR... [OFFLINE]',
        'DIVIDING BY ZERO... [ERROR_PROTECTED]',
        'OPTIMIZING VIBES... [MAXIMAL]',
        'RETICULATING SPLINES...',
        'COMPILING CLOUD-NATIVE COFFEE... [DONE]',
        'BYPASSING THE MAINFRAME FIREWALL... [OK]',
        'INITIALIZING SKOBO-CHIP... [STABLE]',
        'RECALIBRATING PARSECS... [DONE]'
    ];
    return eggs[Math.floor(Math.random() * eggs.length)];
  });

  const logs = useMemo(() => [
    'SMOKESCREEN-BIOS v1.0.42 (C) 1984 DXW',
    'CPU: MOS TECHNOLOGY 6502 @ 1.02 MHZ',
    'MEMORY CHECK: 640KB OK',
    '',
    easterEgg,
    'INITIALIZING SYSTEM DEFAULTS...',
    'LOADING CLOUD JARGON MODULES... [DONE]',
    'CONNECTING TO DXW SECURE NODE... [OK]',
    `SIGNALLING_ROOM_ID: ${uplinkId}... [ACTIVE]`,
    'MOUNTING /VAR/LOG/KERN.LOG... [OK]',
    'ESTABLISHING WAR ROOM UPLINK... [CONNECTED]',
    '',
    'WELCOME TO SMOKESCREEN OS v4.5',
    `USER: ${operatorName.toUpperCase()}`,
    'STATUS: NOMINAL',
    '',
    'SYSTEM READY.'
  ], [operatorName, uplinkId, easterEgg]);

  useEffect(() => {
    if (index < logs.length) {
      const timeout = setTimeout(() => {
        setVisibleLines(prev => [...prev, logs[index]]);
        setIndex(prev => prev + 1);
      }, Math.random() * 200 + 100);
      return () => clearTimeout(timeout);
    } else {
      const finishTimeout = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(finishTimeout);
    }
  }, [index, onComplete, logs]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0a0a0a',
      zIndex: 10000,
      padding: '40px',
      color: 'var(--terminal-green)',
      fontFamily: 'monospace',
      fontSize: 'var(--text-l3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      overflow: 'hidden'
    }}>
      <div className="scanline"></div>
      <div style={{ textShadow: '0 0 10px var(--terminal-green)' }}>
        {visibleLines.map((line, i) => (
          <div key={i} style={{ marginBottom: '5px', minHeight: '1.2em' }}>
            {line ? `> ${line}` : ''}
          </div>
        ))}
        {index < logs.length && (
          <span style={{ 
            display: 'inline-block', 
            width: '10px', 
            height: '1.2rem', 
            backgroundColor: 'var(--terminal-green)',
            animation: 'flicker 0.1s infinite'
          }} />
        )}
      </div>
      
      {index >= logs.length && (
        <div style={{ 
          marginTop: 'auto', 
          textAlign: 'center', 
          opacity: 0.5, 
          fontSize: 'var(--text-l4)',
          animation: 'flicker 0.2s infinite'
        }}>
          DECRYPTING INTERFACE...
        </div>
      )}
    </div>
  );
};
