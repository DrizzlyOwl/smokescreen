import React, { useEffect, useRef, useState } from 'react';
import { StatReadout } from './StatReadout';
import type { AppState, Theme } from '../contexts/types';

import { type Stack } from '../data/incidents';
import { type GameMode } from '../store/useIncidentStore';
import { PLAYBOOKS } from '../data/playbooks';
import { TerminalLogo } from './TerminalLogo';

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
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;
  stack: Stack;
  setStack: (s: Stack) => void;
  selectedPlaybookId: string | null;
  setSelectedPlaybookId: (id: string | null) => void;
}

export const SecureGateway: React.FC<SecureGatewayProps> = ({
  operatorName,
  setOperatorName,
  setAppState,
  clientStats,
  gameMode,
  setGameMode,
  stack,
  setStack,
  selectedPlaybookId,
  setSelectedPlaybookId
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    if (!selectedPlaybookId) {
        setSelectedPlaybookId(Object.keys(PLAYBOOKS)[0]);
    }
  }, [selectedPlaybookId, setSelectedPlaybookId]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operatorName.trim()) {
      setAppState('BOOT');
    }
  };

  const STACKS: Stack[] = ['AWS', 'GCP', 'AZURE', 'ON-PREM', 'SERVERLESS', 'CLOUDFLARE', 'HEROKU', 'HYPER-V', 'VMWARE'];
  const visibleStacks = showAdvanced ? STACKS : STACKS.slice(0, 2); // Show AWS and GCP by default

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isInput = document.activeElement === inputRef.current;
    const currentField = (document.activeElement as HTMLElement).closest('.gateway__field');
    const fields = Array.from(document.querySelectorAll('.gateway__field'));
    const fieldIndex = fields.indexOf(currentField!);

    if (e.key === 'ArrowDown' || (!isInput && e.key === 'j')) {
      const nextField = fields[fieldIndex + 1];
      if (nextField) {
        e.preventDefault();
        const nextTarget = nextField.querySelector<HTMLElement>('.gateway__action-btn, .block-input-wrapper__real-input');
        nextTarget?.focus();
      }
    } else if (e.key === 'ArrowUp' || (!isInput && e.key === 'k')) {
      const prevField = fields[fieldIndex - 1];
      if (prevField) {
        e.preventDefault();
        const prevTarget = prevField.querySelector<HTMLElement>('.gateway__action-btn, .block-input-wrapper__real-input');
        prevTarget?.focus();
      }
    } else if (!isInput && (e.key === 'ArrowRight' || e.key === 'l')) {
      const btnGrid = (document.activeElement as HTMLElement).closest('.gateway__btn-grid');
      if (btnGrid) {
        const btns = Array.from(btnGrid.querySelectorAll<HTMLElement>('.gateway__action-btn'));
        const nextBtn = btns[btns.indexOf(document.activeElement as HTMLElement) + 1];
        if (nextBtn) {
            e.preventDefault();
            nextBtn.focus();
        }
      }
    } else if (!isInput && (e.key === 'ArrowLeft' || e.key === 'h')) {
      const btnGrid = (document.activeElement as HTMLElement).closest('.gateway__btn-grid');
      if (btnGrid) {
        const btns = Array.from(btnGrid.querySelectorAll<HTMLElement>('.gateway__action-btn'));
        const prevBtn = btns[btns.indexOf(document.activeElement as HTMLElement) - 1];
        if (prevBtn) {
            e.preventDefault();
            prevBtn.focus();
        }
      }
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

        <TerminalLogo />

        <form onSubmit={handleNameSubmit} onKeyDown={handleKeyDown} className="gateway__input-group">
          <div className="gateway__field">
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
          </div>

          <div className="gateway__selectors">
            <div className="gateway__field">
                <label className="gateway__input-label">{'>'} SELECT_MODE:</label>
                <div className="gateway__btn-grid">
                    <button 
                        type="button"
                        className={`gateway__action-btn ${gameMode === 'SANDBOX' ? 'active' : ''}`}
                        onClick={() => setGameMode('SANDBOX')}
                    >
                        [ SANDBOX ]
                        {gameMode !== 'SANDBOX' && <span className="gateway__btn-badge">RECOMMENDED</span>}
                    </button>
                    <button 
                        type="button"
                        className={`gateway__action-btn ${gameMode === 'ARCADE' ? 'active' : ''}`}
                        onClick={() => setGameMode('ARCADE')}
                    >
                        [ ARCADE ]
                    </button>
                </div>
                <div className="gateway__description-block">
                    {gameMode === 'SANDBOX' ? (
                        <>MODE: SANDBOX<br/>DETAILS: Free-play training simulation. (Operator Certification)</>
                    ) : (
                        <>MODE: ARCADE<br/>DETAILS: High-stakes scored operations. Follow playbooks.</>
                    )}
                </div>
            </div>

            <div className="gateway__field">
                <label className="gateway__input-label">{'>'} TARGET_STACK:</label>
                <div className="gateway__btn-grid">
                    {visibleStacks.map(s => (
                        <button 
                            key={s}
                            type="button"
                            className={`gateway__action-btn ${stack === s ? 'active' : ''}`}
                            onClick={() => setStack(s)}
                        >
                            [ {s} ]
                        </button>
                    ))}
                    <button 
                        type="button"
                        className="gateway__action-btn gateway__action-btn--advanced"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        [ {showAdvanced ? 'BASIC_CONFIG' : 'ADVANCED_CONFIG'} ]
                    </button>
                </div>
            </div>

            {gameMode === 'ARCADE' && (
                <div className="gateway__field">
                    <label className="gateway__input-label">{'>'} SELECT_SCENARIO:</label>
                    <div className="gateway__btn-grid">
                        {Object.values(PLAYBOOKS).map(p => (
                            <button 
                                key={p.id}
                                type="button"
                                className={`gateway__action-btn ${selectedPlaybookId === p.id ? 'active' : ''}`}
                                onClick={() => setSelectedPlaybookId(p.id)}
                            >
                                [ {p.difficulty} ]
                            </button>
                        ))}
                    </div>
                    {selectedPlaybookId && PLAYBOOKS[selectedPlaybookId] && (
                        <div className="gateway__description-block">
                           SCENARIO: {PLAYBOOKS[selectedPlaybookId].name}<br/>
                           DETAILS : {PLAYBOOKS[selectedPlaybookId].description}
                        </div>
                    )}
                </div>
            )}
          </div>

          <div style={{ marginTop: '30px', fontSize: '0.8rem', opacity: 0.5, textAlign: 'center' }}>
            PRESS [ENTER] TO INITIATE_SYSTEM_BOOT
          </div>
        </form>
      </div>
    </div>
  );
};
