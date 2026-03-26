import { useEffect, useState, useRef } from 'react';
import type { Severity } from '../data/excuses';
import { Pane } from './Pane';

const DXW_TECH_PEOPLE = [
    'Adam Hughes', 'Alex Edwards', 'Alex Nisbett', 'Alice Richardson', 'Anikó Gaál', 
    'Anna Robin', 'Ash Davies', 'Barry Richards', 'bob walker', 'Brent Cunningham', 
    'Catriona Brown', 'Chanelle Pal', 'Chris Pugh', 'Chris Wright', 'Dan Livings', 
    'David McKee', 'Ed Davey', 'Farrah Farhoudi', 'Florence Leung', 'Fred Sandford', 
    'George Eaton', 'Harriet Horobin-Worley', 'Harry Scott-Trimble', 'Iain MacDonald', 
    'Isobel Seacombe', 'Israt Choudhury', 'James Keasley', 'Jane Maber', 'Joanna Evans', 
    'Joseph Dudley', 'Joseph Kempster', 'Kath Cooper', 'Ksenia Horoshenkova', 'Lee Maguire', 
    'Liz Daly', 'Lola Harre', 'Louise Duffy', 'Marianne Brierley', 'Matthew Passmore', 
    'Melissa Hernandez', 'Michael Huldt', 'Michael Wood', 'Michelle Szaraz', 'Ming Chan', 
    'Nick Jackson', 'Nicky Thompson', 'Nina Belk', 'Patrick Delaney', 'Patrick Fleming', 
    'Rebecca Stagg', 'Rob Skilling', 'Rory Hamilton', 'Sara Gowen', 'Selina Mahar', 
    'Sim Brody', 'Steph Troeth', 'Stuart Harrison', 'Vicky Hallam', 'William Man', 'Ynda Jas'
];

const BOT_NAME = 'incident_io';

const MESSAGES: Record<Severity, string[]> = {
    NOMINAL: [
        'Anyone want coffee?',
        'Did you see the new release notes for the CLI?',
        'Happy Friday everyone!',
        'Lunch today at the usual spot?',
        'The cluster is looking very quiet today',
        'Just finishing up some documentation',
        'Thinking about refactoring the terraform modules',
        'Nominating someone for the "Helper of the Week"'
    ],
    P3: [
        'Routine maintenance check on the cluster',
        'Anyone else seeing slight latency in US-WEST-2?',
        'Updating the Grafana dashboard for the new sprint',
        'Did the CronJob run successfully last night?',
        'Reviewing the latest PR for the ingress controller',
        'Memory usage is looking stable',
        'Starting the weekly security scan',
        'Documentation update: added steps for node rotation'
    ],
    P1: [
        'I see a spike in 503s on the ingress controller',
        'IAM propagation lag is starting to cause issues',
        'Rollback initiated but failing for some reason',
        'Anyone seen the RDS metrics? It is starting to flatline',
        'Traffic is blackholing on some nodes, investigating',
        'Disk pressure on node-04, purging logs now',
        'Vault seal status is showing as LOCKED'
    ],
    P0: [
        'WHO IS DRAINING PROD NODES??',
        'INCIDENT DECLARED: P0 - ALL HANDS ON DECK',
        'BGP session dropped on US-EAST-1 - TOTAL BLACKOUT',
        'DATABASE IS IN READ-ONLY MODE - EMERGENCY',
        'I need an SRE in the war room IMMEDIATELY',
        'THE ENTIRE STACK IS UNREACHABLE - SHUT IT DOWN',
        'K8S CONTROL PLANE IS DOWN - NO API ACCESS'
    ]
};

interface ChatMessage {
    user: string;
    text: string;
    time: string;
    isBot: boolean;
}

export const WarRoom = ({ 
    severity, 
    stack, 
    zIndex, 
    onFocus, 
    isActive, 
    uplinkId, 
    onClose, 
    playPing,
    playTagPing,
    onNewMessage,
    operatorName
}: { 
    severity: Severity, 
    stack: string, 
    zIndex: number, 
    onFocus: () => void, 
    isActive: boolean, 
    uplinkId: string, 
    onClose: () => void, 
    playPing?: () => void,
    playTagPing?: () => void,
    onNewMessage?: () => void,
    operatorName: string
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const systemMsg = {
        user: BOT_NAME,
        text: `--- ALERT LEVEL UPDATED TO ${severity} [${stack}] ---`,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        isBot: true
    };
    // Use a small timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
        setMessages(prev => [...prev, systemMsg].slice(-100));
    }, 0);
    return () => clearTimeout(timer);
  }, [severity, stack]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

// Human technical commentary
useEffect(() => {
  const channel = new BroadcastChannel(`smokescreen_room_${uplinkId}`);
  const delay = severity === 'P0' ? 1200 : severity === 'P1' ? 2500 : severity === 'P3' ? 5000 : 8000;

  const interval = setInterval(() => {
    const pool = MESSAGES[severity];
    const user = DXW_TECH_PEOPLE[Math.floor(Math.random() * DXW_TECH_PEOPLE.length)];
    let text = pool[Math.floor(Math.random() * pool.length)];

    if (Math.random() > 0.7) {
        const tag = operatorName.split(' ')[0].toLowerCase() || 'operator';
        text = `@${tag} ${text}`;
    }

    const newMessage = {
        user,
        text,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        isBot: false
    };

    // Broadcast to mobile/companion view
    channel.postMessage({ type: 'CHAT_MESSAGE', message: newMessage });

    if (text.includes('@')) {
        playTagPing?.();
    } else {
        playPing?.();
    }
    
    onNewMessage?.();
    setMessages(prev => [...prev, newMessage].slice(-100));
  }, delay);

  return () => {
      clearInterval(interval);
      channel.close();
  };
}, [severity, uplinkId, playPing, playTagPing, onNewMessage, operatorName]);

  const slackFontStack = '"Slack-Lato", "appleLogo", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';

  return (
    <Pane
      title="DXW_SRE_INCIDENT_RESPONSE_UPLINK"
      icon="#"
      iconColor="#e01e5a"
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
