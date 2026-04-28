import { useState } from 'react';
import { TechnicalPane } from './TechnicalPane';
import { Button } from './Button';
import { SettingsIcon } from './Icons';
import { useTerminal } from '../hooks/useTerminal';
import type { Theme } from '../contexts/types';
import '../styles/SettingsPane.scss';

interface SettingsPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
  isPoppedOut?: boolean;
  onPopOutToggle?: () => void;
  isSnappedMain?: boolean;
  onSnapMainToggle?: () => void;
}

export const SettingsPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  currentTheme,
  setTheme,
  initialPos,
  initialSize = { width: 450, height: 550 },
  isPoppedOut,
  onPopOutToggle,
  isSnappedMain,
  onSnapMainToggle
}: SettingsPaneProps) => {
  const { isDebugMode, setIsDebugMode, isEcoMode, setIsEcoMode } = useTerminal();
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('gemini_api_key') || ''
  );
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'VALIDATING' | 'SAVED' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async () => {
    if (!apiKey.trim()) {
        localStorage.removeItem('gemini_api_key');
        setStatus('SAVED');
        setTimeout(() => setStatus('IDLE'), 2000);
        return;
    }

    setStatus('VALIDATING');
    setErrorMessage('');

    try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 1 }
        });
        await result.response;
        
        localStorage.setItem('gemini_api_key', apiKey);
        setStatus('SAVED');
        setTimeout(() => setStatus('IDLE'), 2000);
    } catch (error: unknown) {
        console.error("Validation Error:", error);
        setStatus('ERROR');
        const message = error instanceof Error ? error.message : '';
        setErrorMessage(message.includes('API_KEY_INVALID') 
            ? 'INVALID_API_KEY' 
            : 'HANDSHAKE_FAILURE');
        setTimeout(() => setStatus('IDLE'), 4000);
    }
  };

  return (
    <TechnicalPane
      id="settings"
      title="SYSTEM_SETTINGS"
      paneTitle="CONFIG: SYSTEM"
      classification="INTERNAL_ONLY"
      icon={<SettingsIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
      initialPos={initialPos}
      initialSize={initialSize}
      isPoppedOut={isPoppedOut}
      onPopOutToggle={onPopOutToggle}
      isSnappedMain={isSnappedMain}
      onSnapMainToggle={onSnapMainToggle}
      metadata={{
        version: 'v1.0.0-PROD',
        source: 'KERNEL_CONFIG',
        authority: 'SYSTEM_ADMIN'
      }}
    >
      <div className="settings">
        <section className="settings__section">
          <h2>01. GEMINI_API_KEY</h2>
          <p className="text-dim">
            Optional: Provide an AI key to generate hyper-realistic, context-aware technical incident reports tailored to your specific environment.
          </p>
          <div className="settings__input-wrapper">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={status === 'VALIDATING'}
              placeholder="ENTER_SECURE_KEY"
              className={`settings__input ${status === 'ERROR' ? 'settings__input--error' : ''}`}
            />
            <Button
              onClick={() => setShowKey(!showKey)}
              size="x-small"
              className="settings__input-toggle"
            >
              {showKey ? 'HIDE' : 'SHOW'}
            </Button>
          </div>
          {status === 'ERROR' && (
            <p className="text-red">
                {'>'} ERROR: {errorMessage}
            </p>
          )}
          <p className="text-dim" style={{ fontSize: '0.75rem' }}>
            Keys are cached in <b>LOCAL_STORAGE</b>. No data is transmitted to central system servers.
          </p>
        </section>

        <section className="settings__section">
          <h2>02. VISUAL_THEMES</h2>
          <p className="text-dim">
            Switch between classic hardware aesthetics to match your terminal emulator preference.
          </p>
          <div className="settings__theme-grid">
            <Button 
                onClick={() => setTheme('classic')} 
                active={currentTheme === 'classic'}
                size="x-small"
            >
                CLASSIC
            </Button>
            <Button 
                onClick={() => setTheme('amber')} 
                active={currentTheme === 'amber'}
                size="x-small"
                style={{ color: 'var(--terminal-amber)', borderColor: 'var(--terminal-amber)' }}
            >
                AMBER
            </Button>
            <Button 
                onClick={() => setTheme('cobalt')} 
                active={currentTheme === 'cobalt'}
                size="x-small"
                style={{ color: 'var(--terminal-cobalt)', borderColor: 'var(--terminal-cobalt)' }}
            >
                COBALT
            </Button>
            <Button 
                onClick={() => setTheme('dracula')} 
                active={currentTheme === 'dracula'}
                size="x-small"
                style={{ color: '#bd93f9', borderColor: '#bd93f9' }}
            >
                DRACULA
            </Button>
            <Button 
                onClick={() => setTheme('monokai')} 
                active={currentTheme === 'monokai'}
                size="x-small"
                style={{ color: '#f92672', borderColor: '#f92672' }}
            >
                MONOKAI
            </Button>
            <Button 
                onClick={() => setTheme('cyberpunk')} 
                active={currentTheme === 'cyberpunk'}
                size="x-small"
                style={{ color: '#ff00ff', borderColor: '#ff00ff', textShadow: '0 0 5px #ff00ff' }}
            >
                CYBERPUNK
            </Button>
            <Button 
                onClick={() => setTheme('high-contrast')} 
                active={currentTheme === 'high-contrast'}
                size="x-small"
                style={{ color: '#ffffff', borderColor: '#ffffff', background: '#000000' }}
            >
                CONTRAST
            </Button>
          </div>
          <div className="settings__theme-grid" style={{ marginTop: '10px' }}>
            <Button 
                onClick={() => setTheme('protanopia')} 
                active={currentTheme === 'protanopia'}
                size="x-small"
                style={{ color: '#0072B2', borderColor: '#0072B2' }}
            >
                PROTAN
            </Button>
            <Button 
                onClick={() => setTheme('deuteranopia')} 
                active={currentTheme === 'deuteranopia'}
                size="x-small"
                style={{ color: '#357ebd', borderColor: '#357ebd' }}
            >
                DEUTER
            </Button>
            <Button 
                onClick={() => setTheme('tritanopia')} 
                active={currentTheme === 'tritanopia'}
                size="x-small"
                style={{ color: '#1f78b4', borderColor: '#1f78b4' }}
            >
                TRITAN
            </Button>
          </div>
        </section>

        <section className="settings__section">
          <h2>03. SYSTEM_CONFIGURATION</h2>
          
          <label className="settings__option">
            <input
              type="checkbox"
              checked={isEcoMode}
              onChange={(e) => setIsEcoMode(e.target.checked)}
              className="settings__option-checkbox"
            />
            <div>
              <span className="settings__option-label">
                ENABLE ECO MODE (LOW POWER)
              </span>
              <span className="text-dim" style={{ fontSize: '0.75rem', display: 'block' }}>
                Disables expensive CSS filters like blurs, glows, and animations for better performance.
              </span>
            </div>
          </label>

          <label className="settings__option">
            <input
              type="checkbox"
              checked={isDebugMode}
              onChange={(e) => setIsDebugMode(e.target.checked)}
              className="settings__option-checkbox"
            />
            <div>
              <span className="settings__option-label">
                ENABLE SYSTEM DEBUG LOGS
              </span>
              <span className="text-dim" style={{ fontSize: '0.75rem', display: 'block' }}>
                Opens a dedicated console to track internal state transitions and telemetry events in real-time.
              </span>
            </div>
          </label>
        </section>
      </div>

      <div className="settings__footer">
        <Button 
            onClick={handleSave} 
            variant="primary" 
            size="x-small" 
            disabled={status === 'VALIDATING'}
        >
          {status === 'VALIDATING' ? 'VERIFYING...' : 
           status === 'SAVED' ? 'SYNCED' : 'COMMIT_CHANGES'}
        </Button>
        {status === 'SAVED' && (
          <span className="settings__status settings__status--saved">
            SYNC_COMPLETE
          </span>
        )}
        {status === 'ERROR' && (
          <span className="settings__status settings__status--error">
            KEY_REJECTED
          </span>
        )}
      </div>
    </TechnicalPane>
  );
};
