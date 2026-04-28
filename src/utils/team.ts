import { faker } from '@faker-js/faker';
import type { Stack } from '../data/incidents';

export interface Persona {
    name: string;
    role: string;
    focus: string;
    bio: string;
    isBot: boolean;
    stacks?: Stack[];
}

const humanTemplates = [
    // SRE / Infrastructure Group
    { role: 'SRE Lead', focus: 'Infrastructure & Kubernetes', bio: 'Orchestrating the response to major incidents.' },
    { role: 'SRE', focus: 'Observability & Logs', bio: 'Infrastructure health and latency management.' },
    { role: 'SRE', focus: 'Incident Management', bio: 'Keeping the lights on and the latency low.' },
    
    // Database / Data Group
    { role: 'DBA', focus: 'PostgreSQL & Redis performance', bio: 'The gatekeeper of all persistent state.' },
    { role: 'Data Eng', focus: 'BigQuery & Kafka pipelines', bio: 'Building and scaling reliable data pipelines.' },
    
    // Architecture / Platform Group
    { role: 'Cloud Arch', focus: 'AWS/GCP Region stability', bio: 'Designing systems that survive region loss.' },
    { role: 'Platform Eng', focus: 'PaaS & Serverless scaling', bio: 'Standardizing developer platforms for scale.' },
    { role: 'Systems Eng', focus: 'Kernel & HDD/SSD performance', bio: 'Optimizing kernel performance and storage I/O.' },
    
    // Security / Networking Group
    { role: 'SecOps', focus: 'IAM & Security groups', bio: 'Threat detection and perimeter defense.' },
    { role: 'Security Eng', focus: 'DDoS mitigation & WAF', bio: 'Hardening the stack against active exploits.' },
    { role: 'NetEng', focus: 'BGP & VPC peering', bio: 'Routing packets through the chaos.' },
    
    // Application / API Group
    { role: 'API Arch', focus: 'Gateway & Service Mesh', bio: 'Gatekeeping the distributed service mesh.' },
    { role: 'Backend Eng', focus: 'Auth & Session management', bio: 'Building the core logic of the stack.' },
    { role: 'Frontend Lead', focus: 'Edge caching & CDN', bio: 'Optimizing the edge and end-user experience.' },

    // Executives
    { role: 'VP_Eng', focus: 'Execution & Delivery', bio: 'Execution above all; get the stack back online.' },
    { role: 'CISO', focus: 'Security & Compliance', bio: 'Security is non-negotiable; access is a privilege.' },
    { role: 'CTO', focus: 'Technology Strategy', bio: 'Visionary leadership through catastrophic failure.' },
    { role: 'Legal', focus: 'Risk & Liability', bio: 'Liability management and risk mitigation.' }
];

const botTemplates = [
    { name: 'PagerDuty', role: 'ALERT_ORCHESTRATOR', focus: 'Incident lifecycle', bio: 'Automated incident lifecycle management.', isBot: true },
    { name: 'OpsGenie', role: 'INCIDENT_ROUTING', focus: 'Team alerting', bio: 'Intelligent team alerting and escalation.', isBot: true },
    { name: 'CloudWatch', role: 'AWS_MONITOR', focus: 'Cloud metrics', bio: 'Real-time AWS infrastructure metrics.', isBot: true, stacks: ['AWS', 'SERVERLESS'] as Stack[] },
    { name: 'Azure Monitor', role: 'AZURE_OPS', focus: 'Infrastructure health', bio: 'Full-stack observability for Azure resources.', isBot: true, stacks: ['AZURE'] as Stack[] },
    { name: 'Stackdriver', role: 'GCP_MONITOR', focus: 'GCP observability', bio: 'Google Cloud operations suite monitoring.', isBot: true, stacks: ['GCP'] as Stack[] },
    { name: 'Logplex', role: 'HEROKU_ROUTER', focus: 'Log routing', bio: 'Heroku system and app log router.', isBot: true, stacks: ['HEROKU'] as Stack[] },
    { name: 'vCenter', role: 'VM_MONITOR', focus: 'Hypervisor health', bio: 'Centralized management for VMware environments.', isBot: true, stacks: ['VMWARE'] as Stack[] },
    { name: 'SCVMM', role: 'VIRTUAL_MACHINE_MGR', focus: 'Hyper-V management', bio: 'System Center Virtual Machine Manager.', isBot: true, stacks: ['HYPER-V'] as Stack[] },
    { name: 'Nagios', role: 'NAGIOS_MONITOR', focus: 'On-prem health', bio: 'Infrastructure monitoring for on-premise systems.', isBot: true, stacks: ['ON-PREM'] as Stack[] },
    { name: 'Cloudflare Logs', role: 'CF_OBSERVABILITY', focus: 'Edge logs', bio: 'Real-time logging for Cloudflare edge events.', isBot: true, stacks: ['CLOUDFLARE'] as Stack[] },
    { name: 'DataDog', role: 'OBSERVABILITY', focus: 'Performance tracing', bio: 'High-fidelity performance tracing and logs.', isBot: true },
    { name: 'Grafana', role: 'VISUALIZATION', focus: 'Dashboard triggers', bio: 'Metric visualization and dashboard triggers.', isBot: true },
    { name: 'Prometheus', role: 'METRIC_DB', focus: 'Threshold alerts', bio: 'Time-series database for threshold alerts.', isBot: true },
    { name: 'Sentry', role: 'ERROR_TRACKING', focus: 'Exception logging', bio: 'Real-time exception logging and crash reports.', isBot: true },
    { name: 'Kibana', role: 'LOG_ANALYTICS', focus: 'Kernel search', bio: 'Distributed search and kernel log analysis.', isBot: true }
];

