import React, { useState, useRef, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Pane } from './Pane';
import { ActivityIcon } from './Icons';
import type { Command } from '../hooks/useCommandRegistry';
import type { TerminalLine } from '../hooks/useIncidentState';
import '../styles/TerminalPane.scss';

interface TerminalPaneProps {
  zIndex: number;
  onFocus: () => void;
  isActive: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onMinimizeToggle: () => void;
  onCommand: (cmd: string) => boolean;
  terminalHistory: TerminalLine[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  commandHistory: string[];
  commands: Command[];
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
  setTerminalHistory,
  commandHistory,
  commands,
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
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isActive, isMinimized]);

  // Reset history index when input changes manually (not via arrows)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHistoryIndex(-1);
  };

  const getGhostText = () => {
    if (!input) return '';
    const currentInput = input.toLowerCase();
    const allPatterns = Array.from(new Set(commands.flatMap(c => c.patterns)));
    const matches = allPatterns.filter(p => p.startsWith(currentInput)).sort();
    if (matches.length > 0) {
      return matches[0].substring(currentInput.length);
    }
    return '';
  };

  const ghostText = getGhostText();

  const getCommonPrefix = (strings: string[]): string => {
    if (!strings.length) return '';
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (strings[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
        if (!prefix.length) return '';
      }
    }
    return prefix;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!commandHistory) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        const cmd = commandHistory[commandHistory.length - 1 - nextIndex];
        setInput(cmd);
        setHistoryIndex(nextIndex);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!commandHistory) return;
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        const cmd = commandHistory[commandHistory.length - 1 - nextIndex];
        setInput(cmd);
        setHistoryIndex(nextIndex);
      } else if (nextIndex === -1) {
        setInput('');
        setHistoryIndex(-1);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const currentInput = input.toLowerCase();
      if (!currentInput || !commands) return;

      const allPatterns = Array.from(new Set(commands.flatMap(c => c.patterns)));
      const matches = allPatterns.filter(p => p.startsWith(currentInput)).sort();

      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        const commonPrefix = getCommonPrefix(matches);
        if (commonPrefix.length > currentInput.length) {
          setInput(commonPrefix);
        } else {
          // If already at common prefix and multiple matches, list them in history
          setTerminalHistory(prev => [
            ...prev,
            { text: `[ ${operatorName || 'OPERATOR'} ][@]SMOKESCREEN:~ $ ${input}`, type: 'command' },
            { text: matches.join('  '), type: 'output' }
          ]);
        }
      }
    }
  };

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
      setHistoryIndex(-1);
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
                {ghostText && <span className="block-input-wrapper__ghost">{ghostText}</span>}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
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
