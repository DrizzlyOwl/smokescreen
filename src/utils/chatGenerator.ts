import { GoogleGenerativeAI } from '@google/generative-ai';
import { faker } from '@faker-js/faker';
import type { Severity, Stack } from '../data/excuses';
import type { ChatMessage } from '../hooks/useIncidentChat';

// Generate 10 persistent chatters to reuse throughout the session
const chatters = Array.from({ length: 10 }, () => faker.person.fullName());

export const generateDynamicMessage = async (severity: Severity, stack: Stack, operatorName: string): Promise<Partial<ChatMessage> | null> => {
    const apiKey = localStorage.getItem('gemini_api_key');
    const user = chatters[Math.floor(Math.random() * chatters.length)];
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: `You are part of a Slack channel for a DevOps team. You are ${user}. Generate a very short, hyper-technical, and realistic chat message about an ongoing ${severity} incident on ${stack}. Sometimes tag the user @${operatorName.split(' ')[0].toLowerCase()}. Keep it under 10 words. Sound professional but stressed if P0/P1.`
            });

            const result = await model.generateContent("Post a short update to the incident channel.");
            const response = await result.response;
            const text = response.text().trim();

            return { user, text, time, isBot: false };
        } catch (e) {
            console.error('Gemini Chat Error:', e);
        }
    }

    // Fallback: Use local pool with one of our 10 chatters
    return { user, time }; 
};
