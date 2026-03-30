import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { Pane } from './Pane';
import { ChatIcon, CheckIcon } from './Icons';
import { type ChatMessage } from '../hooks/useIncidentChat';
import '../styles/WarRoom.scss';

interface ExtendedChatMessage extends ChatMessage {
    showBio?: boolean;
}

const ChatMessageItem = memo(({ 
    message, 
    isGrouped, 
    avatarColor, 
    onRead,
    onUserClick
}: { 
    message: ExtendedChatMessage, 
    isGrouped: boolean, 
    avatarColor: string,
    onRead: (id: string) => void,
    onUserClick: (id: string) => void
}) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (message.read) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    timerRef.current = window.setTimeout(() => {
                        onRead(message.id);
                    }, 3000);
                } else {
                    if (timerRef.current) {
                        window.clearTimeout(timerRef.current);
                        timerRef.current = null;
                    }
                }
            },
            { threshold: 0.5 }
        );

        if (itemRef.current) {
            observer.observe(itemRef.current);
        }

        return () => {
            observer.disconnect();
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [message.id, message.read, onRead]);

    return (
        <div 
            ref={itemRef}
            className={`war-room__message ${isGrouped ? 'war-room__message--grouped' : ''} ${!message.read ? 'war-room__message--unread' : ''}`}
        >
            {isGrouped && !message.read && (
                <div className="war-room__message-unread-dot" title="Unread message" />
            )}
            {!isGrouped && (
            <div 
                className={`war-room__message-avatar war-room__message-avatar--${message.isBot ? 'bot' : 'user'}`}
                style={{ backgroundColor: !message.avatarUrl ? avatarColor : undefined }}
            >
                {message.avatarUrl && !message.isBot ? (
                    <img src={message.avatarUrl} alt={message.user} />
                ) : (
                    message.user.charAt(0).toUpperCase()
                )}
            </div>
            )}
            <div className="war-room__message-content">
            {!isGrouped && (
                <div className="war-room__message-header">
                <span 
                    className="war-room__message-header-user"
                    onClick={() => onUserClick(message.id)}
                >
                    {message.user}
                </span>
                {message.bio && message.showBio && (
                    <span className="war-room__message-bio">
                        {message.bio}
                    </span>
                )}
                <span className="war-room__message-header-time">{message.time}</span>
                <span className="war-room__message-header-unread">NEW</span>
                </div>
            )}
            <div className="war-room__message-body">
                {message.text.split(' ').map((word, idx) => (
                word.startsWith('@') 
                    ? <span key={idx} className="war-room__message-tag">{word} </span>
                    : word + ' '
                ))}
            </div>
            </div>
        </div>
    );
});

export const WarRoom = ({ 
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
    onMinimizeToggle
}: { 
    messages: ChatMessage[],
    typingUsers: string[],
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void,
    sendMessage: (text: string, user: string, id?: string, isBot?: boolean) => void,
    isDeclared: boolean,
    operatorName: string,
    markAsRead: (id: string) => void,
    markAllAsRead: () => void,
    isMinimized: boolean,
    onMinimizeToggle: () => void
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (scrollRef.current) {
      const isNearBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 100;
      if (isNearBottom) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, typingUsers]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isDeclared) {
        sendMessage(inputText, operatorName);
        setInputText('');
        setTimeout(() => {
            if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 0);
    }
  };

  const getAvatarColor = (m: ChatMessage) => {
    if (m.isBot) return 'var(--status-p0)';
    if (m.user.includes('DBA') || m.user.includes('Arch')) return 'var(--status-p3)';
    if (m.user.includes('SRE') || m.user.includes('Sec')) return 'var(--status-nominal)';
    if (m.user.includes('Lead') || m.user.includes('Architect')) return 'var(--status-p0)';
    if (m.user.includes('Backend') || m.user.includes('Platform')) return 'var(--terminal-cobalt)';
    return 'var(--ui-border)';
  };

  const slackFontStack = '"Slack-Lato", "appleLogo", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

  return (
    <Pane
      id="chat"
      title={`CENTRAL_SRE_INCIDENT_RESPONSE_UPLINK ${unreadCount > 0 ? `(${unreadCount}_UNREAD)` : ''}`}
      icon={<ChatIcon />}
      initialPos={{ x: 40, y: 40 }}
      initialSize={{ width: 450, height: 400 }}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      isMinimized={isMinimized}
      onMinimizeToggle={onMinimizeToggle}
      onClose={onClose}
    >
      <div className="war-room">
        {unreadCount > 0 && (
            <div className="war-room__unread-banner">
                <span>{unreadCount} new messages since last focus</span>
                <button onClick={markAllAsRead} className="war-room__unread-banner-action">
                    Mark all as read <CheckIcon />
                </button>
            </div>
        )}
        <div 
          ref={scrollRef}
          className="war-room__chat-container"
          style={{ fontFamily: slackFontStack }}
        >
          {messages.map((m, i) => {
            const isGrouped = i > 0 && messages[i-1].user === m.user && !m.isBot;
            return (
                <ChatMessageItem 
                    key={m.id} 
                    message={{ ...m, showBio: visibleBios.has(m.id) }} 
                    isGrouped={isGrouped} 
                    avatarColor={getAvatarColor(m)} 
                    onRead={markAsRead}
                    onUserClick={toggleBio}
                />
            );
          })}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="war-room__typing">
              <div className="war-room__typing-dots">
                <span></span><span></span><span></span>
              </div>
              <span className="war-room__typing-text">
                {typingUsers.length === 1 
                  ? `${typingUsers[0]} is typing...` 
                  : typingUsers.length === 2 
                    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                    : 'Multiple people are typing...'}
              </span>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <form onSubmit={handleSend} className="war-room__input-area">
          <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isDeclared ? "Type a message..." : "SYSTEM_LOCKED: INCIDENT_NOT_DECLARED"} 
              disabled={!isDeclared}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(e)}
              className="war-room__input-area-field"
              style={{ 
                  cursor: isDeclared ? 'text' : 'not-allowed',
                  opacity: isDeclared ? 1 : 0.5
              }}
          />
          <button 
              type="submit"
              disabled={!isDeclared || !inputText.trim()}
              className="war-room__input-area-icon"
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
