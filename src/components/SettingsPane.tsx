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
          <h2>01. VISUAL_THEMES</h2>
          <p className="text-dim">
            Switch between hardware aesthetics to match your terminal emulator preference.
          </p>
          
          <div className="settings__theme-group">
            <h3 className="settings__group-label">DESIGNER_PROFILES</h3>
            <div className="settings__theme-grid">
              <Button 
                  onClick={() => setTheme('classic')} 
                  active={currentTheme === 'classic'}
                  size="x-small"
              >
                  CLASSIC
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
                  style={{ color: '#e6db74', borderColor: '#e6db74' }}
              >
                  MONOKAI
              </Button>
            </div>
          </div>

          <div className="settings__theme-group">
            <h3 className="settings__group-label">HIGH_INTENSITY</h3>
            <div className="settings__theme-grid">
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
          </div>

          <div className="settings__theme-group">
            <h3 className="settings__group-label">ACCESSIBILITY</h3>
            <div className="settings__theme-grid">
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
          </div>
        </section>

        <section className="settings__section">
          <h2>02. SYSTEM_CONFIGURATION</h2>
          
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
    </TechnicalPane>
  );
};
