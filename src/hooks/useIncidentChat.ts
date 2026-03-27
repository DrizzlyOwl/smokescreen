import { useState, useEffect, useRef, useCallback } from 'react';
import { useSync } from '../contexts/SyncContext';
import type { Severity, Stack } from '../data/excuses';

const STACK_MESSAGES: Record<Stack, Record<Severity, string[]>> = {
    AWS: {
        NOMINAL: [
            'Monitoring looks good',
            'Deployment pipeline is green',
            'CloudWatch alarms are silent',
            'Latency within acceptable bounds'
        ],
        P3: [
            'Seeing some minor throttling on S3',
            'Elasticache CPU is drifting up',
            'IAM permissions error on the logging role',
            'CloudFront distribution is propagating slowly'
        ],
        P1: [
            'RDS MULTI-AZ FAILOVER IN PROGRESS',
            'EKS control plane is unresponsive',
            'DirectConnect latency spiking to 500ms',
            'ALB returning 502 Bad Gateway across all nodes',
            'Auto-scaling group failing to launch instances',
            'Route53 DNS resolution is failing intermittently'
        ],
        P0: [
            'US-EAST-1 REGION IS DOWN',
            'S3 DATA CONSISTENCY FAILURE - TOTAL LOSS',
            'AWS CONSOLE IS UNRESPONSIVE GLOBALLY',
            'ELASTICACHE CLUSTER IS GONE',
            'ALL PROD INSTANCES TERMINATED BY UNKNOWN SCRIPT',
            'DATABASE CORRUPTION DETECTED IN RDS PRIMARY'
        ]
    },
    GCP: {
        NOMINAL: [
            'BigQuery jobs running smooth',
            'GKE nodes are healthy',
            'Cloud Logging is stable',
            'Pub/Sub latency < 10ms'
        ],
        P3: [
            'Cloud SQL instance is slightly sluggish',
            'Quota limit reached on Compute Engine',
            'Firestore cold starts are noticeable',
            'Artifact Registry is slow to pull images'
        ],
        P1: [
            'GKE NODE POOL PREEMPTED DURING PEAK',
            'BigQuery returning internal 500 errors',
            'Cloud Storage buckets are 403 Forbidden',
            'VPC Peering connection dropped',
            'Cloud Spanner CPU utilization at 98%',
            'Anthos service mesh has lost sync'
        ],
        P0: [
            'GOOGLE CLOUD NETWORKING IS DOWN',
            'GLOBAL LOAD BALANCER RETURNING 503',
            'IAM SERVICE ACCOUNT KEY COMPROMISED',
            'PROJECT DELETED BY AUTOMATION ERROR',
            'FIREBASE AUTHENTICATION TOTAL OUTAGE',
            'COMPUTE ENGINE API UNRESPONSIVE'
        ]
    },
    AZURE: {
        NOMINAL: [
            'Azure Monitor is clean',
            'AKS clusters reporting green',
            'Service Bus queues are empty',
            'Storage Account latency is low'
        ],
        P3: [
            'CosmosDB RU/s usage is peaking',
            'App Service plan is scaling up',
            'Function App is warming up',
            'DevOps pipeline is slightly delayed'
        ],
        P1: [
            'AZURE ACTIVE DIRECTORY SYNC FAILURE',
            'AKS API SERVER IS TIMING OUT',
            'Blob Storage data is unreachable',
            'Virtual Machine scale set is stuck in updating',
            'ExpressRoute circuit is down',
            'Front Door is dropping 30% of traffic'
        ],
        P0: [
            'AZURE REGION WEST-EUROPE IS OFFLINE',
            'ROOT SUBSCRIPTION ACCESS DENIED',
            'REDIS CACHE CLUSTER HAS EVAPORATED',
            'SQL AZURE POOL CORRUPTION - NO BACKUP',
            'KEY VAULT DELETED - SECRETS LOST',
            'TRAFFIC MANAGER ROUTING TO VOID'
        ]
    },
    'ON-PREM': {
        NOMINAL: [
            'Hardware temps are stable',
            'UPS battery test passed',
            'SAN storage has 40% free space',
            'Core switch uptime: 420 days'
        ],
        P3: [
            'Fans spinning at 100% in rack 4',
            'NTP drift detected on node 2',
            'Backup tape is nearly full',
            'VLAN 10 is showing some noise'
        ],
        P1: [
            'RACK 7 PDU HAS TRIPPED',
            'SAN CONTROLLER B IS FAILING',
            'Core firewall is dropping packets',
            'VMWare vCenter is unresponsive',
            'Offsite link latency spiking to 200ms',
            'HVAC failure in the main DC'
        ],
        P0: [
            'TOTAL POWER LOSS IN DATA CENTER',
            'FIRE SUPPRESSION SYSTEM TRIGGERED',
            'FIBER CUT DETECTED - TOTAL ISOLATION',
            'CORE SWITCH STACK COLLAPSED',
            'RAID 6 DOUBLE DRIVE FAILURE',
            'WATER LEAK DETECTED IN RACK 12'
        ]
    },
    SERVERLESS: {
        NOMINAL: [
            'Lambdas are warm',
            'API Gateway is fast',
            'Step Functions are flowing',
            'DynamoDB is chill'
        ],
        P3: [
            'Cold start spikes on the Auth lambda',
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
    const { send, subscribe } = useSync();

    useEffect(() => {
        const unsubscribe = subscribe((data) => {
            if (data.type === 'CHAT_MESSAGE') {
                setMessages(prev => [...prev, data.message].slice(-100));
                
                const isTag = data.message.text.includes('@');
                if (isTag) {
                    playTagPing?.();
                } else {
                    playPing?.();
                }
                onNewMessage(isTag);
            }
        });
        return unsubscribe;
    }, [subscribe, onNewMessage, playPing, playTagPing]);

    const sendMessage = useCallback((text: string, user: string) => {
        const newMessage: ChatMessage = {
            user,
            text,
            time: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            isBot: false
        };
        send({ type: 'CHAT_MESSAGE', message: newMessage });
    }, [send]);

    useEffect(() => {
        if (lastSeverity.current !== severity) {
            const systemMsg = {
                user: 'Smokescreen_OS_Bot',
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

        const pool = STACK_MESSAGES[stack][currentSeverity];
        let text = pool[Math.floor(Math.random() * pool.length)];
        
        // Scale tagging probability based on severity
        // P0: 60% chance, P1: 40% chance, P3: 20% chance, NOMINAL: 5% chance
        const tagProbability = currentSeverity === 'P0' ? 0.4 : 
                               currentSeverity === 'P1' ? 0.6 : 
                               currentSeverity === 'P3' ? 0.8 : 0.95;

        if (Math.random() > tagProbability) {
            const tag = operatorName.split(' ')[0].toLowerCase() || 'operator';
            text = `@${tag} ${text}`;
        }
        return { user, text, time, isBot: false };
    }, [stack, operatorName]);

    useEffect(() => {
        if (!isActive) return;

        const delay = severity === 'P0' ? 3000 : severity === 'P1' ? 6000 : severity === 'P3' ? 12000 : 20000;

        const interval = setInterval(async () => {
            const newMessage = await getDynamicMessage(severity);
            send({ type: 'CHAT_MESSAGE', message: newMessage });
        }, delay);

        return () => {
            clearInterval(interval);
        };
    }, [severity, uplinkId, onNewMessage, playPing, playTagPing, getDynamicMessage, isActive, send]);

    return { messages, sendMessage };
};
