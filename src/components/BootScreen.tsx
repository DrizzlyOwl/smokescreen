import { useState, useEffect, useMemo } from 'react';

const LOGO_ART = [
  '  ___ __ __  __  _  _____ ___  ___ ___  ___ ___ _ _ ',
  ' / __|  V  |/  \\| |/ | __/ __|/ __| _ \\ __| __| \\ |',
  ' \\__ \\ \\_/ | () |   <| _|\\__ \\ (__|   / _|| _|| . |',
  ' |___/_| |_|\\__/|_|\\_\\___|___/\\___|_|_\\___|___|_|\\_|',
  '',
  '----------------------------------------------------'
];

interface NavigatorUAData {
  getHighEntropyValues: (hints: string[]) => Promise<{
    architecture?: string;
    model?: string;
    platform?: string;
    platformVersion?: string;
    fullVersionList?: Array<{ brand: string; version: string }>;
  }>;
}

interface HIDDevice {
  productName: string;
}

interface ExtendedNavigator extends Navigator {
  userAgentData?: NavigatorUAData;
  deviceMemory?: number;
  hid?: {
    getDevices: () => Promise<HIDDevice[]>;
  };
}

interface HardwareIntelligence {
    cpuCores: number;
    ramGB: number;
    platform: string;
    hidDevices: string[];
    gpu?: string;
    timezone: string;
}

