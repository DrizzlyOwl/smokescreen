import { useState, useEffect, useMemo, useRef } from 'react';
import { getRandomItem } from '../utils/telemetry';
import { MOTD } from './MOTD';

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

export const BootScreen = ({ terminalId, onComplete, playPostBeep }: { terminalId: string, onComplete: () => void, playPostBeep: () => void }) => {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [memoryKB, setMemoryKB] = useState(0);
  const [isMemoryChecking, setIsMemoryChecking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
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
    return getRandomItem(eggs);
  });

  const logs = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const initialLogs = [
        'SMOKESCREEN-BIOS v1.0.42 (C) 1984 SRE_CORP',
        `CPU: ${hardware.platform.toUpperCase()} @ ${hardware.cpuCores} CORES`,
        'SYSTEM_MEM_CHECK',
        'SYSTEM_KB_PROBE',
        'SYSTEM_DISK_PROBE',
        'SYSTEM_MOTD_PAUSE',
        '',
        easterEgg,
        'INITIALIZING SYSTEM DEFAULTS...',
    ];

    if (params.has('sev')) initialLogs.push(`SETTING THREAT LEVEL: ${params.get('sev')?.toUpperCase()}... [DONE]`);
    if (params.has('stack')) initialLogs.push(`PROVISIONING CLOUD STACK: ${params.get('stack')?.toUpperCase()}... [DONE]`);
    if (params.has('theme')) initialLogs.push(`APPLYING UI SCHEMATIC: ${params.get('theme')?.toUpperCase()}... [DONE]`);
    if (params.get('eco') === 'true') initialLogs.push('ECO_MODE: REDUCING POWER DRAW... [OK]');
    if (params.get('debug') === 'true') initialLogs.push('DEBUG_SUBSYSTEM: ATTACHING HOOKS... [OK]');
    if (params.get('audio') === 'true') initialLogs.push('AUDIO_ENGINE: UNMUTING CHANNELS... [OK]');

    
    if (params.has('panes')) {
        const p = params.get('panes')?.split(',') || [];
        p.forEach(pane => {
            if (pane) initialLogs.push(`OPENING PANE: ${pane.toUpperCase()}... [DONE]`);
        });
    }

    return [
        ...initialLogs,
        'LOADING CLOUD JARGON MODULES... [DONE]',
        'CONNECTING TO CENTRAL SECURE NODE... [OK]',
        `SESSION_ID: ${terminalId}... [ACTIVE]`,
        'MOUNTING /VAR/LOG/KERN.LOG... [OK]',
        'ESTABLISHING WAR ROOM CONNECTION... [CONNECTED]',
        '',
        'WELCOME TO SMOKESCREEN OS v5.0',
        `REGION: ${hardware.timezone.toUpperCase()}`,
        'STATUS: NOMINAL',
        '',
        'SYSTEM READY.',
        'SYSTEM_POST_BEEP'
    ];
  }, [terminalId, easterEgg, hardware]);

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

    if (line === 'SYSTEM_MOTD_PAUSE') {
      const timer = setTimeout(() => {
          setIndex(prev => prev + 1);
      }, 3000); // 3 second pause for MOTD reading
      return () => clearTimeout(timer);
    }

    if (line === 'SYSTEM_POST_BEEP') {
        const timer = setTimeout(() => {
            playPostBeep();
            setTimeout(() => onComplete(), 800);
        }, 500);
        return () => clearTimeout(timer);
    }

    const delay = Math.random() * 200 + 100;
    
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

  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleLines, isMemoryChecking]);

  return (
    <div className="boot-screen">
      <MOTD />
      <div className="boot-screen__content">
        {visibleLines.map((line, i) => (
          <div key={i} className="boot-screen__line">
            {['SYSTEM_MEM_CHECK', 'SYSTEM_KB_PROBE', 'SYSTEM_DISK_PROBE', 'SYSTEM_POST_BEEP', 'SYSTEM_MOTD_PAUSE'].includes(line) 
                ? null 
                : (line ? `> ${line}` : '')}
          </div>
        ))}
        {isMemoryChecking && (
            <div className="boot-screen__line">
                {`> MEMORY CHECK: ${memoryKB}KB`}
            </div>
        )}
        <div ref={bottomRef} />
        {(index < logs.length || isMemoryChecking) && (
          <span className="boot-screen__cursor" />
        )}
      </div>
      
      {index >= logs.length && !isMemoryChecking && (
        <div className="boot-screen__footer">
          DECRYPTING INTERFACE...
        </div>
      )}
    </div>
  );
};
