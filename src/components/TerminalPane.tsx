import React, { useState, useRef, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Pane } from './Pane';
import { ActivityIcon } from './Icons';
import '../styles/TerminalPane.scss';

interface TerminalPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  onCommand: (cmd: string) => boolean;
  terminalHistory: import('../hooks/useIncidentState').TerminalLine[];
  operatorName: string;
  initialPos?: { x: number, y: number };
  initialSize?: { width: number, height: number };
  isPoppedOut?: boolean;
  onPopOutToggle?: () => void;
  isSnappedMain?: boolean;
  onSnapMainToggle?: () => void;
}

export const TerminalPane = ({
  zIndex,
  onFocus,
  isActive,
  onClose,
  isMinimized,
  onMinimizeToggle,
  onCommand,
  terminalHistory,
  operatorName,
  initialPos = { x: 50, y: 450 },
  initialSize = { width: 600, height: 350 },
  isPoppedOut,
  onPopOutToggle,
  isSnappedMain,
  onSnapMainToggle
}: TerminalPaneProps) => {
  const [input, setInput] = useState('');
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isActive, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = input.toLowerCase().trim();
    if (cleanCmd) {
      const isValid = onCommand(cleanCmd);
      if (!isValid) {
        setIsError(true);
        setTimeout(() => setIsError(false), 500);
      }
      setInput('');
    }
  };

  return (
    <Pane
      id="terminal"
      title="SYSTEM_TERMINAL_CORE"
      icon={<ActivityIcon />}
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
    >
      <div className="terminal-pane">
        {terminalHistory.length === 0 ? (
          <div className="terminal-pane__output" style={{ display: 'flex' }}>
            <div className="terminal-pane__idle">AWAITING_COMMAND...</div>
          </div>
        ) : (
          <Virtuoso
            className="terminal-pane__output"
            data={terminalHistory}
            initialTopMostItemIndex={terminalHistory.length > 0 ? terminalHistory.length - 1 : 0}
            followOutput="smooth"
            alignToBottom
            itemContent={(_index, line) => (
              <div className={`terminal-pane__line terminal-pane__line--${line.type}`}>
                {line.type === 'command' && (
                  <span className="terminal-pane__input-prefix">[{operatorName || 'OPERATOR'}][@]SMOKESCREEN:~ $ </span>
                )}
                <span className="terminal-pane__content">{line.text}</span>
              </div>
            )}
          />
        )}
        
        <form onSubmit={handleSubmit} className="terminal-pane__input-area">
          <span className="terminal-pane__input-prefix">[{operatorName || 'OPERATOR'}][@]SMOKESCREEN:~ $</span>
          <div className={`block-input-wrapper ${isError ? 'block-input-wrapper--error' : ''}`} style={{ flex: 1 }}>
              <span className="block-input-wrapper__display">
                {input}
                <span className="block-input-wrapper__cursor" />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="block-input-wrapper__real-input"
                spellCheck={false}
                autoComplete="off"
              />
          </div>
        </form>
      </div>
    </Pane>
  );
};
