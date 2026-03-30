import React, { useState } from 'react';
import { FakeLogs } from './FakeLogs';
import { StatReadout } from './StatReadout';
import { Button } from './Button';
import { AudioToggle } from './AudioToggle';
import { HelpIcon } from './Icons';
import type { AppState, Theme } from '../contexts/types';

interface SecureGatewayProps {
  operatorName: string;
  setOperatorName: (name: string) => void;
  setAppState: (state: AppState) => void;
  theme: Theme;
  isEcoMode: boolean;
  setIsEcoMode: (on: boolean) => void;
  clientStats: {
    gpu: string;
    batteryLevel: number | null;
    isCharging: boolean | null;
    connectionType: string;
  };
}

export const SecureGateway: React.FC<SecureGatewayProps> = ({
  operatorName,
  setOperatorName,
  setAppState,
  theme,
  isEcoMode,
  setIsEcoMode,
  clientStats
}) => {
  const [tempJoinId, setTempJoinId] = useState('');

  return (
    <div className="crt-container gateway">
      <div className="gateway__background">
        <FakeLogs severity="NOMINAL" />
      </div>
      
      <div className="gateway__console">
        <div className="gateway__technical-readout">
          <div>
              <StatReadout label="OS_V" value="5.0.0" /><br/>
              <StatReadout label="GPU" value={clientStats.gpu} />
          </div>
          <div className="gateway__technical-readout-right">
              <StatReadout label="PWR" value={
                  `${clientStats.batteryLevel !== null ? `${clientStats.batteryLevel}%` : 'AC_POWER'}${clientStats.isCharging ? ' (CHARGING)' : ''}`
              } /><br/>
              <StatReadout label="SIGNAL" value={clientStats.connectionType} />
          </div>
        </div>

        <div className="gateway__label">SRE SECURE GATEWAY</div>
        <h1 className="gateway__title">SMOKESCREEN</h1>
        <div className="gateway__subtitle">
          TECHNICAL_INCIDENT_THEATRE
        </div>

        <div className="gateway__input-group">
          <label className="gateway__input-label">
            {'>'} IDENTIFY_OPERATOR:
          </label>
          <div className="gateway__input-wrapper">
              <span className="gateway__cursor">_</span>
              <input 
                  autoFocus
                  type="text" 
                  value={operatorName}
                  placeholder="NAME_REQUIRED"
                  className="gateway__input"
                  onChange={(e) => setOperatorName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && operatorName.trim() && setAppState('BOOT')}
              />
          </div>
        </div>

        <Button 
          onClick={() => operatorName.trim() && setAppState('BOOT')} 
          disabled={!operatorName.trim()} 
          variant="primary"
          size="large"
          fullWidth
        >
          INITIATE_SYSTEM_BOOT
        </Button>

        <div className="gateway__controls">
          <AudioToggle 
              fullWidth 
              size="small" 
              labelPrefix="AUDIO"
              activeLabel="ON"
              inactiveLabel="OFF"
          />
          
          <label
            data-tooltip="Disables expensive visual effects like blurs and glows for better performance."
            className="gateway__eco-toggle"
          >
            <input
              type="checkbox"
              checked={isEcoMode}
              onChange={(e) => setIsEcoMode(e.target.checked)}
              className="gateway__eco-checkbox"
            />
            <span className="gateway__eco-label">
              ECO_MODE: {isEcoMode ? 'ACTIVE' : 'DISABLED'}
              <HelpIcon />
            </span>
          </label>
        </div>

        <div className="gateway__footer-note">
          UNAUTHORIZED ACCESS IS PROHIBITED<br/>
          (C) 1984 SRE DIVISION
        </div>

        <div className="gateway__pager-link">
           <div className="gateway__pager-link-label">
            {">"} LINK_COMPANION_PAGER:
          </div>
          <div className="gateway__pager-link-input-group">
              <input 
                  type="text" 
                  placeholder="SRE-XXXX"
                  value={tempJoinId}
                  onChange={(e) => setTempJoinId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && tempJoinId && (window.location.search = `?pager=${tempJoinId}&theme=${theme}`)}
                  className="gateway__input gateway__input--small"
              />
              <Button 
                  onClick={() => {
                      if (tempJoinId) {
                          window.location.search = `?pager=${tempJoinId}&theme=${theme}`;
                      }
                  }}
                  size="small"
                  disabled={!tempJoinId}
                  className="gateway__pager-link-button"
              >
                  CONNECT
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
