import { useState, useEffect, useRef, useCallback } from 'react';
import { generateBitmapAvatar } from '../utils/avatarGenerator';
import { useSync } from './useSync';
import { type Severity, type Stack } from '../data/incidents';
import { useIncidentStore } from '../store/useIncidentStore';
import { STACK_MESSAGES, getLocalizedWatercooler } from '../data/chatMessages';
import { type ChatMessage } from '../contexts/types';

import { formatTime, getRandomItem } from '../utils/telemetry';

export const useIncidentChat = (
    severity: Severity,
    stack: Stack,
    operatorName: string,
    terminalId: string,
    onNewMessage: (isTag: boolean) => void,
    playPing?: () => void,
    playTagPing?: () => void,
    isActive: boolean = true,
    isFocused: boolean = false,
    chatMultiplier: number = 1,
    log?: (action: string, data?: unknown) => void
) => {
    const isPaused = useIncidentStore(state => state.isPaused);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const lastSeverity = useRef<Severity>(severity);
    const lastMessageText = useRef<string>('');
    const { send, subscribe } = useSync();
    const userAvatars = useRef<Record<string, string>>({});

    const getAvatarForUser = useCallback((user: string) => {
        if (userAvatars.current[user]) return userAvatars.current[user];

        const avatar = generateBitmapAvatar(user);
        userAvatars.current[user] = avatar;
        return avatar;
    }, []);
    const processUserAndBio = useCallback((rawName: string, isBot: boolean = false) => {
        let name = rawName;
        let bio = '';

        // 1. Extract role from brackets if present (from chatGenerator)
        const bracketMatch = rawName.match(/^(.*?) \[(.*?)\]$/);
        if (bracketMatch) {
            name = bracketMatch[1];
            bio = bracketMatch[2];
        }

        // 2. Enforce first name only for humans
        if (!isBot) {
            // Split by space, underscore, or dash and take the first part
            const nameParts = name.split(/[ _-]/);
            name = nameParts[0];
        }

        // 3. If no bio was in brackets, try to extract from original rawName parts
        if (!bio) {
            const titles = [
                'SRE', 'DBA', 'LEAD', 'ARCHITECT', 'DIRECTOR', 'ENG', 'MANAGER', 
                'PLATFORM', 'BACKEND', 'NETWORK', 'SECOPS', 'MONITORING', 'ONCALL',
                'CISO', 'CTO', 'LEGAL', 'VP', 'NETENG', 'DATA', 'SYSTEMS', 'API'
            ];
            const rawParts = rawName.toUpperCase().split(/[ _/[\]]/);
            const foundTitle = rawParts.find(p => titles.includes(p));
            bio = foundTitle || (isBot ? 'SYSTEM_BOT' : 'STAFF');
        }

        return { name, bio: bio.toUpperCase() };
    }, []);

    const markAsRead = useCallback((messageId: string) => {
        setMessages(prev => {
            const index = prev.findIndex(m => m.id === messageId);
            if (index !== -1 && !prev[index].read) {
                const next = [...prev];
                next[index] = { ...next[index], read: true };
                return next;
            }
            return prev;
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        setMessages(prev => prev.map(m => m.read ? m : { ...m, read: true }));
    }, []);

    useEffect(() => {
        const unsubscribe = subscribe((data) => {
            if (data.type === 'CHAT_MESSAGE') {
                const incomingMsg: ChatMessage = { ...data.message, read: isFocused };
                
                if (!incomingMsg.avatarUrl && !incomingMsg.isBot) {
                    incomingMsg.avatarUrl = getAvatarForUser(incomingMsg.user);
                }

                setMessages(prev => [...prev, incomingMsg].slice(-100));
                
                const operatorTag = `@${operatorName.split(' ')[0].toLowerCase()}`;
                const text = data.message.text.toLowerCase();
                const isTag = text.includes('@operator') || text.includes(operatorTag);
                
                if (isTag) {
                    playTagPing?.();
                } else {
                    playPing?.();
                }
                onNewMessage(isTag);
                setTypingUsers(prev => prev.filter(u => u !== data.message.user));
            } else if (data.type === 'TYPING_INDICATOR') {
                setTypingUsers(prev => {
                    if (data.isTyping) {
                        return prev.includes(data.user) ? prev : [...prev, data.user];
                    } else {
                        return prev.filter(u => u !== data.user);
                    }
                });
            }
        });
        return unsubscribe;
    }, [subscribe, onNewMessage, playPing, playTagPing, isFocused, getAvatarForUser, operatorName]);

    const sendMessage = useCallback((text: string, user: string, id?: string, isBot: boolean = false, bioOverride?: string) => {
        const { name, bio: defaultBio } = processUserAndBio(user, isBot);
        const newMessage: ChatMessage = {
            id: id || `msg-${Math.random().toString(36).substring(2, 11)}`,
            user: name,
            bio: bioOverride || defaultBio,
            text,
            time: formatTime(),
            isBot,
            read: true,
            avatarUrl: isBot ? undefined : getAvatarForUser(user)
        };
        send({ type: 'CHAT_MESSAGE', message: newMessage });
    }, [send, getAvatarForUser, processUserAndBio]);

    useEffect(() => {
        if (lastSeverity.current !== severity) {
            const systemMsg: ChatMessage = {
                id: `sys-${Date.now()}`,
                user: 'Smokescreen',
                bio: 'CORE_OS',
                text: `--- ALERT LEVEL UPDATED TO ${severity} [${stack}] ---`,
                time: formatTime(),
                isBot: true,
                read: isFocused
            };
            setTimeout(() => {
                setMessages(prev => [...prev, systemMsg].slice(-100));
            }, 0);
            lastSeverity.current = severity;
        }
    }, [severity, stack, isFocused]);

    const getDynamicMessage = useCallback(async (currentSeverity: Severity): Promise<ChatMessage> => {
        let userRaw = 'Tech_Staff';
        let bioOverride = '';
        let time = formatTime();
        let isBot = false;
        const id = `msg-${Math.random().toString(36).substring(2, 11)}`;

        try {
            const { generateDynamicMessage } = await import('../utils/chatGenerator');
            const dynamicMsg = await generateDynamicMessage(currentSeverity, stack, operatorName, navigator.language);

            if (dynamicMsg) {
                if (dynamicMsg.user) userRaw = dynamicMsg.user;
                if (dynamicMsg.time) time = dynamicMsg.time;
                if (dynamicMsg.isBot !== undefined) isBot = !!dynamicMsg.isBot;
                if (dynamicMsg.bio) bioOverride = dynamicMsg.bio;

                if ('text' in dynamicMsg && dynamicMsg.text) {
                    const { name, bio } = processUserAndBio(userRaw, isBot);
                    lastMessageText.current = dynamicMsg.text;
                    return { 
                        id, 
                        user: name,
                        bio: bioOverride || bio,
                        text: dynamicMsg.text, 
                        time, 
                        isBot,
                        avatarUrl: isBot ? undefined : getAvatarForUser(userRaw)
                    };
                }
            }
        }
 catch (e) {
            console.error('Failed to load dynamic chat generator:', e);
        }

        // Fallback logic using the persistent team cast
        if (userRaw === 'Tech_Staff') {
            try {
                const { ALL_PERSONAS } = await import('../utils/team');
                // Filter personas to ensure bots match the current stack
                const availablePersonas = ALL_PERSONAS.filter(p => 
                    !p.isBot || !p.stacks || p.stacks.includes(stack)
                );
                const persona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
                userRaw = persona.name;
                isBot = persona.isBot;
                bioOverride = persona.role;
            } catch (e) {
                console.error('Failed to load team cast for fallback:', e);
            }
        }

        const pool = STACK_MESSAGES[stack][currentSeverity];
        const watercooler = getLocalizedWatercooler();
        let text = getRandomItem(pool);

        // Humans during NOMINAL state do watercooler chat
        if (!isBot && currentSeverity === 'NOMINAL') {
            text = getRandomItem(watercooler);
        }

        // Prevent identical consecutive content
        if (text === lastMessageText.current && (pool.length > 1 || watercooler.length > 1)) {
            const filteredPool = !isBot && currentSeverity === 'NOMINAL' 
                ? watercooler.filter(t => t !== lastMessageText.current)
                : pool.filter(t => t !== lastMessageText.current);
            text = getRandomItem(filteredPool);
        }

        // Bots should only report infrastructure status, no commentary
        if (isBot) {
            const botFriendlyPool = pool.filter(msg => 
                !msg.includes('?') && 
                !msg.includes('!') && // No exclamations for bots
                !msg.includes('I ') && 
                !msg.toLowerCase().includes('who ') &&
                !msg.toLowerCase().includes('need ') &&
                !msg.toLowerCase().includes('user') && // No user-facing issues
                !msg.toLowerCase().includes('complain')
            );
            if (botFriendlyPool.length > 0) {
                text = getRandomItem(botFriendlyPool);
            }
            // Ensure no exclamations slip through
            text = text.replace(/!/g, '.');
        }
        
        lastMessageText.current = text;
        const { name, bio } = processUserAndBio(userRaw, isBot);
        return { 
            id, 
            user: name, 
            bio: bioOverride || bio, 
            text, 
            time, 
            isBot, 
            avatarUrl: isBot ? undefined : getAvatarForUser(userRaw) 
        };
    }, [stack, operatorName, getAvatarForUser, processUserAndBio]);

    useEffect(() => {
        if (!isActive || isPaused) return;

        const baseDelay = severity === 'P0' ? 3000 : severity === 'P1' ? 6000 : severity === 'P3' ? 12000 : 20000;
        const delay = baseDelay * chatMultiplier;

        const interval = setInterval(async () => {
            const newMessage = await getDynamicMessage(severity);
            if (log) log('CHAT_GENERATOR', { user: newMessage.user, isBot: newMessage.isBot });
            send({ type: 'TYPING_INDICATOR', user: newMessage.user, isTyping: true });
            
            setTimeout(() => {
                send({ type: 'CHAT_MESSAGE', message: newMessage });
                send({ type: 'TYPING_INDICATOR', user: newMessage.user, isTyping: false });
            }, 1500 + Math.random() * 2000);

        }, delay);

        return () => {
            clearInterval(interval);
        };
    }, [severity, terminalId, onNewMessage, playPing, playTagPing, getDynamicMessage, isActive, send, chatMultiplier, log, isPaused]);

    return { messages, sendMessage, typingUsers, markAsRead, markAllAsRead };
};
