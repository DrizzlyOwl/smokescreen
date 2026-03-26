import { useEffect, useState, useRef } from 'react';
import type { Severity } from '../data/excuses';
import { Pane } from './Pane';

interface PodStatus {
  name: string;
  status: 'Running' | 'CrashLoopBackOff' | 'ImagePullBackOff' | 'Terminating' | 'Pending' | 'Error';
  restarts: number;
  age: string;
}

const POD_NAMES = [
  'api-gateway', 'auth-service', 'payment-processor', 'user-profile', 
  'redis-master', 'postgres-0', 'worker-pool-a', 'worker-pool-b',
  'search-indexer', 'notification-engine', 'billing-sync', 'audit-logger'
];

export const DeploymentStatus = ({ severity, zIndex, onFocus, isActive }: { severity: Severity, zIndex: number, onFocus: () => void, isActive: boolean }) => {
  const [pods, setPods] = useState<PodStatus[]>([]);
  const [tfLog, setTfLog] = useState<string[]>([]);
  const tfScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tfScrollRef.current) {
        tfScrollRef.current.scrollTop = tfScrollRef.current.scrollHeight;
    }
  }, [tfLog]);

  useEffect(() => {
    // Initial pods
    setPods(POD_NAMES.map(name => ({
      name: `${name}-${Math.random().toString(36).substring(2, 7)}`,
      status: 'Running',
      restarts: 0,
      age: '12d'
    })));
  }, []);

  useEffect(() => {
    const updatePods = () => {
      setPods(prev => prev.map(pod => {
        if (severity === 'NOMINAL') return { ...pod, status: 'Running', restarts: 0 };
        
        const chance = severity === 'P0' ? 0.6 : severity === 'P1' ? 0.2 : 0.05;
        if (Math.random() < chance) {
          const statuses: PodStatus['status'][] = severity === 'P0' 
            ? ['CrashLoopBackOff', 'Error', 'Terminating'] 
            : ['CrashLoopBackOff', 'ImagePullBackOff', 'Pending'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { 
            ...pod, 
            status: newStatus, 
            restarts: pod.restarts + (newStatus === 'CrashLoopBackOff' ? 1 : 0),
            age: severity === 'P0' ? '1s' : '2m'
          };
        }
        return pod;
      }));
    };

    updatePods();
    const interval = setInterval(updatePods, 3000);
    return () => clearInterval(interval);
  }, [severity]);

  useEffect(() => {
    const addLog = () => {
      if (severity === 'NOMINAL') {
        setTfLog([]);
        return;
      }

      const p0Logs = [
        `Error: Failed to delete subnet: DependencyViolation`,
        `CRITICAL: AWS Region us-east-1 is unreachable`,
        `Error: Resource 'aws_db_instance.main' is in state 'DELETING'`,
        `FATAL: Remote state file is corrupted!`,
        `Error: 403 Forbidden: IAM user lacks 'kms:Decrypt'`
      ];

      const generalLogs = [
        `aws_instance.prod_web[${Math.floor(Math.random() * 3)}]: Still creating... [1m40s elapsed]`,
        `Error: ResourceNode.Apply: error during apply: 1 error occurred:`,
        `* module.vpc.aws_route_table.public[0]: DependencyViolation: Network interface still in use`,
        `Plan: 14 to add, 2 to change, 8 to destroy.`,
        `Warning: Resource targeting is in effect.`,
        `Error: Failed to lock state: Error acquiring the state lock`,
        `Waiting for the plan to be applied...`,
        `Objects have changed outside of Terraform.`,
        `Error: Provider produced inconsistent final plan`
      ];

      const pool = severity === 'P0' ? [...p0Logs, ...generalLogs] : generalLogs;
      setTfLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${pool[Math.floor(Math.random() * pool.length)]}`].slice(-10));
    };

    addLog();
    const interval = setInterval(addLog, severity === 'P0' ? 1000 : 2500);
    return () => clearInterval(interval);
  }, [severity]);

  return (
    <Pane
      title="KUBERNETES_WORKLOAD_STATUS"
      icon="●"
      iconColor={severity === 'P0' ? '#f47067' : '#adbac7'}
      initialPos={{ x: 500, y: 100 }}
      initialSize={{ width: 550, height: 400 }}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      severityColor={severity === 'P0' ? '#f47067' : undefined}
    >
      <div style={{ fontFamily: 'monospace', padding: '12px', boxSizing: 'border-box' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #2d333b', color: '#768390' }}>
              <th style={{ padding: '4px' }}>NAME</th>
              <th style={{ padding: '4px' }}>STATUS</th>
              <th style={{ padding: '4px' }}>RESTARTS</th>
              <th style={{ padding: '4px' }}>AGE</th>
            </tr>
          </thead>
          <tbody>
            {pods.map((pod, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1c2128' }}>
                <td style={{ padding: '4px' }}>{pod.name}</td>
                <td style={{ 
                  padding: '4px', 
                  color: pod.status === 'Running' ? '#57ab5a' : pod.status === 'Pending' ? '#c69026' : '#f47067' 
                }}>
                  {pod.status}
                </td>
                <td style={{ padding: '4px' }}>{pod.restarts}</td>
                <td style={{ padding: '4px' }}>{pod.age}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ background: '#000', padding: '10px', borderRadius: '4px', border: '1px solid #2d333b' }}>
          <div style={{ color: '#768390', marginBottom: '5px', fontSize: '0.7rem' }}>TERRAFORM_APPLY_STDOUT</div>
          <div ref={tfScrollRef} style={{ height: '80px', overflowY: 'auto', fontSize: '0.75rem' }}>
            {tfLog.map((log, i) => (
              <div key={i} style={{ 
                color: log.includes('Error') ? '#f47067' : log.includes('Warning') ? '#c69026' : '#adbac7',
                whiteSpace: 'nowrap'
              }}>
                {log}
              </div>
            ))}
          </div>
        </div>      </div>
    </Pane>
  );
};
