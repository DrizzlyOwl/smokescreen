import { useState, useRef, useEffect } from 'react';

interface CommandInputProps {
  onCommand: (cmd: string) => boolean; // Return true if valid, false if invalid
}

export const CommandInput = ({ onCommand }: CommandInputProps) => {
  const [input, setInput] = useState('');
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener('click', handleGlobalClick);
    inputRef.current?.focus();
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

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
    <div style={{
      marginTop: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'monospace',
      fontSize: '1.5rem',
      color: isError ? 'var(--terminal-red)' : 'var(--terminal-green)',
      textShadow: isError ? '0 0 10px var(--terminal-red)' : '0 0 10px var(--terminal-green)',
      transition: 'color 0.1s ease',
      borderBottom: isError ? '2px solid var(--terminal-red)' : 'none',
      paddingBottom: isError ? '5px' : '0'
    }}>
      <span>{'>'}</span>
      <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isError ? "INVALID_COMMAND_" : "ENTER_COMMAND_"}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            outline: 'none',
            textTransform: 'uppercase'
          }}
        />
      </form>
    </div>
  );
};
