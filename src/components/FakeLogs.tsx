import { useEffect, useState } from 'react';
import type { Severity } from '../data/excuses';

const LOG_POOLS: Record<Severity, string[]> = {
  NOMINAL: [
    'INFO: System heartbeat nominal',
    'INFO: Load balancer health check: 200 OK',
    'DEBUG: CronJob sync completed successfully',
    'INFO: All nodes reporting healthy',
    'DEBUG: Cache warmup in progress (12%)',
    'INFO: TCP keep-alive probe sent',
    'DEBUG: Log rotation executed',
    'INFO: S3 endpoint connectivity confirmed',
    'DEBUG: Prometheus metric collection active'
  ],
  P3: [
    'INFO: Attempting leader election...',
    'DEBUG: Rotating logs for /var/log/syslog',
    'INFO: Synchronizing state with peer 10.0.4.12',
    'DEBUG: Garbage collection finished in 42ms',
    'INFO: New worker node joined the cluster',
    'DEBUG: Heartbeat received from sentinel-01',
    'INFO: Certificate renewal successful',
    'DEBUG: Cache invalidation triggered for /api/v1/meta',
    'INFO: Metric scraper reporting nominal values',
    'DEBUG: Buffer cleared for log router'
  ],
  P1: [
    'WARN: High memory pressure detected on node-ak-42',
    'ERROR: Connection refused by peer (10.0.4.15)',
    'WARN: BGP prefix flapping in US-EAST-1',
    'ERROR: EKS API server timeout (retry 3/5)',
    'WARN: Slow response times from downstream dependency',
    'ERROR: Vault token renewal failed - retrying',
    'WARN: Disk usage at 85% on /var/lib/docker',
    'ERROR: Failed to mount persistent volume vol-0a3f',
    'WARN: Packet loss detected on eth0',
    'ERROR: SQL deadlock during transaction'
  ],
  P0: [
    'CRITICAL: Vault token expired. Access denied.',
    'FATAL: Segmental fault in kernel space (0x004F32)',
    'CRITICAL: TOTAL DATA CORRUPTION ON PRIMARY SHARD',
    'FATAL: STACK SHUTDOWN INITIATED BY KERNEL PANIC',
    'CRITICAL: 100% PACKET LOSS DETECTED ON INGRESS',
    'FATAL: ROOT COMPROMISE DETECTED - REVOKING ALL',
    'CRITICAL: DATABASE IS IN READ-ONLY MODE',
    'FATAL: POWER LOSS IN RACK C - FAILOVER FAILED',
    'CRITICAL: BGP SESSION DROPPED - REGION BLACKOUT',
    'FATAL: RECURSIVE DELETE DETECTED ON RDS STAGING'
  ]
};

export const FakeLogs = ({ severity }: { severity: Severity }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Velocity increases with severity
    const delay = severity === 'P0' ? 80 : severity === 'P1' ? 150 : severity === 'P3' ? 300 : 800;

    const interval = setInterval(() => {
      setLogs((prev) => {
        const pool = LOG_POOLS[severity];
        const newLog = `[${new Date().toLocaleTimeString('en-GB')}] ${pool[Math.floor(Math.random() * pool.length)]}`;
        return [...prev, newLog].slice(-40);
      });
    }, delay);
    return () => clearInterval(interval);
  }, [severity]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.15,
      overflow: 'hidden',
      pointerEvents: 'none',
      fontSize: '1rem',
      padding: '20px',
      color: severity === 'P0' ? 'var(--terminal-red)' : severity === 'P1' ? 'var(--terminal-amber)' : 'var(--terminal-green)',
      zIndex: 0,
      transition: 'color 0.5s ease'
    }}>
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: '2px' }}>{log}</div>
      ))}
    </div>
  );
};
