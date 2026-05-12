// Log generation worker
const KERNEL_LOGS: Record<string, string[]> = {
    NOMINAL: [
        'kernel: [ 1000.001] audit: enabled=1 entries=0',
        'systemd[1]: Starting Periodic Command Scheduler...',
        'kernel: [ 1005.122] random: crng init done',
        'systemd[1]: Reached target Timers.',
        'kernel: [ 1010.441] x86/fpu: Supporting XSAVE feature 0x001',
        'systemd[1]: Started Disk Manager.',
        'kernel: [ 1015.882] input: Power Button as /devices/LNXSYSTM:00/LNXPWRBN:00',
        'kernel: [ 1020.112] ACPI: AC Adapter [AC] (on-line)',
        'systemd[1]: Reached target Path Units.',
        'kernel: [ 1025.441] usb 1-1: new high-speed USB device number 2',
        'systemd[1]: Reached target Basic System.',
        'kernel: [ 1030.121] EXT4-fs (sda1): re-mounted. Opts: errors=remount-ro',
        'kernel: [ 1035.552] thermal LNXTHERM:00: registered as thermal_zone0',
        'systemd[1]: Reached target Network.',
        'kernel: [ 1040.119] Generic FE-GE Realtek PHY r8169-0-100:00: attached PHY driver',
        'systemd[1]: Started Network Time Synchronization.',
        'kernel: [ 1045.221] bridge: filtering Ethernet packets on virtual bridge',
        'systemd[1]: Reached target Multi-User System.'
    ],
    P3: [
        'kernel: [ 2000.112] sda1: write-back cache enabled',
        'kernel: [ 2005.441] EXT4-fs warning: checktime reached',
        'systemd-journald[42]: Vacuunming done, freed 0 bytes',
        'kernel: [ 2010.882] TCP: request_sock_TCP: Possible SYN flooding on port 80. Sending cookies.',
        'kernel: [ 2015.121] CPU3: Core temperature above threshold, cpu clock throttled',
        'kernel: [ 2020.552] traps: nginx[1244] general protection fault ip:5588 sp:7ffd error:0',
        'systemd[1]: nginx.service: Main process exited, code=killed, status=11/SEGV',
        'systemd[1]: nginx.service: Scheduled restart job, restart counter is at 1.',
        'kernel: [ 2025.119] nf_conntrack: table full, dropping packet',
        'kernel: [ 2030.221] device eth0 entered promiscuous mode'
    ],
    P1: [
        'kernel: [ 5000.112] CRITICAL: Buffer I/O error on dev sda1, logical block 0',
        'kernel: [ 5005.441] EXT4-fs error (device sda1): ext4_journal_check_start:56: Detected aborted journal',
        'kernel: [ 5010.882] Remounting filesystem read-only',
        'systemd[1]: systemd-hostnamed.service: Failed with result \'exit-code\'.',
        'kernel: [ 5015.121] Out of memory: Kill process 1422 (postgres) score 942 or sacrifice child',
        'kernel: [ 5020.552] KERNEL PANIC: corrupted stack end detected inside scheduler',
        'systemd[1]: dbus.service: Failed with result \'oom-kill\'.',
        'kernel: [ 5025.119] sd 0:0:0:0: [sda] UNKNOWN(0x2003) Result: hostbyte=0x00 driverbyte=0x08',
        'kernel: [ 5030.221] blk_update_request: I/O error, dev sda, sector 2048 op 0x0:(READ) flags 0x0 phys_seg 1 prio class 0'
    ],
    P0: [
        'kernel: [ 9000.112] FATAL: INVALID_OPCODE at 0x0000000000000000',
        'kernel: [ 9005.441] CPU0: Machine Check Exception: 5 Bank 4: b200000000070f0f',
        'kernel: [ 9010.882] TSC DEADLINE: LAPIC timer periodic frequency changed',
        'kernel: [ 9015.121] HARD LOCKUP ON CPU 2',
        'kernel: [ 9020.552] STACK DUMP FOLLOWS:',
        'kernel: [ 9021.001]  [<ffffffff81001234>] ? dump_stack+0x5c/0x78',
        'kernel: [ 9021.002]  [<ffffffff81005678>] ? panic+0xe4/0x24d',
        'kernel: [ 9025.119] MEMORY_CORRUPTION_DETECTED: Base Address 0xDEADC0DE',
        'kernel: [ 9030.221] SYSTEM_HALTED: REBOOT_REQUIRED',
        'kernel: [ 9035.000] EMERGENCY_EXTRACTION_PROTOCOL_ENGAGED'
    ]
};

let interval: number | null = null;

self.onmessage = (e: MessageEvent) => {
    const { type, severity, multiplier = 1 } = e.data;

    if (type === 'START') {
        if (interval) {
            clearInterval(interval);
        }
        
        const baseDelay = severity === 'P0' ? 100 : severity === 'P1' ? 400 : severity === 'P3' ? 1200 : 2500;
        const delay = baseDelay * multiplier;
        
        interval = self.setInterval(() => {
            const pool = KERNEL_LOGS[severity] || KERNEL_LOGS.NOMINAL;
            let log = pool[Math.floor(Math.random() * pool.length)];
            
            let overrideToken = null;
            // 10% chance to inject a diagnostic token during high severity
            if ((severity === 'P1' || severity === 'P0') && Math.random() < 0.1) {
                const token = Math.random().toString(36).substring(2, 7).toUpperCase();
                log = `[AUTH] REQUIRED_DIAGNOSTIC_TOKEN: ${token}`;
                overrideToken = token;
            }

            let spike = null;
            if (log.includes('Out of memory') || log.includes('oom-kill') || log.includes('MEMORY_CORRUPTION')) {
                spike = { metric: 'ram', target: 28 + Math.random() * 4, duration: 6000 };
            } else if (log.includes('CPU') || log.includes('HARD LOCKUP') || log.includes('FATAL') || log.includes('PANIC')) {
                spike = { metric: 'cpu', target: 95 + Math.random() * 5, duration: 8000 };
            }

            self.postMessage({ type: 'LOG', log, spike, overrideToken });
        }, delay);
    }

    if (type === 'STOP') {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }
};
