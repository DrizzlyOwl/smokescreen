import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ActivityIcon, MinimizeIcon, MaximizeIcon } from './Icons';
import { MIN_TERMINAL_HEIGHT, MAX_TERMINAL_HEIGHT_PERCENT, DEFAULT_TERMINAL_HEIGHT } from '../hooks/useScreenManager';
import type { Command } from '../hooks/useCommandRegistry';
import type { TerminalLine } from '../hooks/useIncidentState';
import '../styles/TerminalStrip.scss';

interface TerminalStripProps {
  height: number;
  collapsed: boolean;
  onHeightChange: (height: number) => void;
  onToggleCollapse: () => void;
  onCommand: (cmd: string) => boolean;
  terminalHistory: TerminalLine[];
  setTerminalHistory: React.Dispatch<React.SetStateAction<TerminalLine[]>>;
  commandHistory: string[];
  commands: Command[];
  operatorName: string;
  isActive?: boolean;
}

const COLLAPSED_HEIGHT = 32; // Header only

/**
 * TerminalStrip is a persistent terminal at the bottom of the screen.
 * It can be resized via a drag handle and collapsed to header-only.
 */
export const TerminalStrip: React.FC<TerminalStripProps> = ({
  height,
  collapsed,
  onHeightChange,
  onToggleCollapse,
  onCommand,
  terminalHistory,
  setTerminalHistory,
  commandHistory,
  commands,
  operatorName,
  isActive = true,
}) => {
  const [input, setInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(DEFAULT_TERMINAL_HEIGHT);

  // Focus input when expanded and active
  useEffect(() => {
    if (isActive && !collapsed) {
      inputRef.current?.focus();
    }
  }, [isActive, collapsed]);

  // Handle drag resize
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartHeight.current = height;
  }, [height]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const delta = dragStartY.current - clientY; // Dragging up = positive delta = taller
      const newHeight = dragStartHeight.current + delta;
      
      // Clamp to min/max
      const maxHeight = window.innerHeight * MAX_TERMINAL_HEIGHT_PERCENT;
      const clampedHeight = Math.max(MIN_TERMINAL_HEIGHT, Math.min(newHeight, maxHeight));
      onHeightChange(clampedHeight);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, onHeightChange]);

  // Input handling
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
          setTerminalHistory(prev => [
            ...prev,
            { text: input, type: 'command' },
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

  const displayHeight = collapsed ? COLLAPSED_HEIGHT : height;

  return (
    <div 
      ref={containerRef}
      className={`terminal-strip ${collapsed ? 'terminal-strip--collapsed' : ''} ${isDragging ? 'terminal-strip--dragging' : ''}`}
      style={{ height: displayHeight }}
    >
      {/* Drag handle */}
      {!collapsed && (
        <div 
          className="terminal-strip__drag-handle"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          title="Drag to resize terminal"
        />
      )}

      {/* Header */}
      <div className="terminal-strip__header">
        <div className="terminal-strip__title">
          <ActivityIcon />
          <span>SYSTEM_TERMINAL_CORE</span>
          <span className="terminal-strip__shortcut">[^`]</span>
        </div>
        <button 
          className="terminal-strip__toggle"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand terminal' : 'Collapse terminal'}
        >
          {collapsed ? <MaximizeIcon /> : <MinimizeIcon />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div 
          className="terminal-strip__content"
          onClick={() => inputRef.current?.focus()}
        >
          {terminalHistory.length === 0 ? (
            <div className="terminal-strip__output" style={{ display: 'flex' }}>
              <div className="terminal-strip__idle">AWAITING_COMMAND...</div>
            </div>
          ) : (
            <Virtuoso
              className="terminal-strip__output"
              data={terminalHistory}
              initialTopMostItemIndex={terminalHistory.length > 0 ? terminalHistory.length - 1 : 0}
              followOutput="smooth"
              alignToBottom
              itemContent={(_index, line) => (
                <div className={`terminal-strip__line terminal-strip__line--${line.type}`}>
                  {line.type === 'command' && (
                    <span className="terminal-strip__prefix">{operatorName || 'OP'}@SS:~$ </span>
                  )}
                  <span>{line.text}</span>
                </div>
              )}
            />
          )}
          
          <form onSubmit={handleSubmit} className="terminal-strip__input-area">
            <span className="terminal-strip__prefix">{operatorName || 'OP'}@SS:~$</span>
            <div className={`block-input-wrapper ${isError ? 'block-input-wrapper--error' : ''}`} style={{ flex: 1 }}>
              <span className="block-input-wrapper__display">
                {input}
                <span className={`block-input-wrapper__cursor ${isActive ? 'block-input-wrapper__cursor--blinking' : ''}`} />
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
      )}
    </div>
  );
};
