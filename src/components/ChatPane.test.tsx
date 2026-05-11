import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatPane } from './ChatPane';
import type { ChatMessage } from '../contexts/types';

// Mock react-virtuoso
vi.mock('react-virtuoso', () => ({
  Virtuoso: <T extends { id?: string }>({ data, itemContent, components }: { 
    data: T[], 
    itemContent: (index: number, item: T) => React.ReactNode,
    components?: { Footer?: React.ComponentType }
  }) => (
    <div data-testid="virtuoso-mock">
      {data.map((item, index) => (
        <div key={item.id || index}>
          {itemContent(index, item)}
        </div>
      ))}
      {components?.Footer && <components.Footer />}
    </div>
  ),
}));

// Mock Pane
vi.mock('./Pane', () => ({
  Pane: ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div data-testid="pane-mock">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

class MockIntersectionObserver {
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

describe('ChatPane', () => {
  const mockMessages: ChatMessage[] = [
    { id: '1', user: 'alice', text: 'hello', time: '10:00', read: true, isBot: false },
    { id: '2', user: 'bob', text: 'hi alice', time: '10:01', read: false, isBot: false },
  ];

  const defaultProps = {
    messages: mockMessages,
    typingUsers: [],
    zIndex: 10,
    onFocus: vi.fn(),
    isActive: true,
    onClose: vi.fn(),
    sendMessage: vi.fn(),
    isDeclared: true,
    operatorName: 'operator',
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    isMinimized: false,
    onMinimizeToggle: vi.fn(),
    isPoppedOut: false,
    onPopOutToggle: vi.fn(),
    isSnappedMain: false,
    onSnapMainToggle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders messages correctly', () => {
    render(<ChatPane {...defaultProps} />);
    expect(screen.getByText('hello')).toBeDefined();
    expect(screen.getByText('hi alice')).toBeDefined();
    expect(screen.getAllByText('alice')).toBeDefined(); 
    expect(screen.getByText('bob')).toBeDefined();
  });

  it('shows unread banner when there are unread messages', () => {
    render(<ChatPane {...defaultProps} />);
    expect(screen.getByText(/1 new messages/)).toBeDefined();
    expect(screen.getByText(/CENTRAL_SRE_INCIDENT_RESPONSE_CHANNEL \(1_UNREAD\)/)).toBeDefined();
  });

  it('calls markAllAsRead when banner button is clicked', () => {
    render(<ChatPane {...defaultProps} />);
    const button = screen.getByText(/Mark all as read/);
    fireEvent.click(button);
    expect(defaultProps.markAllAsRead).toHaveBeenCalled();
  });

  it('calls sendMessage when form is submitted', () => {
    render(<ChatPane {...defaultProps} />);
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'testing message' } });
    fireEvent.submit(screen.getByRole('button', { name: '⏎' }));

    expect(defaultProps.sendMessage).toHaveBeenCalledWith('testing message', 'operator');
  });

  it('disables input when incident is not declared', () => {
    render(<ChatPane {...defaultProps} isDeclared={false} />);
    const input = screen.getByPlaceholderText('SYSTEM_LOCKED: INCIDENT_NOT_DECLARED');
    expect((input as HTMLInputElement).disabled).toBe(true);
  });

  it('shows typing indicators', () => {
    render(<ChatPane {...defaultProps} typingUsers={['charlie', 'dave']} />);
    expect(screen.getByText('charlie and dave are typing...')).toBeDefined();
  });

  it('groups messages from same user within same minute', () => {
    const groupedMessages: ChatMessage[] = [
        { id: '1', user: 'alice', text: 'msg 1', time: '10:00', read: true, isBot: false },
        { id: '2', user: 'alice', text: 'msg 2', time: '10:00', read: true, isBot: false },
    ];
    render(<ChatPane {...defaultProps} messages={groupedMessages} />);
    
    // Only one avatar should be rendered for grouped messages
    const avatars = screen.getAllByText('A');
    expect(avatars.length).toBe(1);
  });
});
