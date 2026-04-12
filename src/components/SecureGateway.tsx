import React, { useState, useEffect, useRef } from 'react';
import { StatReadout } from './StatReadout';
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

const ASCII_LOGO = `
 ██████╗███╗   ███╗ ██████╗ ██╗  ██╗███████╗███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗
██╔════╝████╗ ████║██╔═══██╗██║ ██╔╝██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║
╚█████╗ ██╔████╔██║██║   ██║█████╔╝ █████╗  ███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║
 ╚═══██╗██║╚██╔╝██║██║   ██║██╔═██╗ ██╔══╝  ╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║
██████╔╝██║ ╚═╝ ██║╚██████╔╝██║  ██╗███████╗███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║
╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝
`;

const LEGAL_WARNING = `
*******************************************************************************
*                                                                             *
*  WARNING: THIS IS A RESTRICTED SYSTEM. UNAUTHORIZED ACCESS IS PROHIBITED.   *
*  ALL ACTIVITIES ARE MONITORED AND LOGGED BY THE SRE DIVISION CORE.          *
*  FAILURE TO IDENTIFY WILL RESULT IN IMMEDIATE SESSION TERMINATION.          *
*                                                                             *
*******************************************************************************
`;

export const SecureGateway: React.FC<SecureGatewayProps> = ({
  operatorName,
  setOperatorName,
  setAppState,
  theme,
  clientStats
}) => {
  const [step, setStep] = useState<'NAME' | 'PAGER'>('NAME');
  const [tempJoinId, setTempJoinId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operatorName.trim()) {
      setStep('PAGER');
    }
  };

  const handlePagerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempJoinId.trim()) {
      window.location.search = `?pager=${tempJoinId.toUpperCase()}&theme=${theme}`;
    } else {
      setAppState('BOOT');
    }
  };

  return (
    <div className="crt-container gateway">
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

        <pre style={{ fontSize: '0.6rem', lineHeight: '1.1', color: 'var(--terminal-green)', marginBottom: '20px' }}>
          {ASCII_LOGO}
        </pre>

        <pre style={{ fontSize: '0.8rem', color: 'var(--terminal-green)', marginBottom: '30px', opacity: 0.8 }}>
          {LEGAL_WARNING}
        </pre>

        {step === 'NAME' && (
          <form onSubmit={handleNameSubmit} className="gateway__input-group">
            <label className="gateway__input-label">
              {'>'} IDENTIFY_OPERATOR:
            </label>
            <div className="block-input-wrapper">
                <span className="block-input-wrapper__display">
                  {operatorName}
                  <span className="block-input-wrapper__cursor" />
                </span>
                <input 
                    ref={inputRef}
                    autoFocus
                    type="text" 
                    value={operatorName}
                    className="block-input-wrapper__real-input"
                    onChange={(e) => setOperatorName(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                />
            </div>
          </form>
        )}

        {step === 'PAGER' && (
          <form onSubmit={handlePagerSubmit} className="gateway__input-group">
            <div style={{ marginBottom: '10px', opacity: 0.6 }}>
              {'>'} OPERATOR_ID: {operatorName.toUpperCase()} [AUTHENTICATED]
            </div>
            <label className="gateway__input-label">
              {'>'} [OPTIONAL] LINK_COMPANION_PAGER (SRE-XXXX):
            </label>
            <div className="block-input-wrapper">
                <span className="block-input-wrapper__display">
                  {tempJoinId}
                  <span className="block-input-wrapper__cursor" />
                </span>
                <input 
                    ref={inputRef}
                    autoFocus
                    type="text" 
                    value={tempJoinId}
                    className="block-input-wrapper__real-input"
                    onChange={(e) => setTempJoinId(e.target.value.toUpperCase())}
                    spellCheck={false}
                    autoComplete="off"
                />
            </div>
            <div style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.5 }}>
              PRESS [ENTER] TO INITIATE_SYSTEM_BOOT
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
