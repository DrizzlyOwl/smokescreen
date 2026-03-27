import { useRef, useEffect } from 'react';
import { Pane } from './Pane';
import { ChatIcon } from './Icons';
import { type ChatMessage } from '../hooks/useIncidentChat';

export const WarRoom = ({ 
    messages,
    zIndex, 
    onFocus, 
    isActive, 
    onClose, 
}: { 
    messages: ChatMessage[],
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    onClose: () => void, 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
        style={{ 
          flex: 1,
          overflowY: 'auto',
          display: 'flex', 
          flexDirection: 'column', 
          fontFamily: slackFontStack,
          padding: '12px',
          boxSizing: 'border-box'
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ 
                width: '36px', height: '36px', borderRadius: '4px', 
                background: m.isBot ? '#e01e5a' : '#35373b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 'var(--text-l4)', fontWeight: '900', color: 'white'
            }}>
                {m.user.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: '900', color: 'white', fontSize: 'var(--text-l4)' }}>{m.user}</span>
                <span style={{ fontSize: 'var(--text-l4)', opacity: 0.5 }}>{m.time}</span>
              </div>
              <div style={{ lineHeight: '1.46668', fontSize: 'var(--text-l4)' }}>
                {m.text.split(' ').map((word, idx) => (
                  word.startsWith('@') 
                    ? <span key={idx} style={{ color: '#1264a3', background: 'rgba(29, 155, 209, 0.1)', borderRadius: '3px', padding: '0 4px', fontWeight: 'bold' }}>{word} </span>
                    : word + ' '
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dummy Input */}
      <div style={{ 
          padding: '12px', 
          borderTop: '1px solid #35373b', 
          background: '#121519',
          display: 'flex',
          gap: '10px'
      }}>
        <input 
            type="text" 
            placeholder="Type a message..." 
            disabled
            style={{ 
                flex: 1, 
                background: '#1a1d21', 
                border: '1px solid #35373b', 
                borderRadius: '4px', 
                padding: '8px 12px', 
                color: '#adbac7',
                fontFamily: 'inherit',
                fontSize: 'var(--text-l4)',
                outline: 'none',
                cursor: 'not-allowed'
            }} 
        />
        <div style={{ 
            width: '32px', 
            height: '32px', 
            background: '#35373b', 
            borderRadius: '4px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: 0.5,
            fontSize: 'var(--text-l4)'
        }}>
            ⏎
        </div>
      </div>
    </Pane>
  );
};
