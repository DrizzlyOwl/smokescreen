import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { StatReadout } from './StatReadout';
import { TechnicalPane } from './TechnicalPane';
import { ActivityIcon } from './Icons';
import type { Severity, Stack } from '../data/incidents';
import '../styles/AfterActionReport.scss';

interface AfterActionReportProps {
  severity: Severity;
  stack: Stack;
  moneyLost: number;
  mitigations: number;
  mitigationScore?: number;
  onClose: () => void;
}

export const AfterActionReport: React.FC<AfterActionReportProps> = ({
  severity,
  stack,
  moneyLost,
  mitigations,
  mitigationScore = 0,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
        setIsVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const score = mitigations * 100 + mitigationScore;
  let grade = 'D';
  if (score > 1000) grade = 'S';
  else if (score > 800) grade = 'A';
  else if (score > 500) grade = 'B';
  else if (score > 200) grade = 'C';

  return (
    <div className={`aar ${isVisible ? 'isVisible' : ''}`}>
      <div className="aar__overlay" />
      <div className="aar__content">
        <TechnicalPane
          id="settings"
          title="AFTER_ACTION_REPORT"
          paneTitle="INCIDENT_SUMMARY"
          classification="CONFIDENTIAL"
          icon={<ActivityIcon />}
          zIndex={1000}
          onFocus={() => {}}
          isActive={true}
          isMinimized={false}
          onMinimizeToggle={() => {}}
          onClose={onClose}
          initialSize={{ width: 600, height: 500 }}
          metadata={{
             version: 'v6.0.4',
             source: 'SIM_KERNEL',
             authority: 'SRE_LEAD'
          }}
        >
          <div className="aar">
             <div className="aar__header">
                <div className="aar__grade">
                    <span className="aar__grade-label">FINAL_GRADE</span>
                    <span className={`aar__grade-value aar__grade-value--${grade.toLowerCase()}`}>{grade}</span>
                </div>
                <div className="aar__summary">
                    <div className="aar__summary-item">
                        <span className="label">INCIDENT_SEVERITY:</span>
                        <span className={`value value--${severity.toLowerCase()}`}>{severity}</span>
                    </div>
                    <div className="aar__summary-item">
                        <span className="label">INFRA_STACK:</span>
                        <span className="value">{stack}</span>
                    </div>
                </div>
             </div>

             <div className="aar__stats">
                <StatReadout 
                    label="TOTAL_REVENUE_LOSS" 
                    value={`$${moneyLost.toLocaleString()}`} 
                    color="red"
                />
                <StatReadout 
                    label="MITIGATION_ACTIONS" 
                    value={mitigations.toString()} 
                    color="green"
                />
                <StatReadout 
                    label="EFFICIENCY_SCORE" 
                    value={mitigationScore.toString()} 
                    color="amber"
                />
             </div>

             <div className="aar__content">
                <p className="text-dim">
                    The infrastructure incident has been successfully resolved. Final system state is <b className="text-green">STABLE</b>. 
                    All virtual resources have been decommissioned and revenue leak has been plugged.
                </p>
                <div className="aar__actions">
                    <Button variant="primary" onClick={onClose} fullWidth>
                        ACKNOWLEDGE_AND_CLOSE
                    </Button>
                </div>
             </div>
          </div>
        </TechnicalPane>
      </div>
    </div>
  );
};
