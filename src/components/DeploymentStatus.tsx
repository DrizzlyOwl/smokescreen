import { useEffect, useState, useRef } from 'react';
import { DeployIcon } from './Icons';
import type { Severity } from '../data/incidents';
import { Pane } from './Pane';
import '../styles/DeploymentStatus.scss';

interface PodStatus {
  name: string;
  status: 'Running' | 'CrashLoopBackOff' | 'ImagePullBackOff' | 'Terminating' | 'Pending' | 'Error';
  restarts: number;
  age: string;
  cpu: string;
  memory: string;
}

const POD_NAMES = [
  'api-gateway', 'auth-service', 'payment-processor', 'user-profile', 
  'redis-master', 'postgres-0', 'worker-pool-a', 'worker-pool-b',
  'search-indexer', 'notification-engine', 'billing-sync', 'audit-logger'
];

export const DeploymentStatus = ({ 
    severity, 
    zIndex, 
    onFocus, 
    isActive, 
    onClose, 
    isMinimized, 
    onMinimizeToggle,
    initialPos = { x: 500, y: 100 },
    initialSize = { width: 550, height: 400 },
    isPoppedOut,
    onPopOutToggle,
    isSnappedMain,
    onSnapMainToggle
}: { 
    severity: Severity, 
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
  const [pods, setPods] = useState<PodStatus[]>(() => POD_NAMES.map(name => ({
    name: `${name}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'Running',
    restarts: 0,
    age: '12d',
    cpu: '12m',
    memory: '128Mi'
  })));
  const [tfLog, setTfLog] = useState<string[]>([]);
  const tfScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tfScrollRef.current) {
        tfScrollRef.current.scrollTop = tfScrollRef.current.scrollHeight;
    }
  }, [tfLog]);

  useEffect(() => {
    const updatePods = () => {
      setPods(prev => prev.map(pod => {
        // Base CPU/Mem simulation
        let cpuVal, memVal;
        
        if (severity === 'NOMINAL') {
          cpuVal = Math.floor(Math.random() * 50) + 10;
          memVal = Math.floor(Math.random() * 100) + 128;
          return { ...pod, status: 'Running', restarts: 0, cpu: `${cpuVal}m`, memory: `${memVal}Mi` };
        }
        
        const chance = severity === 'P0' ? 0.6 : severity === 'P1' ? 0.2 : 0.05;
        
        // Severity-based resource scaling
        const multiplier = severity === 'P0' ? 15 : severity === 'P1' ? 5 : 2;
        cpuVal = Math.floor((Math.random() * 100 + 50) * multiplier);
        memVal = Math.floor((Math.random() * 200 + 200) * (multiplier / 2));

        if (Math.random() < chance) {
          const statuses: PodStatus['status'][] = severity === 'P0' 
            ? ['CrashLoopBackOff', 'Error', 'Terminating'] 
            : ['CrashLoopBackOff', 'ImagePullBackOff', 'Pending'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { 
            ...pod, 
            status: newStatus, 
            restarts: pod.restarts + (newStatus === 'CrashLoopBackOff' ? 1 : 0),
            age: severity === 'P0' ? '1s' : '2m',
            cpu: newStatus === 'Running' ? `${cpuVal}m` : '0m',
            memory: newStatus === 'Running' ? `${memVal}Mi` : '0Mi'
          };
        }
        
        return {
          ...pod,
          cpu: `${cpuVal}m`,
          memory: `${memVal}Mi`
        };
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
      id="deploy"
      title="KUBERNETES_WORKLOAD_STATUS"
      icon={<DeployIcon />}
      iconColor={severity === 'P0' ? 'var(--terminal-red)' : 'var(--terminal-green)'}
      initialPos={initialPos}
      initialSize={initialSize}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      severityColor={severity === 'P0' ? 'var(--terminal-red)' : undefined}
      onClose={onClose}
      isPoppedOut={isPoppedOut}
      onPopOutToggle={onPopOutToggle}
      isSnappedMain={isSnappedMain}
      onSnapMainToggle={onSnapMainToggle}
    >
      <div className="deploy-status">
        <table className="deploy-status__table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>STATUS</th>
              <th>CPU</th>
              <th>MEMORY</th>
              <th>RESTARTS</th>
              <th>AGE</th>
            </tr>
          </thead>
          <tbody>
            {pods.map((pod, i) => (
              <tr key={i}>
                <td>{pod.name}</td>
                <td className={`deploy-status__pod-status ${
                  pod.status === 'Running' ? 'deploy-status__pod-status--running' : 
                  pod.status === 'Pending' ? 'deploy-status__pod-status--pending' : 
                  'deploy-status__pod-status--error'
                }`}>
                  {pod.status}
                </td>
                <td className={parseInt(pod.cpu) > 1000 ? 'deploy-status__metric--critical' : parseInt(pod.cpu) > 400 ? 'deploy-status__metric--warning' : ''}>
                    {pod.cpu}
                </td>
                <td className={parseInt(pod.memory) > 1000 ? 'deploy-status__metric--critical' : parseInt(pod.memory) > 400 ? 'deploy-status__metric--warning' : ''}>
                    {pod.memory}
                </td>
                <td>{pod.restarts}</td>
                <td>{pod.age}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="deploy-status__logs">
          <div className="deploy-status__logs-title">TERRAFORM_APPLY_STDOUT</div>
          <div ref={tfScrollRef} className="deploy-status__logs-content">
            {tfLog.map((log, i) => (
              <div key={i} className={`deploy-status__log-entry ${
                log.includes('Error') ? 'deploy-status__log-entry--error' : 
                log.includes('Warning') ? 'deploy-status__log-entry--warning' : ''
              }`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Pane>
  );
};
