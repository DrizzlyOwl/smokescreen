import { useRef, useEffect, useState } from 'react';
import { Pane } from './Pane';
import { ChatIcon } from './Icons';
import { type ChatMessage } from '../hooks/useIncidentChat';

export const WarRoom = ({ 
    messages,
    zIndex, 
    onFocus, 
    isActive, 
    onClose,
    sendMessage,
    isDeclared,
    operatorName
}: { 
    messages: ChatMessage[],
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void,
    sendMessage: (text: string, user: string) => void,
    isDeclared: boolean,
    operatorName: string
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isDeclared) {
        sendMessage(inputText, operatorName);
        setInputText('');
    }
  };

  const slackFontStack = '"Slack-Lato", "appleLogo", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

  return (
    <Pane
      title="CENTRAL_SRE_INCIDENT_RESPONSE_UPLINK"
      icon={<ChatIcon />}
      initialPos={{ x: 40, y: 40 }}
      initialSize={{ width: 450, height: 350 }}
      zIndex={zIndex}
      onFocus={onFocus}
      isActive={isActive}
      defaultMinimized={false} 
      onClose={onClose}
    >
      <div 
        ref={scrollRef}
        className="war-room__chat-container"
        style={{ fontFamily: slackFontStack }}
      >
        {messages.map((m, i) => {
          // Determine color based on role in user string (e.g. "Name (Role)")
          let avatarColor = '#35373b'; // Default
          if (m.isBot) avatarColor = '#e01e5a';
          else if (m.user.includes('DBA') || m.user.includes('Arch')) avatarColor = 'var(--terminal-amber)';
          else if (m.user.includes('SRE') || m.user.includes('Sec')) avatarColor = 'var(--terminal-green)';
          else if (m.user.includes('Lead') || m.user.includes('Architect')) avatarColor = 'var(--terminal-red)';
          else if (m.user.includes('Backend') || m.user.includes('Platform')) avatarColor = '#7c4dff';
          
          return (
            <div key={i} className="war-room__message">
              <div 
                className={`war-room__message-avatar war-room__message-avatar--${m.isBot ? 'bot' : 'user'}`}
                style={{ backgroundColor: avatarColor }}
              >
                  {m.user.charAt(0).toUpperCase()}
              </div>
              <div className="war-room__message-content">
                <div className="war-room__message-header">
                  <span className="war-room__message-header-user">{m.user}</span>
                  <span className="war-room__message-header-time">{m.time}</span>
                </div>
                <div className="war-room__message-body">
                  {m.text.split(' ').map((word, idx) => (
                    word.startsWith('@') 
                      ? <span key={idx} className="war-room__message-tag">{word} </span>
                      : word + ' '
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Input Area */}
      <form onSubmit={handleSend} className="war-room__input-area">
        <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isDeclared ? "Type a message..." : "SYSTEM_LOCKED: INCIDENT_NOT_DECLARED"} 
            disabled={!isDeclared}
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
    </Pane>
  );
};
