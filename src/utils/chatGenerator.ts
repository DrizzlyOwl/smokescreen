import { GoogleGenerativeAI } from '@google/generative-ai';
import { ALL_PERSONAS } from './team';
import type { Severity, Stack } from '../data/incidents';
import type { ChatMessage } from '../contexts/types';

export const generateDynamicMessage = async (
    severity: Severity, 
    stack: Stack, 
    operatorName: string,
    locale: string = 'en-US'
): Promise<Partial<ChatMessage> | null> => {
    const apiKey = localStorage.getItem('gemini_api_key');
    
    // Filter personas to ensure bots match the current stack
    const availablePersonas = ALL_PERSONAS.filter(p => 
        !p.isBot || !p.stacks || p.stacks.includes(stack)
    );
    const persona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
    
    const user = persona.name;
    const bio = persona.role.toUpperCase();
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Scaled tagging instruction - Bots never tag
            const tagInstruction = persona.isBot ? 'NEVER tag the user or anyone.' :
                                   severity === 'P0' ? 'ALWAYS tag the user' :
                                   severity === 'P1' ? 'Frequently tag the user' :
                                   severity === 'P3' ? 'Sometimes tag the user' : 'Rarely tag the user';

            const personaTypeInstruction = persona.isBot 
                ? 'You are an automated system monitor. You must only report on current infrastructure status updates or specific component metrics. Do not provide any personal commentary, opinions, or human-like conversation. Do not express panic. Do not report on user-facing issues (like "users are complaining"). Your output MUST be dry, technical, and look like a machine-generated alert. NEVER use exclamation marks (!).'
                : severity === 'NOMINAL'
                    ? `You are ${persona.name}, a ${persona.role}. The systems are healthy. You are engaging in casual "watercooler" chat with your team in Slack. Your locality is ${locale}. Adjust your cultural references, topics (e.g., local food, sports, weather), and language/slang to match this locale. Keep it brief, human, and relaxed.`
                    : `You are part of a Slack channel for a DevOps team. You are ${persona.name}, a ${persona.role} specializing in ${persona.focus}. Sound professional but stressed if P0/P1. You may report that users are complaining or express urgency. Use technical jargon relevant to your role (${persona.focus}).`;

            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: `${personaTypeInstruction}
                Generate a very short chat message. 
                Context: Ongoing ${severity} state on ${stack}. 
                ${tagInstruction}${!persona.isBot ? ` using @${operatorName.split(' ')[0].toLowerCase()}.` : ''} 
                Keep it under 12 words. 
                ${!persona.isBot && severity === 'NOMINAL' ? `Tone: Casual, non-technical Slack chatter localized for ${locale}.` : `Tone: Technical, ${persona.isBot ? 'automated telemetry alert' : 'professional engineering'}.`}`
            });

            const result = await model.generateContent("Post a short update to the incident channel.");
            const response = await result.response;
            let text = response.text().trim();

            // Additional safety: strip exclamations from bots if they slipped through
            if (persona.isBot) {
                text = text.replace(/!/g, '.');
            }

            return { user, bio, text, time, isBot: !!persona.isBot };
        } catch (e) {
            console.error('Gemini Chat Error:', e);
        }
    }

    // Fallback: Use local pool with one of our personas
    return { user, bio, time, isBot: !!persona.isBot }; 
};
