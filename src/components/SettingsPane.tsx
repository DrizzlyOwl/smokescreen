import { useState } from 'react';
import { TechnicalPane } from './TechnicalPane';
import { Button } from './Button';
import { SettingsIcon } from './Icons';
import { useTerminal } from '../hooks/useTerminal';
import { TechnicalTypography as Ty } from '../styles/Typography';

interface SettingsPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  currentTheme: 'classic' | 'amber' | 'cobalt';
  setTheme: (theme: 'classic' | 'amber' | 'cobalt') => void;
}

export const SettingsPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  currentTheme,
  setTheme,
}: SettingsPaneProps) => {
  const { isDebugMode, setIsDebugMode, isEcoMode, setIsEcoMode } = useTerminal();
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('gemini_api_key') || ''
  );
  const [showKey, setShowKey] = useState(false);
  const [futureEnabled, setFutureEnabled] = useState(
    () => localStorage.getItem('feature_future_enabled') === 'true'
  );
  const [status, setStatus] = useState<'IDLE' | 'VALIDATING' | 'SAVED' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const green = 'var(--terminal-green)';

  const handleSave = async () => {
    if (!apiKey.trim()) {
        localStorage.removeItem('gemini_api_key');
        localStorage.setItem('feature_future_enabled', String(futureEnabled));
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
        localStorage.setItem('feature_future_enabled', String(futureEnabled));
        setStatus('SAVED');
        setTimeout(() => setStatus('IDLE'), 2000);
    } catch (error: unknown) {
        console.error("Validation Error:", error);
        setStatus('ERROR');
        const message = error instanceof Error ? error.message : '';
        setErrorMessage(message.includes('API_KEY_INVALID') 
            ? 'INVALID_UPLINK_KEY' 
            : 'HANDSHAKE_FAILURE');
        setTimeout(() => setStatus('IDLE'), 4000);
    }
  };

  return (
    <TechnicalPane
      title="SYSTEM_SETTINGS_v4.5"
      paneTitle="CONFIG: SYSTEM"
      classification="INTERNAL_ONLY"
      icon={<SettingsIcon />}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      onClose={onClose}
      initialSize={{ width: 450, height: 480 }}
      footerText={
        <>
          SYSTEM_ID: SMOKESCREEN_v4.5.0_BETA
          <br />
          KERNEL: REACT_19_PROD
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>01.</span> GEMINI_UPLINK_KEY
          </h2>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={status === 'VALIDATING'}
              placeholder="ENTER_SECURE_KEY"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: status === 'ERROR' ? '1px solid var(--terminal-red)' : '1px solid #35373b',
                color: status === 'ERROR' ? 'var(--terminal-red)' : 'var(--terminal-green)',
                padding: '10px 60px 10px 10px',
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                outline: 'none',
                borderRadius: '4px',
                opacity: status === 'VALIDATING' ? 0.5 : 1
              }}
            />
            <Button
              onClick={() => setShowKey(!showKey)}
              size="x-small"
              style={{
                position: 'absolute',
                right: '8px',
                border: 'none',
                background: 'transparent'
              }}
            >
              {showKey ? 'HIDE' : 'SHOW'}
            </Button>
          </div>
          {status === 'ERROR' && (
            <p style={{ color: 'var(--terminal-red)', fontSize: '0.75rem', marginTop: '8px', fontWeight: 'bold' }}>
                {'>'} ERROR: {errorMessage}
            </p>
          )}
          <p style={{ ...Ty.p, fontSize: '0.75rem', opacity: 0.5, marginTop: '8px' }}>
            Keys are cached in{' '}
            <b style={Ty.bold(green)}>LOCAL_STORAGE</b>. No
            data is transmitted to central system servers.
          </p>
        </section>

        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>02.</span> VISUAL_THEMES
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
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
          </div>
        </section>

        <section>
          <h2 style={Ty.h2}>
            <span style={Ty.number(green)}>03.</span> EXPERIMENTAL_MODULES
          </h2>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #1c2128',
            }}
          >
            <input
              type="checkbox"
              checked={futureEnabled}
              onChange={(e) => setFutureEnabled(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--terminal-green)',
              }}
            />
            <span
              style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#fff' }}
            >
              ENABLE_BETA_THEATER
            </span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #1c2128',
              marginTop: '10px'
            }}
          >
            <input
              type="checkbox"
              checked={isEcoMode}
              onChange={(e) => setIsEcoMode(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--terminal-green)',
              }}
            />
            <span
              style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#fff' }}
            >
              ENABLE_ECO_MODE (LOW_POWER)
            </span>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #1c2128',
              marginTop: '10px'
            }}
          >
            <input
              type="checkbox"
              checked={isDebugMode}
              onChange={(e) => setIsDebugMode(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--terminal-green)',
              }}
            />
            <span
              style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#fff' }}
            >
              ENABLE_SYSTEM_DEBUG_HOOKS
            </span>
          </label>
        </section>
      </div>

      <div
        style={{
          marginTop: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
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
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--terminal-amber)',
              animation: 'flicker 0.5s infinite',
              fontWeight: 'bold',
            }}
          >
            SYNC_COMPLETE
          </span>
        )}
        {status === 'ERROR' && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--terminal-red)',
              fontWeight: 'bold',
            }}
          >
            UPLINK_REJECTED
          </span>
        )}
      </div>
    </TechnicalPane>
  );
};
