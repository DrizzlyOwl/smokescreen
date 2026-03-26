import { useEffect, useState, useRef } from 'react';
import type { Severity } from '../data/excuses';
import { Pane } from './Pane';

const KERNEL_LOGS: Record<Severity, string[]> = {
    NOMINAL: [
        'kernel: [ 1000.001] audit: enabled=1 entries=0',
        'systemd[1]: Starting Periodic Command Scheduler...',
        'kernel: [ 1005.122] random: crng init done',
        'systemd[1]: Reached target Timers.',
        'kernel: [ 1010.441] x86/fpu: Supporting XSAVE feature 0x001',
        'systemd[1]: Started Disk Manager.',
        'kernel: [ 1015.882] input: Power Button as /devices/LNXSYSTM:00/LNXPWRBN:00',
        'systemd[1]: Reached target Paths.'
    ],
    P3: [
        'kernel: [ 1042.003] EXT4-fs (sda1): re-mounted. Opts: errors=remount-ro',
        'systemd[1]: Starting Network Time Synchronization...',
        'dockerd[1204]: container=a83b2f level=info msg="ignoring event" module=libcontainerd',
        'systemd[1]: Reached target Multi-User System.',
        'systemd-networkd[401]: eth0: Gained IPv6LL',
        'systemd-resolved[399]: Clock change detected. Flushing caches.',
        'kernel: [ 1075.221] device-mapper: table: 253:0: linear: Device lookup failed',
        'systemd[1]: Serial Terminal on ttyS0 Service was skipped because of an unmet condition check'
    ],
    P1: [
        'kernel: [ 1045.122] pcieport 0000:00:1c.0: AER: Corrected error received',
        'kernel: [ 1050.884] TCP: request_sock_TCP: Possible SYN flooding on port 80. Sending cookies.',
        'sshd[4922]: Connection closed by authenticating user root 192.168.1.104 [preauth]',
        'dockerd[1204]: level=error msg="Handler for POST /containers/create resubmitted"',
        'kernel: [ 1070.112] audit: type=1400 audit(16251234.122:42): apparmor="DENIED" operation="open"',
        'kernel: [ 1080.001] watchdog: BUG: soft lockup - CPU#2 stuck for 22s!',
        'kernel: [ 1085.442] Out of memory: Killed process 1204 (dockerd) total-vm:4234kB, anon-rss:123kB',
        'kernel: [ 1090.112] traps: systemd-journal[402] general protection fault ip:7f3b8e sp:7ffe32'
    ],
    P0: [
        'kernel: [ 1100.002] thermal thermal_zone0: critical temperature reached (102 C), shutting down',
        'kernel: [ 1105.441] x86/split lock detection: #AC: systemd/1 took a split lock',
        'kernel: [ 1110.882] PANIC: double fault, error_code:0x0, ip:ffffffff8100',
        'kernel: [ 1115.331] Call Trace: <IRQ> dump_stack+0x5c/0x80',
        'kernel: [ 1120.001] ---[ end Kernel panic - not syncing: Fatal exception in interrupt ]---',
        'kernel: [ 1125.442] CRITICAL: Memory corruption detected at address 0x0000000000000',
        'kernel: [ 1130.112] FATAL: I/O error, dev sda, sector 2048 op 0x1:(WRITE) flags 0x800',
        'kernel: [ 1135.221] emergency_restart: Emergency restart in 5 seconds'
    ]
};

export const SystemLog = ({ severity, zIndex, onFocus, isActive }: { severity: Severity, zIndex: number, onFocus: () => void, isActive: boolean }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current && scrollRef.current.parentElement) {
            scrollRef.current.parentElement.scrollTop = scrollRef.current.parentElement.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        const delay = severity === 'P0' ? 100 : severity === 'P1' ? 400 : severity === 'P3' ? 1200 : 2500;
        const interval = setInterval(() => {
            setLogs(prev => {
                const pool = KERNEL_LOGS[severity];
                const newLog = pool[Math.floor(Math.random() * pool.length)];
                return [...prev, newLog].slice(-200);
            });
        }, delay);
        return () => clearInterval(interval);
    }, [severity]);

    const isP0 = severity === 'P0';

    return (
        <Pane
          title="TAILING: /VAR/LOG/KERN.LOG"
          icon="#"
          iconColor={isP0 ? 'var(--terminal-red)' : 'var(--terminal-green)'}
          initialPos={{ x: 300, y: 150 }}
          initialSize={{ width: 500, height: 400 }}
          zIndex={zIndex}
          onFocus={onFocus}
          isActive={isActive}
          severityColor={isP0 ? 'var(--terminal-red)' : undefined}
        >
          <div 
            ref={scrollRef}
            style={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: isP0 ? 'var(--terminal-red)' : 'rgba(24, 255, 98, 0.9)',
              background: 'rgba(0, 5, 0, 0.95)',
              padding: '8px',
              minHeight: '100%',
              boxSizing: 'border-box'
            }}>
            {logs.map((log, i) => (
              <div key={i} style={{ whiteSpace: 'nowrap', marginBottom: '2px' }}>
                <span style={{ 
                  color: log.includes('PANIC') || log.includes('FATAL') || log.includes('CRITICAL') || log.includes('shutt down') 
                      ? '#ff3b3b' 
                      : log.includes('error') || log.includes('BUG') || log.includes('failed')
                      ? 'var(--terminal-amber)'
                      : 'inherit',
                  fontWeight: log.includes('PANIC') ? 'bold' : 'normal'
                }}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </Pane>
    );
};
