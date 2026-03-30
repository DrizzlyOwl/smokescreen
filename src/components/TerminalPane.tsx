import React, { useState, useRef, useEffect } from 'react';
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
  operatorName
}: TerminalPaneProps) => {
  const [input, setInput] = useState('');
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isActive, isMinimized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory]);

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
      initialPos={{ x: 50, y: 450 }}
      initialSize={{ width: 600, height: 350 }}
    >
      <div className="terminal-pane">
        <div className="terminal-pane__output" ref={scrollRef}>
          {terminalHistory.map((line, i) => (
            <div key={i} className={`terminal-pane__line terminal-pane__line--${line.type}`}>
              {line.type === 'command' && (
                <span className="terminal-pane__input-prefix">[{operatorName || 'OPERATOR'}][@]SMOKESCREEN:~ $ </span>
              )}
              <span className="terminal-pane__content">{line.text}</span>
            </div>
          ))}

          {terminalHistory.length === 0 && (
            <div className="terminal-pane__idle">AWAITING_COMMAND...</div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="terminal-pane__input-area">
          <span className="terminal-pane__input-prefix">[{operatorName || 'OPERATOR'}][@]SMOKESCREEN:~ $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isError ? "INVALID_COMMAND_" : ""}
            className={`terminal-pane__input ${isError ? 'terminal-pane__input--error' : ''}`}
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </Pane>
  );
};
