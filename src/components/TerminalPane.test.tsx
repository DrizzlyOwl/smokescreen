import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalPane } from './TerminalPane';

// Mock react-virtuoso
vi.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent }: { data: unknown[], itemContent: (index: number, item: unknown) => React.ReactNode }) => (
    <div data-testid="virtuoso-mock">
      {data.map((item, index: number) => (
        <div key={index}>{itemContent(index, item)}</div>
      ))}
    </div>
  ),
}));

// Mock Pane component (as it might have complex logic)
vi.mock('./Pane', () => ({
  Pane: ({ children }: { children: React.ReactNode }) => <div data-testid="pane-mock">{children}</div>,
}));

describe('TerminalPane', () => {
  const mockProps = {
    zIndex: 1,
    onFocus: vi.fn(),
    isActive: true,
    onClose: vi.fn(),
    isMinimized: false,
    onMinimizeToggle: vi.fn(),
    onCommand: vi.fn(),
    terminalHistory: [],
    setTerminalHistory: vi.fn(),
    commandHistory: ['aws', 'p0', 'declare'],
    commands: [
      { id: 'aws', patterns: ['aws'], action: vi.fn(), description: '', category: 'STACK', usage: '' },
      { id: 'p0', patterns: ['p0'], action: vi.fn(), description: '', category: 'THREAT', usage: '' },
      { id: 'declare', patterns: ['declare'], action: vi.fn(), description: '', category: 'ACTION', usage: '' },
      { id: 'theme_amber', patterns: ['theme amber', 'amber'], action: vi.fn(), description: '', category: 'SYSTEM', usage: '' },
      { id: 'theme_cobalt', patterns: ['theme cobalt'], action: vi.fn(), description: '', category: 'SYSTEM', usage: '' },
    ] as import('../hooks/useCommandRegistry').Command[],
    operatorName: 'TEST_OP',
  };

  it('renders correctly', () => {
    const { container } = render(<TerminalPane {...mockProps} />);
    expect(container.querySelector('input')).toBeDefined();
  });

  it('navigates command history with ArrowUp', () => {
    const { container } = render(<TerminalPane {...mockProps} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('declare');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('p0');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('aws');
  });

  it('navigates command history with ArrowDown', () => {
    const { container } = render(<TerminalPane {...mockProps} />);
    const input = container.querySelector('input') as HTMLInputElement;

    // Go up twice
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('p0');

    // Go down once
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('declare');

    // Go down once more
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('');
  });

  it('completes command with Tab (single match)', () => {
    const { container } = render(<TerminalPane {...mockProps} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'dec' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input.value).toBe('declare');
  });

  it('completes common prefix with Tab (multiple matches)', () => {
    const { container } = render(<TerminalPane {...mockProps} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'theme' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    // 'theme amber' and 'theme cobalt' share 'theme '
    expect(input.value).toBe('theme ');
  });

  it('lists suggestions when already at common prefix', () => {
    const { container } = render(<TerminalPane {...mockProps} />);
    const input = container.querySelector('input') as HTMLInputElement;

    // Type 'theme' and press Tab -> completes to 'theme '
    fireEvent.change(input, { target: { value: 'theme' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input.value).toBe('theme ');

    // Press Tab again -> lists suggestions
    fireEvent.keyDown(input, { key: 'Tab' });
    
    // Check if setTerminalHistory was called to list matches
    expect(mockProps.setTerminalHistory).toHaveBeenCalled();
    const lastCall = mockProps.setTerminalHistory.mock.calls[0][0];
    const newState = lastCall([]);
    expect(newState[newState.length - 1].text).toContain('theme amber');
    expect(newState[newState.length - 1].text).toContain('theme cobalt');
  });

  it('resets history index when input is changed manually', () => {
    const { container } = render(<TerminalPane {...mockProps} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('declare');

    fireEvent.change(input, { target: { value: 'new command' } });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    // Should start from the beginning of history again
    expect(input.value).toBe('declare');
  });

  it('displays idle state when history is empty', () => {
    render(<TerminalPane {...mockProps} terminalHistory={[]} />);
    expect(screen.getByText('AWAITING_COMMAND...')).toBeDefined();
  });

  it('renders history lines correctly', () => {
    const history = [
      { text: 'Previous output', type: 'output' as const },
      { text: 'System alert', type: 'system' as const },
    ];
    render(<TerminalPane {...mockProps} terminalHistory={history} />);
    expect(screen.getByText('Previous output')).toBeDefined();
    expect(screen.getByText('System alert')).toBeDefined();
  });

  it('triggers onCommand and shows error state on failure', () => {
    const mockOnCommand = vi.fn(() => false); // Fail command
    const { container } = render(<TerminalPane {...mockProps} onCommand={mockOnCommand} />);
    const input = container.querySelector('input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.submit(container.querySelector('form')!);

    expect(mockOnCommand).toHaveBeenCalledWith('invalid');
    expect(container.querySelector('.block-input-wrapper--error')).toBeDefined();
  });
});
