import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useIncidentStore, type ApprovalState } from '../store/useIncidentStore';
import { useAudio } from '../hooks/useAudio';
import '../styles/ApprovalModal.scss';

interface ApprovalModalProps {
  approval: ApprovalState;
  onResolve: () => void;
  onFail?: (reason: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ approval, onResolve, onFail }) => {
  const [inputValue, setInputValue] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isFailed, setIsFailed] = useState(false);
  const holdInterval = useRef<number | null>(null);
  const timerInterval = useRef<number | null>(null);
  const { isChaos, incrementMitigationCount } = useIncidentStore();
  const { playMitigationSuccess } = useAudio();

  const handlePhraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFailed) return;
    const val = e.target.value;
    setInputValue(val);
    if (val.toUpperCase() === (approval.phrase || '').toUpperCase()) {
      playMitigationSuccess();
      incrementMitigationCount();
      onResolve();
    }
  };

  const stopHold = useCallback(() => {
    if (holdInterval.current) {
      window.clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (holdInterval.current || isFailed) return;
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    holdInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(progress);
      
      if (progress >= 100) {
        stopHold();
        playMitigationSuccess();
        incrementMitigationCount();
        onResolve();
      }
    }, 50);
  }, [isFailed, onResolve, playMitigationSuccess, incrementMitigationCount, stopHold]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFailed) return;
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val === 100) {
      playMitigationSuccess();
      incrementMitigationCount();
      onResolve();
    }
  };

  useEffect(() => {
    timerInterval.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerInterval.current) window.clearInterval(timerInterval.current);
          setIsFailed(true);
          setTimeout(() => {
            onFail?.('VERIFICATION_TIMEOUT');
            onResolve(); // Close modal
          }, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (holdInterval.current) window.clearInterval(holdInterval.current);
      if (timerInterval.current) window.clearInterval(timerInterval.current);
    };
  }, [onFail, onResolve]);

  return (
    <div className={`approval-modal ${isChaos ? 'glitch' : ''} ${isFailed ? 'approval-modal--failed' : ''}`}>
      <div className="approval-modal__overlay" />
      <div className="approval-modal__content">
        <div className="approval-modal__header">
          <span className="approval-modal__warning-icon">{isFailed ? '❌' : '⚠️'}</span>
          <h2 className="approval-modal__title">
            {isFailed ? 'ACTION_FAILED' : 'CRITICAL_ACTION_REQUIRED'}
          </h2>
          {!isFailed && (
            <div className="approval-modal__timer" style={{ color: timeLeft <= 3 ? 'var(--terminal-red)' : 'inherit' }}>
              T-MINUS: {timeLeft}s
            </div>
          )}
        </div>
        
        <div className="approval-modal__body">
          <p className="approval-modal__message">
            {isFailed ? 'SECURITY_OVERRIDE_TIMED_OUT. LOCKING_SYSTEM...' : approval.message}
          </p>
          
          {!isFailed && (
            <>
              {approval.type === 'phrase' ? (
                <div className="approval-modal__phrase-action">
                  <p className="approval-modal__instruction">
                    TYPE THE FOLLOWING TO CONFIRM: <strong>{approval.phrase}</strong>
                  </p>
                  <input 
                    type="text" 
                    autoFocus
                    className="approval-modal__input"
                    value={inputValue}
                    onChange={handlePhraseChange}
                    placeholder="Awaiting verification..."
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              ) : approval.type === 'hold' ? (
                <div className="approval-modal__hold-action">
                  <p className="approval-modal__instruction">
                    HOLD BUTTON FOR 3 SECONDS TO DEPLOY
                  </p>
                  <div className="approval-modal__button-container">
                    <button 
                      className="approval-modal__hold-button"
                      onMouseDown={startHold}
                      onMouseUp={stopHold}
                      onMouseLeave={stopHold}
                      onTouchStart={startHold}
                      onTouchEnd={stopHold}
                    >
                      <div 
                        className="approval-modal__progress-bar" 
                        style={{ width: `${holdProgress}%` }}
                      />
                      <span className="approval-modal__button-text">
                        {holdProgress > 0 ? `${Math.round(holdProgress)}%` : '[ INITIATE_FAILOVER ]'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="approval-modal__slider-action">
                  <p className="approval-modal__instruction">
                    SLIDE TO ACKNOWLEDGE ESCALATION
                  </p>
                  <div className="approval-modal__slider-container">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={sliderValue} 
                      onChange={handleSliderChange}
                      className="approval-modal__slider"
                    />
                    <div className="approval-modal__slider-track-labels">
                      <span>0%</span>
                      <span>50%</span>
                      <span>ACKNOWLEDGE</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="approval-modal__footer">
          <span className="approval-modal__status">
            {isFailed ? 'STATUS: ACCESS_DENIED' : 'SYSTEM_LOCKED // AUTHORIZATION_PENDING'}
          </span>
        </div>
      </div>
    </div>
  );
};