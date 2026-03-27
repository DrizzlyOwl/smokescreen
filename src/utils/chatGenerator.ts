import { GoogleGenerativeAI } from '@google/generative-ai';
import { faker } from '@faker-js/faker';
import type { Severity, Stack } from '../data/excuses';
import type { ChatMessage } from '../hooks/useIncidentChat';

// Persistent engineering team templates grouped by role
const personaTemplates = [
    // SRE / Infrastructure Group
    { role: 'SRE Lead', focus: 'Infrastructure & Kubernetes' },
    { role: 'SRE', focus: 'Observability & Logs' },
    { role: 'SRE', focus: 'Incident Management' },
    
    // Database / Data Group
    { role: 'DBA', focus: 'PostgreSQL & Redis performance' },
    { role: 'Data Eng', focus: 'BigQuery & Kafka pipelines' },
    
    // Architecture / Platform Group
    { role: 'Cloud Arch', focus: 'AWS/GCP Region stability' },
    { role: 'Platform Eng', focus: 'PaaS & Serverless scaling' },
    { role: 'Systems Eng', focus: 'Kernel & HDD/SSD performance' },
    
    // Security / Networking Group
    { role: 'SecOps', focus: 'IAM & Security groups' },
    { role: 'Security Eng', focus: 'DDoS mitigation & WAF' },
    { role: 'NetEng', focus: 'BGP & VPC peering' },
    
    // Application / API Group
    { role: 'API Arch', focus: 'Gateway & Service Mesh' },
    { role: 'Backend Eng', focus: 'Auth & Session management' },
    { role: 'Frontend Lead', focus: 'Edge caching & CDN' },
    
    // Automation
    { role: 'System Bot', focus: 'Automated remediation', isBot: true }
];

// Initialize persistent personas with Faker first names
const personas = personaTemplates.map(template => ({
    ...template,
    name: template.isBot ? 'K8s-Controller' : faker.person.firstName()
}));

export const generateDynamicMessage = async (severity: Severity, stack: Stack, operatorName: string): Promise<Partial<ChatMessage> | null> => {
    const apiKey = localStorage.getItem('gemini_api_key');
    const persona = personas[Math.floor(Math.random() * personas.length)];
    const user = `${persona.name} (${persona.role})`;
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });

    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // Scaled tagging instruction
            const tagInstruction = severity === 'P0' ? 'ALWAYS tag the user' :
                                   severity === 'P1' ? 'Frequently tag the user' :
                                   severity === 'P3' ? 'Sometimes tag the user' : 'Rarely tag the user';

            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: `You are part of a Slack channel for a DevOps team. You are ${persona.name}, a ${persona.role} specializing in ${persona.focus}. 
                Generate a very short, hyper-technical, and realistic chat message about an ongoing ${severity} incident on ${stack}. 
                ${tagInstruction} using @${operatorName.split(' ')[0].toLowerCase()}. 
                Keep it under 10 words. 
                Sound professional but stressed if P0/P1. Use technical jargon relevant to your role (${persona.focus}).`
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
