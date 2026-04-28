import React, { useState, useEffect, useCallback } from 'react';
import { TerminalLogo } from './TerminalLogo';
import { AccessIcon } from './Icons';
import { useTerminalStore } from '../store/useTerminalStore';
import { useIncidentStore } from '../store/useIncidentStore';
import '../styles/_gateway.scss';

interface SecureGatewayProps {
  onComplete: () => void;
  playLoginChime?: () => void;
}

export const SecureGateway: React.FC<SecureGatewayProps> = ({ onComplete, playLoginChime }) => {
  const [step, setAppState] = useState<'LOGIN' | 'LOADING' | 'GRANTED'>('LOGIN');
  const [loginPhase, setLoginPhase] = useState<'NAME' | 'MODE'>('NAME');
  
  const setOperatorName = useTerminalStore(state => state.setOperatorName);
  const { gameMode, setGameMode } = useIncidentStore();
  const [name, setName] = useState(useTerminalStore.getState().operatorName);
  const [isError, setIsError] = useState(false);

  const startSession = useCallback(() => {
    setOperatorName(name.trim());
    setAppState('LOADING');
    setTimeout(() => {
      setAppState('GRANTED');
      playLoginChime?.();
      setTimeout(onComplete, 1000);
    }, 1500);
  }, [name, setOperatorName, onComplete, playLoginChime]);

  const handleNameSubmit = useCallback(() => {
    if (name.trim().length > 0) {
      setLoginPhase('MODE');
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
    }
  }, [name]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (step !== 'LOGIN') return;

    if (loginPhase === 'MODE') {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setGameMode(gameMode === 'ARCADE' ? 'SANDBOX' : 'ARCADE');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        startSession();
      }
    }
  }, [step, loginPhase, gameMode, setGameMode, startSession]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="gateway-wrapper">
      <div className="gateway">
        <div className="gateway__header">
          <TerminalLogo />
          <div className="gateway__title">SMOKESCREEN_OS v6.0.4</div>
          <div className="gateway__subtitle">INFRASTRUCTURE_SIMULATION_KERNEL</div>
        </div>

        <div className="gateway__body">
          {step === 'LOGIN' && (
            <div className="gateway__terminal-box">
              <div className="gateway__line">
                <span className="gateway__prompt">{'> '}OPERATOR_IDENTIFICATION_REQUIRED</span>
              </div>
              
              <div className={`gateway__line ${isError ? 'error' : ''}`}>
                <span className="gateway__prompt">{'> '}LOGIN: </span>
                {loginPhase === 'NAME' ? (
                  <input
                    type="text"
                    autoFocus
                    placeholder="..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNameSubmit();
                      }
                    }}
                    className="gateway__inline-input"
                    spellCheck={false}
                    autoComplete="off"
                  />
                ) : (
                  <span className="gateway__value">{name.toUpperCase()}</span>
                )}
              </div>

              {loginPhase === 'MODE' && (
                <>
                  <div className="gateway__line">
                    <span className="gateway__prompt">{'> '}SELECT_SIMULATION_MODE:</span>
                  </div>
                  <div className="gateway__modes-list">
                    <div className={`gateway__mode-item ${gameMode === 'ARCADE' ? 'active' : ''}`}>
                      {gameMode === 'ARCADE' ? '[*]' : '[ ]'} ARCADE  - HIGH_STAKES. MISSION_DRIVEN. PUNITIVE.
                    </div>
                    <div className={`gateway__mode-item ${gameMode === 'SANDBOX' ? 'active' : ''}`}>
                      {gameMode === 'SANDBOX' ? '[*]' : '[ ]'} SANDBOX - MANUAL_CONTROL. UNLIMITED_RESOURCES.
                    </div>
                  </div>
                  <div className="gateway__line gateway__line--hint">
                    <span className="gateway__prompt">{'> '}USE_ARROWS_TO_TOGGLE_//_PRESS_ENTER_TO_INITIALIZE</span>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'LOADING' && (
            <div className="gateway__loading">
              <div className="gateway__spinner" />
              <div className="gateway__loading-text">VALIDATING_OPERATOR_CREDENTIALS...</div>
              <div className="gateway__loading-bar">
                <div className="gateway__loading-progress" />
              </div>
            </div>
          )}

          {step === 'GRANTED' && (
            <div className="gateway__granted">
              <AccessIcon />
              <div className="gateway__granted-text">ACCESS_GRANTED</div>
              <div className="gateway__granted-sub">WELCOME_BACK_OPERATOR</div>
            </div>
          )}
        </div>

        <div className="gateway__footer">
          <div className="gateway__meta">
            <span>TERMINAL_ID: {useTerminalStore.getState().terminalId}</span>
            <span>AUTH_LEVEL: LEVEL_4_SRE</span>
          </div>
        </div>
      </div>
      <div className="gateway__overlay" />
    </div>
  );
};
