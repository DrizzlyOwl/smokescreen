import { useState, useEffect, useCallback, useRef } from 'react';
import type { Severity, Stack } from '../data/excuses';
import { useSync } from '../contexts/SyncContext';

const STACK_MESSAGES: Record<Stack, Record<Severity, string[]>> = {
    AWS: {
        NOMINAL: [
            'Anyone want coffee?',
            'Did you see the new release notes for the CLI?',
            'The cluster is looking very quiet today',
            'Thinking about refactoring the terraform modules',
            'Is it just me or is the console getting slower?',
            'Lunch today at the usual spot?',
            'Happy Friday everyone!'
        ],
        P3: [
            'Routine maintenance check on the cluster',
            'Anyone else seeing slight latency in US-WEST-2?',
            'Did the CronJob run successfully last night?',
            'Reviewing the latest PR for the ingress controller',
            'CloudWatch alarm triggered for disk usage on dev-01',
            'Updating the IAM policies for the new sprint',
            'Memory usage is looking stable'
        ],
        P1: [
            'I see a spike in 503s on the ALBs',
            'IAM propagation lag is starting to cause issues',
            'RDS metrics? It is starting to flatline',
            'Traffic is blackholing on some subnets, investigating',
            'S3 throttled on the media bucket',
            'KMS decryption failures in US-EAST-1',
            'Vault seal status is showing as LOCKED'
        ],
        P0: [
            'WHO IS DRAINING PROD NODES??',
            'INCIDENT DECLARED: P0 - ALL HANDS ON DECK',
            'BGP session dropped on DX - TOTAL BLACKOUT',
            'DATABASE IS IN READ-ONLY MODE - RDS OVERLOAD',
            'I need an SRE in the war room IMMEDIATELY',
            'ROUTE53 IS DOWN - INTERNAL DNS FAILURE',
            'K8S CONTROL PLANE IS DOWN - NO API ACCESS'
        ]
    },
    GCP: {
        NOMINAL: [
            'GSP is looking good today',
            'Anyone tried the new Cloud Run features?',
            'Lunch today at the usual spot?',
            'Just finishing up some documentation',
            'BigQuery query finished, saved us some credits',
            'Thinking about refactoring the terraform modules',
            'Did you see the new release notes for the CLI?'
        ],
        P3: [
            'Quota warning on Compute Engine',
            'GKE node rotation starting',
            'Reviewing the latest PR for the Cloud SQL proxy',
            'Firebase auth latency check',
            'Updating the Stackdriver dashboards',
            'Check the PubSub backlog for the billing service',
            'Memory usage is looking stable'
        ],
        P1: [
            'GCLB is returning 502s globally',
            'IAM permissions error across the entire org',
            'BigQuery job queue is backed up',
            'Spanner latency is spiking in us-central1',
            'Cloud Storage returning intermittent 404s',
            'Artifact Registry is slow, CI failing',
            'Vault seal status is showing as LOCKED'
        ],
        P0: [
            'PROJECT DELETED BY AUTOMATION??',
            'GCP CONSOLE IS 500ING - TOTAL PANIC',
            'REGIONAL OUTAGE - ASIA-EAST1 IS GONE',
            'KUBERNETES CONTROL PLANE IS UNREACHABLE - GKE DOWN',
            'ALL IAM SERVICE ACCOUNTS REVOKED??',
            'I need an SRE in the war room IMMEDIATELY',
            'WHO IS DRAINING PROD NODES??'
        ]
    },
    AZURE: {
        NOMINAL: [
            'Azure DevOps is actually stable today',
            'Did you see the new Bicep release?',
            'Happy Friday everyone!',
            'Nominating someone for the "Helper of the Week"',
            'CosmosDB RU usage is low',
            'Lunch today at the usual spot?',
            'Thinking about refactoring the terraform modules'
        ],
        P3: [
            'Resource Graph query taking forever',
            'AKS cluster upgrade in progress',
            'Reviewing the NSG rules for the subnet',
            'Check the App Service Plan memory',
            'Updating the Key Vault secrets',
            'Azure Monitor alert: logic app failed',
            'Memory usage is looking stable'
        ],
        P1: [
            'Traffic Manager is routing to unhealthy nodes',
            'Active Directory sync is lagging',
            'SQL Azure DTU limit reached',
            'VM Scale Set won\'t scale out',
            'Blob storage latency in UK-SOUTH',
            'ExpressRoute packet loss detected',
            'Vault seal status is showing as LOCKED'
        ],
        P0: [
            'TENANT-WIDE IDENTITY OUTAGE - NO ONE CAN LOG IN',
            'AZURE PORTAL IS DOWN - GLOBAL RED ALERT',
            'SUBSCRIPTION SPEND EXCEEDED - RESOURCES STOPPING',
            'AKS MASTER DOWN - ALL CLUSTERS FAILING',
            'COSMOSDB DATA LOSS REPORTED - EMERGENCY',
            'I need an SRE in the war room IMMEDIATELY',
            'WHO IS DRAINING PROD NODES??'
        ]
    },
    'ON-PREM': {
        NOMINAL: [
            'Air conditioning in the server room is fixed',
            'Did anyone label the new patch cables?',
            'Thinking about ordering more RAM',
            'The tape drive finished the backup',
            'Who left their laptop in the server room?',
            'Happy Friday everyone!',
            'Lunch today at the usual spot?'
        ],
        P3: [
            'Disk pressure on the SAN',
            'Reviewing the latest VLAN changes',
            'Switching to the backup generator for testing',
            'UPS health check in progress',
            'Updating the BIOS on the R740s',
            'NTP drift detected on the domain controller',
            'Memory usage is looking stable'
        ],
        P1: [
            'CORE SWITCH OVERHEATING',
            'RAID rebuild failing on node-04',
            'Vmotion is stuck for 50% of VMs',
            'Firewall rules preventing internal gRPC',
            'Packet loss on the 10G uplink',
            'LDAP server is unresponsive',
            'Vault seal status is showing as LOCKED'
        ],
        P0: [
            'WATER LEAK IN THE DATA CENTER!!',
            'CORE ROUTER IS LITERALLY ON FIRE',
            'TOTAL POWER LOSS - UPS FAILED',
            'SAN CONTROLLER FAILURE - ALL DATA OFFLINE',
            'THE SERVER ROOM DOOR IS STUCK CLOSED',
            'I need an SRE in the war room IMMEDIATELY',
            'WHO IS DRAINING PROD NODES??'
        ]
    },
    SERVERLESS: {
        NOMINAL: [
            'Lambda cold starts are better today',
            'Anyone tried the new Step Functions?',
            'Just finishing up some documentation',
            'Vercel deployment finished',
            'Netlify build successful',
            'Thinking about refactoring the terraform modules',
            'Happy Friday everyone!'
        ],
        P3: [
            'Warm-up script failing for Lambda',
            'Reviewing the latest PR for the SST stack',
            'Updating the DynamoDB TTLs',
            'Check the API Gateway timeout settings',
            'SQS DLQ has a few items in it',
            'EventBridge rule latency check',
            'Memory usage is looking stable'
        ],
        P1: [
            'CONCURRENCY LIMIT REACHED - REQUESTS DROPPING',
            'DynamoDB throttling on the users table',
            'API Gateway returning 504 Gateway Timeout',
            'Lambda execution times are through the roof',
            'Cold start hell on the checkout service',
            'Auth0 integration is timing out',
            'Vault seal status is showing as LOCKED'
        ],
        P0: [
            'AWS LAMBDA IS DOWN GLOBALLY',
            'DYNAMODB PARTITION DATA LOSS - RED ALERT',
            'API GATEWAY CERTIFICATE EXPIRED - TOTAL OUTAGE',
            'SERVERLESS DB CREDENTIALS EXPOSED!!',
            'WHO DELETED THE PRODUCTION STACK??',
            'I need an SRE in the war room IMMEDIATELY',
            'WHO IS DRAINING PROD NODES??'
        ]
    }
};

