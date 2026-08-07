import { ALL_PERSONAS } from './team';
import type { Severity, Stack } from '../data/incidents';
import type { ChatMessage } from '../contexts/types';

/**
 * Generates a dynamic chat message using local personas.
 * Returns a partial ChatMessage without text - the caller should use local message pools.
 */
export const generateDynamicMessage = async (
    _severity: Severity, 
    stack: Stack
): Promise<Partial<ChatMessage> | null> => {
    // Filter personas to ensure bots match the current stack
    const availablePersonas = ALL_PERSONAS.filter(p => 
        !p.isBot || !p.stacks || p.stacks.includes(stack)
    );
    const persona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
    
    const user = persona.name;
    const bio = persona.role.toUpperCase();
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Return persona object - caller should use local message pool for text
    return { user, bio, time, isBot: !!persona.isBot }; 
};
