import React from 'react';

const IconBase: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = '', title }) => (
  <span className={`ascii-icon ${className}`} title={title} style={{ 
    fontFamily: 'var(--font-mono)', 
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '1.2em'
  }}>
    {children}
  </span>
);

export const ChatIcon = () => <IconBase>[MSG]</IconBase>;
export const LogsIcon = () => <IconBase>[LOG]</IconBase>;
export const MapIcon = () => <IconBase>[MAP]</IconBase>;
export const DeployIcon = () => <IconBase>[K8S]</IconBase>;
export const BurnIcon = () => <IconBase>[$$$]</IconBase>;
export const ActivityIcon = () => <IconBase>[ACT]</IconBase>;
export const AudioIcon = () => <IconBase>[VOL]</IconBase>;
export const PlaybookIcon = () => <IconBase>[BOK]</IconBase>;
export const MetricsIcon = () => <IconBase>[MET]</IconBase>;
export const HelpIcon = () => <IconBase>[HLP]</IconBase>;
export const BugIcon = () => <IconBase>[BUG]</IconBase>;
export const SettingsIcon = () => <IconBase>[CFG]</IconBase>;
export const CheckIcon = () => <IconBase>[V]</IconBase>;
export const MinimizeIcon = () => <IconBase>[-]</IconBase>;
export const MaximizeIcon = () => <IconBase>[+]</IconBase>;
export const CloseIcon = () => <IconBase>[X]</IconBase>;
export const PopOutIcon = () => <IconBase>[^]</IconBase>;
export const PopInIcon = () => <IconBase>[v]</IconBase>;
export const SnapLeftIcon = () => <IconBase>[&lt;]</IconBase>;
export const SnapRightIcon = () => <IconBase>[&gt;]</IconBase>;
export const SecureIcon = () => <IconBase>[SEC]</IconBase>;
export const AccessIcon = () => <IconBase>[ACC]</IconBase>;

export const NetworkIcon = ({ connectionType, downlink }: { connectionType: string, downlink: number | null }) => {
  let bars = '    ';
  let color = 'inherit';
  let label = connectionType;

  if (connectionType === 'UNKNOWN' || connectionType === 'NONE') {
    bars = '    ';
    color = 'var(--terminal-red)';
    label = 'OFF';
  } else if (downlink === null) {
    bars = '████';
  } else if (downlink > 10) {
    bars = '████';
  } else if (downlink > 5) {
    bars = '███ ';
  } else if (downlink > 2) {
    bars = '██  ';
    color = 'var(--terminal-amber)';
  } else {
    bars = '█   ';
    color = 'var(--terminal-red)';
  }

  return (
    <IconBase className="network-icon" title={`${label} ${downlink ? `(${downlink}Mbps)` : ''}`}>
      <span style={{ color, letterSpacing: '-1px', marginRight: '4px' }}>[{bars}]</span>
      <span style={{ fontSize: '0.8em', opacity: 0.8 }}>{label}</span>
    </IconBase>
  );
};

export const BatteryIcon = ({ level }: { level: 'critical' | 'low' | 'medium' | 'high' | 'plugged' }) => {
  let bars = '     ';
  let color = 'inherit';

  switch (level) {
    case 'plugged': return <IconBase>[PWR]</IconBase>;
    case 'critical': bars = '█    '; color = 'var(--terminal-red)'; break;
    case 'low':      bars = '██   '; color = 'var(--terminal-amber)'; break;
    case 'medium':   bars = '███  '; break;
    case 'high':     bars = '█████'; break;
  }

  return (
    <IconBase className="battery-icon">
      <span style={{ color }}>[{bars}]</span>
    </IconBase>
  );
};
