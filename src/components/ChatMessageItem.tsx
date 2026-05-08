import { memo } from 'react';
import { type ChatMessage } from '../contexts/types';
import { getPersonByRole } from '../utils/team';
import { useUnreadTracker } from '../hooks/useUnreadTracker';
import '../styles/ChatMessageItem.scss';

export interface ExtendedChatMessage extends ChatMessage {
    showBio?: boolean;
}

interface ChatMessageItemProps {
    message: ExtendedChatMessage;
    isGrouped: boolean;
    avatarColor: string;
    onRead: (id: string) => void;
    onUserClick: (id: string) => void;
    isActive: boolean;
}

export const ChatMessageItem = memo(({ 
    message, 
    isGrouped, 
    avatarColor, 
    onRead,
    onUserClick,
    isActive
}: ChatMessageItemProps) => {
    const itemRef = useUnreadTracker({
        id: message.id,
        read: !!message.read,
        isActive,
        onRead
    });

    return (
        <div 
            ref={itemRef}
            className={`chat-message-item ${isGrouped ? 'chat-message-item--grouped' : ''} ${!message.read ? 'chat-message-item--unread' : ''}`}
        >
            {isGrouped && !message.read && (
                <div className="chat-message-item__unread-dot" title="Unread message" />
            )}
            {!isGrouped && (
            <div 
                className={`chat-message-item__avatar chat-message-item__avatar--${message.isBot ? 'bot' : 'user'}`}
                style={{ backgroundColor: !message.avatarUrl ? avatarColor : undefined, cursor: 'pointer' }}
                onClick={() => onUserClick(message.id)}
            >
                {message.avatarUrl && !message.isBot ? (
                    <img src={message.avatarUrl} alt={message.user} />
                ) : (
                    message.user.charAt(0).toUpperCase()
                )}
            </div>
            )}
            <div className="chat-message-item__content">
            {!isGrouped && (
                <div className="chat-message-item__header">
                <span 
                    className="chat-message-item__header-user"
                    onClick={() => onUserClick(message.id)}
                >
                    {message.user}
                </span>
                {message.bio && (
                    <span 
                        className="chat-message-item__header-role-tag"
                        onClick={() => onUserClick(message.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {message.bio}
                    </span>
                )}
                <span className="chat-message-item__header-time">{message.time}</span>
                <span className="chat-message-item__header-unread">NEW</span>
                </div>
            )}
            <div className="chat-message-item__body">
                {message.text.split(' ').map((word, idx) => (
                word.startsWith('@') 
                    ? <span key={idx} className="chat-message-item__tag">{word} </span>
                    : word + ' '
                ))}
            </div>
            {message.showBio && (
                <div className="chat-message-item__bio-bubble">
                    <div className="chat-message-item__bio-bubble-title">{message.bio || 'STAFF'}</div>
                    <div className="chat-message-item__bio-bubble-text">{getPersonByRole(message.bio || 'STAFF').bio}</div>
                </div>
            )}
            </div>
        </div>
    );
});
