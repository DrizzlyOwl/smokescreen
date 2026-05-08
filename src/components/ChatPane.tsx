import { useRef, useState, useCallback } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { Pane } from './Pane';
import { ChatIcon, CheckIcon } from './Icons';
import { type ChatMessage } from '../contexts/types';
import { ChatMessageItem } from './ChatMessageItem';
import '../styles/ChatPane.scss';

export const ChatPane = ({ 
    messages,
    typingUsers,
    zIndex, 
    onFocus, 
    isActive, 
    onClose,
    sendMessage,
    isDeclared,
    operatorName,
    markAsRead,
    markAllAsRead,
    isMinimized,
    onMinimizeToggle,
    isPoppedOut,
    onPopOutToggle,
    isSnappedMain,
    onSnapMainToggle,
    initialPos = { x: 40, y: 40 },
    initialSize = { width: 450, height: 400 }
}: { 
    messages: ChatMessage[],
    typingUsers: string[],
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void,
    sendMessage: (text: string, user: string, id?: string, isBot?: boolean, bio?: string) => void,
    isDeclared: boolean,
    operatorName: string,
    markAsRead: (id: string) => void,
    markAllAsRead: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void,
    isPoppedOut?: boolean,
    onPopOutToggle?: () => void,
    isSnappedMain?: boolean,
    onSnapMainToggle?: () => void,
    initialPos?: { x: number, y: number },
    initialSize?: { width: number, height: number }
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [inputText, setInputText] = useState('');
  const [visibleBios, setVisibleBios] = useState<Set<string>>(new Set());
  const unreadCount = messages.filter(m => !m.read).length;

  const toggleBio = useCallback((msgId: string) => {
    setVisibleBios(prev => {
        const next = new Set(prev);
        if (next.has(msgId)) next.delete(msgId);
        else next.add(msgId);
        return next;
    });
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isDeclared) {
        sendMessage(inputText, operatorName);
        setInputText('');
    }
  };

  const getAvatarColor = (user: string) => {
    // Simple string hash for deterministic colors
    let hash = 0;
    for (let i = 0; i < user.length; i++) {
        hash = user.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
        'var(--terminal-green)',
        'var(--terminal-amber)',
        'var(--terminal-cobalt)',
        'var(--terminal-red)',
        'var(--status-p3)',
        '#f0f', // Magenta
        '#0ff'  // Cyan
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const isWithinOneMinute = (t1: string, t2: string) => {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    
    // Simple check - within same hour and same/next minute
    // or crossing hour boundary
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    return Math.abs(mins1 - mins2) <= 1;
  };

  const slackFontStack = '"Slack-Lato", "appleLogo", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

  return (
    <Pane
      id="chat"
      title={`CENTRAL_SRE_INCIDENT_RESPONSE_CHANNEL ${unreadCount > 0 ? `(${unreadCount}_UNREAD)` : ''}`}
      icon={<ChatIcon />}
      initialPos={initialPos}
      initialSize={initialSize}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      isPoppedOut={isPoppedOut}
      onPopOutToggle={onPopOutToggle}
      isSnappedMain={isSnappedMain}
      onSnapMainToggle={onSnapMainToggle}
      onClose={onClose}
    >
      <div className="chat-pane">
        {messages.length === 0 && (
          <div className="chat-pane__empty-state">
            <p>It's quiet... too quiet. The calm before the P0 storm.</p>
          </div>
        )}

        {unreadCount > 0 && (
            <div className="chat-pane__unread-banner">
                <span>{unreadCount} new messages since last focus</span>
                <button onClick={markAllAsRead} className="chat-pane__unread-banner-action">
                    Mark all as read <CheckIcon />
                </button>
            </div>
        )}
        <Virtuoso
          ref={virtuosoRef}
          className="chat-pane__chat-container"
          style={{ fontFamily: slackFontStack }}
          data={messages}
          initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
          followOutput="smooth"
          alignToBottom
          itemContent={(index, m) => {
            const isGrouped = index > 0 && 
                messages[index-1].user === m.user && 
                !m.isBot &&
                isWithinOneMinute(messages[index-1].time, m.time);
                
            return (
                <ChatMessageItem 
                    message={{ ...m, showBio: visibleBios.has(m.id) }} 
                    isGrouped={isGrouped} 
                    avatarColor={getAvatarColor(m.user)} 
                    onRead={markAsRead}
                    onUserClick={toggleBio}
                    isActive={isActive}
                />
            );
          }}
          components={{
            Footer: () => typingUsers.length > 0 ? (
                <div className="chat-pane__typing">
                  <div className="chat-pane__typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <span className="chat-pane__typing-text">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0]} is typing...` 
                      : typingUsers.length === 2 
                        ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                        : 'Multiple people are typing...'}
                  </span>
                </div>
            ) : null
          }}
        />
        
        {/* Input Area */}
        <form onSubmit={handleSend} className="chat-pane__input-area">
          <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isDeclared ? "Type a message..." : "SYSTEM_LOCKED: INCIDENT_NOT_DECLARED"} 
              disabled={!isDeclared}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
              className="chat-pane__input-area-field"
              style={{ 
                  cursor: isDeclared ? 'text' : 'not-allowed',
                  opacity: isDeclared ? 1 : 0.5
              }}
          />
          <button 
              type="submit"
              disabled={!isDeclared || !inputText.trim()}
              className="chat-pane__input-area-icon"
              style={{ 
                  border: 'none', 
                  cursor: isDeclared ? 'pointer' : 'not-allowed' 
              }}
          >
              ⏎
          </button>
        </form>
      </div>
    </Pane>
  );
};