export interface ChatMessage {
    user: string;
    text: string;
    time: string;
    isBot: boolean;
}

export const useIncidentChat = (
    severity: Severity,
    stack: Stack,
    operatorName: string,
    uplinkId: string,
    onNewMessage: (isTag: boolean) => void,
    playPing?: () => void,
    playTagPing?: () => void,
    isActive: boolean = true
) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const lastSeverity = useRef<Severity>(severity);
    const { send } = useSync();

    useEffect(() => {
        if (lastSeverity.current !== severity) {
            const systemMsg = {
                user: 'incident_io',
                text: `--- ALERT LEVEL UPDATED TO ${severity} [${stack}] ---`,
                time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                isBot: true
            };
            setTimeout(() => {
                setMessages(prev => [...prev, systemMsg].slice(-100));
            }, 0);
            lastSeverity.current = severity;
        }
    }, [severity, stack]);

    const getDynamicMessage = useCallback(async (currentSeverity: Severity): Promise<ChatMessage> => {
        let user = 'Tech_Staff';
        let time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });

        try {
            // Dynamic import to split Faker and Gemini out of the main bundle
            const { generateDynamicMessage } = await import('../utils/chatGenerator');
            const msg = await generateDynamicMessage(currentSeverity, stack, operatorName);
            
            if (msg && 'text' in msg && msg.text && msg.user && msg.time) {
                return msg as ChatMessage;
            }
            if (msg && msg.user && msg.time) {
                user = msg.user;
                time = msg.time;
            }
        } catch (e) {
            console.error('Failed to load dynamic chat generator:', e);
        }

        // Fallback
        const pool = STACK_MESSAGES[stack][currentSeverity];
        let text = pool[Math.floor(Math.random() * pool.length)];
        if (Math.random() > 0.7) {
            const tag = operatorName.split(' ')[0].toLowerCase() || 'operator';
            text = `@${tag} ${text}`;
        }
        return { user, text, time, isBot: false };
    }, [severity, stack, operatorName]);

    useEffect(() => {
        if (!isActive) return;

        const delay = severity === 'P0' ? 3000 : severity === 'P1' ? 6000 : severity === 'P3' ? 12000 : 20000;

        const interval = setInterval(async () => {
            const newMessage = await getDynamicMessage(severity);
            send({ type: 'CHAT_MESSAGE', message: newMessage });
            
            const isTag = newMessage.text.includes('@');
            if (isTag) {
                playTagPing?.();
            } else {
                playPing?.();
            }
            
            onNewMessage(isTag);
            
            setMessages(prev => [...prev, newMessage].slice(-100));
        }, delay);

        return () => {
            clearInterval(interval);
        };
    }, [severity, uplinkId, onNewMessage, playPing, playTagPing, getDynamicMessage, isActive, send]);

    return { messages };
};
