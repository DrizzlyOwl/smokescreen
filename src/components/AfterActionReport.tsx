import React from 'react';
import '../styles/AfterActionReport.scss';

interface AfterActionReportProps {
  score: number;
  mitigations: number;
  moneyLost: number;
  onAcknowledge: () => void;
}

export const AfterActionReport: React.FC<AfterActionReportProps> = ({ score, mitigations, moneyLost, onAcknowledge }) => {
  const penalty = Math.floor(moneyLost / 100); // 1 credit per £100 lost
  const finalScore = Math.max(0, score - penalty);

  return (
    <div className="aar">
      <div className="aar__overlay" />
      <div className="aar__content">
        <div className="aar__header">
          <h1 className="aar__title">AFTER-ACTION REPORT</h1>
          <div className="aar__subtitle">MISSION_STATUS: SUCCESSFUL</div>
        </div>

        <div className="aar__body">
          <div className="aar__stat-row">
            <span className="aar__stat-label">SYSTEM UPTIME PROTECTED:</span>
            <span className="aar__stat-value">99.999%</span>
          </div>
          <div className="aar__stat-row">
            <span className="aar__stat-label">MITIGATIONS EXECUTED:</span>
            <span className="aar__stat-value">{mitigations}</span>
          </div>
          <div className="aar__stat-row">
            <span className="aar__stat-label">FINANCIAL LOSS DETECTED:</span>
            <span className="aar__stat-value aar__stat-value--danger">£{moneyLost.toFixed(2)}</span>
          </div>
          <div className="aar__stat-row">
            <span className="aar__stat-label">MITIGATION RATING:</span>
            <span className="aar__stat-value aar__stat-value--highlight">
                {finalScore > 40 ? 'OUTSTANDING' : finalScore > 20 ? 'SATISFACTORY' : 'NEEDS IMPROVEMENT'}
            </span>
          </div>
          
          <div className="aar__divider" />
          
          <div className="aar__score-breakdown">
            <div className="aar__stat-row">
                <span className="aar__stat-label">BASE MITIGATION CREDITS:</span>
                <span className="aar__stat-value">+{score}</span>
            </div>
            <div className="aar__stat-row">
                <span className="aar__stat-label">OPEX IMPACT PENALTY:</span>
                <span className="aar__stat-value aar__stat-value--danger">-{penalty}</span>
            </div>
          </div>

          <div className="aar__score-section">
            <div className="aar__score-label">NET CREDITS EARNED</div>
            <div className="aar__score-value">+{finalScore}</div>
          </div>
        </div>

        <div className="aar__footer">
          <button className="aar__btn" onClick={onAcknowledge}>
            [ ACKNOWLEDGE_AND_STAND_DOWN ]
          </button>
        </div>
      </div>
    </div>
  );
};