// Persistent Company Cast
export const COMPANY_TEAM: Persona[] = humanTemplates.map(template => ({
    ...template,
    name: faker.person.firstName(),
    isBot: false
}));

export const BOT_FLEET: Persona[] = botTemplates.map(template => ({
    ...template,
    isBot: true
}));

export const ALL_PERSONAS = [...COMPANY_TEAM, ...BOT_FLEET];

/**
 * Find a persistent persona by their exact role or name string.
 * Returns a fallback if not found.
 */
export const getPersonByRole = (role: string): Persona => {
    const found = COMPANY_TEAM.find(p => p.role.toUpperCase() === role.toUpperCase());
    if (found) return found;
    
    // Check bots by name or role
    const bot = BOT_FLEET.find(b => 
        b.name.toUpperCase() === role.toUpperCase() || 
        b.role.toUpperCase() === role.toUpperCase()
    );
    if (bot) return bot;

    return COMPANY_TEAM[0];
};

/**
 * Global Bio Mapping for all possible roles/bios
 */
export const getBioByRole = (role: string): string => {
    const r = role.toUpperCase();
    
    // Direct matches from templates
    const persona = ALL_PERSONAS.find(p => 
        p.role.toUpperCase() === r || 
        (p.isBot && p.name.toUpperCase() === r)
    );
    if (persona) return persona.bio;

    // Manual fallbacks for system/manual roles
    const fallbacks: Record<string, string> = {
        'STAFF': 'General engineering and technical support.',
        'CORE_OS': 'Underlying Smokescreen operating system kernel.',
        'K8S LEAD': 'Orchestrating the response to major incidents.',
        'K8S_ADMIN': 'Orchestrating the response to major incidents.',
        'NETWORK_OPS': 'Routing packets through the chaos.',
        'DBA_TEAM': 'The gatekeeper of all persistent state.',
        'SECURITY_CORE': 'Threat detection and perimeter defense.',
        'EXECUTIVE': 'Decision-making under extreme pressure.',
        'MONITORING': 'Automated system health observation.',
        'ONCALL': 'Primary responder for the current shift.',
    };

    return fallbacks[r] || fallbacks['STAFF'];
};

/**
 * Get a stack-appropriate bot if the provided one doesn't match.
 * Falls back to generic or the provided bot if no better match found.
 */
export const getStackBot = (stack: Stack, currentBotName: string): { name: string, bio: string } => {
    const currentBot = BOT_FLEET.find(b => b.name === currentBotName);
    
    // If bot is already stack-appropriate or generic, keep it
    if (currentBot && (!currentBot.stacks || currentBot.stacks.includes(stack))) {
        return { name: currentBot.name, bio: currentBot.bio };
    }

    // Try to find a bot that matches the stack
    const betterBot = BOT_FLEET.find(b => b.stacks?.includes(stack));
    if (betterBot) {
        return { name: betterBot.name, bio: betterBot.bio };
    }

    // Fallback to a generic bot
    const genericBot = BOT_FLEET.find(b => !b.stacks);
    if (genericBot) {
        return { name: genericBot.name, bio: genericBot.bio };
    }

    return { name: currentBotName, bio: currentBot?.bio || 'SYSTEM_BOT' };
};

/**
 * Get a random executive persona.
 */
export const getRandomExecutive = (): Persona => {
    const execRoles = ['VP_Eng', 'CISO', 'CTO', 'Legal'];
    const execs = COMPANY_TEAM.filter(p => execRoles.includes(p.role));
    return execs[Math.floor(Math.random() * execs.length)];
};