export const BootScreen = ({ operatorName, uplinkId, onComplete, playPostBeep }: { operatorName: string, uplinkId: string, onComplete: () => void, playPostBeep: () => void }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [memoryKB, setMemoryKB] = useState(0);
  const [isMemoryChecking, setIsMemoryChecking] = useState(false);
  
  const nav = navigator as ExtendedNavigator;

  const [hardware, setHardware] = useState<HardwareIntelligence>({
    cpuCores: nav.hardwareConcurrency || 4,
    ramGB: nav.deviceMemory || 8,
    platform: nav.platform || 'UNKNOWN_X64',
    hidDevices: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  // Gather high-entropy hardware data
  useEffect(() => {
    const gatherIntel = async () => {
        const intel: Partial<HardwareIntelligence> = {
            cpuCores: nav.hardwareConcurrency,
            ramGB: nav.deviceMemory,
            platform: nav.platform
        };

        if (nav.userAgentData?.getHighEntropyValues) {
            try {
                const values = await nav.userAgentData.getHighEntropyValues(['architecture', 'model', 'platformVersion', 'fullVersionList']);
                intel.platform = `${values.platform} ${values.architecture} ${values.model || ''}`.trim();
            } catch { /* Fallback */ }
        }

        if (nav.hid) {
            try {
                const devices = await nav.hid.getDevices();
                intel.hidDevices = devices.map((d) => d.productName);
            } catch { /* HID blocked */ }
        }

        setHardware(prev => ({ ...prev, ...intel }));
    };

    gatherIntel();
  }, [nav]);

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
    ...LOGO_ART,
    '',
    'SMOKESCREEN-BIOS v1.0.42 (C) 1984 SRE_CORP',
    `CPU: ${hardware.platform.toUpperCase()} @ ${hardware.cpuCores} CORES`,
    'SYSTEM_MEM_CHECK',
    'SYSTEM_KB_PROBE',
    'SYSTEM_DISK_PROBE',
    '',
    easterEgg,
    'INITIALIZING SYSTEM DEFAULTS...',
    'LOADING CLOUD JARGON MODULES... [DONE]',
    'CONNECTING TO CENTRAL SECURE NODE... [OK]',
    `SIGNALLING_ROOM_ID: ${uplinkId}... [ACTIVE]`,
    'MOUNTING /VAR/LOG/KERN.LOG... [OK]',
    'ESTABLISHING WAR ROOM UPLINK... [CONNECTED]',
    '',
    'WELCOME TO SMOKESCREEN OS v4.5',
    `USER: ${operatorName.toUpperCase()}`,
    `REGION: ${hardware.timezone.toUpperCase()}`,
    'STATUS: NOMINAL',
    '',
    'SYSTEM READY.',
    'SYSTEM_POST_BEEP'
  ], [operatorName, uplinkId, easterEgg, hardware]);

  useEffect(() => {
    if (index >= logs.length || isMemoryChecking) return;

    const line = logs[index];
    
    if (line === 'SYSTEM_MEM_CHECK') {
      if (memoryKB === 0) {
        const timer = setTimeout(() => setIsMemoryChecking(true), 0);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (line === 'SYSTEM_KB_PROBE') {
      const timer = setTimeout(() => {
          const deviceLabel = hardware.hidDevices.length > 0 
            ? `HID: ${hardware.hidDevices[0].toUpperCase()}`
            : 'KEYBOARD: DETECTED (101-KEY)';
          setVisibleLines(prev => [...prev, `${deviceLabel} [OK]`]);
          setIndex(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }

    if (line === 'SYSTEM_DISK_PROBE') {
      const timer = setTimeout(() => {
          setVisibleLines(prev => [
              ...prev, 
              'FDD A: 1.44MB 3.5-INCH [OK]',
              'HDD 0: QUANTUM FIREBALL 1.2GB [OK]'
          ]);
          setIndex(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }

    if (line === 'SYSTEM_POST_BEEP') {
        const timer = setTimeout(() => {
            playPostBeep();
            setTimeout(() => onComplete(), 800);
        }, 500);
        return () => clearTimeout(timer);
    }

    const isLogoPart = index < LOGO_ART.length;
    const delay = isLogoPart ? 50 : Math.random() * 200 + 100;
    
    const timeout = setTimeout(() => {
      setVisibleLines(prev => [...prev, logs[index]]);
      setIndex(prev => prev + 1);
    }, delay);
    return () => clearTimeout(timeout);
  }, [index, logs, isMemoryChecking, memoryKB, hardware.hidDevices, playPostBeep, onComplete]);

  // Memory check animation
  useEffect(() => {
    if (!isMemoryChecking) return;

    const targetMem = Math.floor(hardware.ramGB * 1024);

    const interval = setInterval(() => {
      setMemoryKB(prev => {
        const increment = Math.floor(Math.random() * (targetMem / 20)) + Math.floor(targetMem / 50);
        const next = prev + increment;
        
        if (next >= targetMem) {
          clearInterval(interval);
          setIsMemoryChecking(false);
          setVisibleLines(prevLines => [...prevLines, `MEMORY CHECK: ${targetMem}KB OK`]);
          setIndex(prevIdx => prevIdx + 1);
          return targetMem;
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isMemoryChecking, hardware.ramGB]);

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
      <div style={{ textShadow: '0 0 10px var(--terminal-green)', whiteSpace: 'pre' }}>
        {visibleLines.map((line, i) => (
          <div key={i} style={{ marginBottom: '5px', minHeight: '1.2em' }}>
            {['SYSTEM_MEM_CHECK', 'SYSTEM_KB_PROBE', 'SYSTEM_DISK_PROBE', 'SYSTEM_POST_BEEP'].includes(line) 
                ? null 
                : (line ? (LOGO_ART.includes(line) || line === '----------------------------------------------------' ? line : `> ${line}`) : '')}
          </div>
        ))}
        {isMemoryChecking && (
            <div style={{ marginBottom: '5px', minHeight: '1.2em' }}>
                {`> MEMORY CHECK: ${memoryKB}KB`}
            </div>
        )}
        {(index < logs.length || isMemoryChecking) && (
          <span style={{ 
            display: 'inline-block', 
            width: '10px', 
            height: '1.2rem', 
            backgroundColor: 'var(--terminal-green)',
            animation: 'flicker 0.1s infinite',
            verticalAlign: 'middle'
          }} />
        )}
      </div>
      
      {index >= logs.length && !isMemoryChecking && (
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
