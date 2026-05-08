import { type Severity, type Stack } from './incidents';

export const STACK_MESSAGES: Record<Stack, Record<Severity, string[]>> = {
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
            'DynamoDB slashing on the users table',
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
    },
    CLOUDFLARE: {
        NOMINAL: [
            'WAF rules are stable',
            'KV propagation complete',
            'Edge cache hit rate at 98%',
            'Workers runtime is healthy'
        ],
        P3: [
            'Seeing KV eventual consistency lag',
            'Minor WAF false positives in EU-WEST',
            'Worker cold starts are slightly elevated',
            'Argo smart routing is recalibrating'
        ],
        P1: [
            '522 CONNECTION TIMED OUT AT THE EDGE',
            'GLOBAL WAF BYPASS VULNERABILITY DETECTED',
            'R2 THROUGHPUT IS BEING THROTTLED',
            'Pages deployment pipeline is stuck',
            'Cloudflared tunnel sync failure',
            'SSL handshake errors increasing in APAC'
        ],
        P0: [
            'GLOBAL EDGE NETWORK BLACKOUT',
            'DURABLE OBJECT STATE CORRUPTION DETECTED',
            'DNS RESOLUTION FAILURE AT THE EDGE',
            'ZERO TRUST GATEWAY IS DOWN',
            'TOTAL API UNAVAILABILITY - CANNOT PURGE CACHE',
            'WHO IS RESPONSIBLE FOR THE BGP WITHDRAWAL??'
        ]
    },
    HEROKU: {
        NOMINAL: [
            'Dyno formation is stable',
            'Slug compilation finished',
            'Postgres metrics are green',
            'Logplex buffer is clear'
        ],
        P3: [
            'H12 Request Timeouts in us-east-1',
            'R14 Memory Quota Exceeded on web.1',
            'Slug compilation is unusually slow',
            'Redis add-on latency is drifting'
        ],
        P1: [
            'H10 APP CRASHED - RESTARTING DYNOS',
            'POSTGRES CONNECTION LIMIT REACHED',
            'PRIVATE SPACE GATEWAY UNRESPONSIVE',
            'Heroku API is returning 503',
            'Add-on provisioning is failing',
            'Logplex total buffer overflow'
        ],
        P0: [
            'GLOBAL DYNO RUNTIME OUTAGE',
            'HEROKU CONNECT DATA SYNC COLLAPSE',
            'PRODUCTION DATABASE HAS EVAPORATED',
            'PIPELINE PROMOTION FAILED - STATE INCONSISTENT',
            'ALL APP CONFIG VARS WIPED',
            'EMERGENCY: CONTACT SALESFORCE SRE IMMEDIATELY'
        ]
    },
    'HYPER-V': {
        NOMINAL: [
            'Cluster quorum is healthy',
            'Virtual switches are nominal',
            'VHDX compaction complete',
            'Live migration engine is idle'
        ],
        P3: [
            'Dynamic memory pressure on Host 4',
            'Snapshot merge lag detected',
            'Minor VM heartbeat miss on node-02',
            'SCVMM console is slightly sluggish'
        ],
        P1: [
            'LIVE MIGRATION FAILURE - VM PAUSED',
            'CSV VOLUME RE-PARSE POINT ERROR',
            'VHDX CORRUPTION DETECTED ON SAN',
            'Virtual Switch Manager is unresponsive',
            'Host OS is reporting disk pressure',
            'Failover cluster is losing nodes'
        ],
        P0: [
            'HYPER-V CLUSTER TOTAL QUORUM LOSS',
            'STORAGE SPACES DIRECT TOTAL FAILURE',
            'HOST KERNEL PANIC - BSOD DETECTED',
            'CLUSTER DATABASE CORRUPTION',
            'TOTAL NETWORK ISOLATION - VLAN STRIPED',
            'SAN STORAGE UNREACHABLE FROM ALL HOSTS'
        ]
    },
    VMWARE: {
        NOMINAL: [
            'vCenter health is green',
            'vMotion completed successfully',
            'ESXi hosts are responsive',
            'vSAN re-sync at 0%'
        ],
        P3: [
            'Balloon driver active on app-servers',
            'vMotion timeout - retrying',
            'Minor datastore latency spike',
            'DRS is re-balancing the cluster'
        ],
        P1: [
            'HOST NOT RESPONDING - vCENTER DISCONNECT',
            'vSAN COMPONENT DEGRADED - DATA AT RISK',
            'NSX-T EDGE CONTROLLER FAILURE',
            'HA Agent failed to restart VMs',
            'HBA queue depth saturation',
            'Distributed Switch port group exhausted'
        ],
        P0: [
            'vCENTER TOTAL DATABASE CORRUPTION',
            'vSAN TOTAL DATA LOSS - CLUSTER OFFLINE',
            'ALL PATHS DOWN (APD) ON PRIMARY STORAGE',
            'ESXi HOST KERNEL PANIC - PURPLE SCREEN',
            'TOTAL MANAGEMENT NETWORK COLLAPSE',
            'WHO UNPLUGGED THE HEARTBEAT LINK??'
        ]
    }
};

export const WATERCOOLER_MESSAGES: Record<string, string[]> = {
    'US': [
        "Anyone want anything from the kitchen? I'm grabbing another coffee.",
        "Did anyone catch the game last night? Wild ending.",
        "The new office espresso machine is actually decent.",
        "My mechanical keyboard is finally here. Productivity +10.",
        "Is it Friday yet? This week has been long.",
        "Someone left their laptop unlocked in the breakroom again...",
        "Has anyone tried that new lunch spot down the street?",
        "I'm about 4 coffees deep and I can see through time.",
        "The building AC is set to 'Arctic' today. I'm freezing."
    ],
    'UK': [
        "Heading to the kettle, anyone want a brew?",
        "Absolute nightmare on the Jubilee line this morning.",
        "The biscuit tin in the kitchen is looking tragically empty.",
        "Weather is typical for London today. Grey and grey.",
        "Anyone up for a cheeky Nando's at lunch?",
        "I've had so much tea I'm basically a human teapot.",
        "Did you see the match? Proper defensive masterclass.",
        "Is it pub o'clock yet?",
        "The tube was a total write-off today. Signal failure again."
    ],
    'EU': [
        "Anyone up for a quick coffee break? The machine is actually working.",
        "The commute this morning was quite smooth for once.",
        "Has anyone seen the latest documentation on the internal wiki?",
        "I am looking forward to the team dinner tomorrow evening.",
        "The office temperature is quite pleasant today, don't you think?",
        "Does anyone have a recommendation for a good local bistro?",
        "I found a small bug in the testing framework, will fix it after lunch.",
        "Is it time for a fika break yet?"
    ]
};

export const getLocalizedWatercooler = () => {
    const locale = navigator.language.toUpperCase();
    if (locale.includes('GB')) return WATERCOOLER_MESSAGES['UK'];
    if (locale.includes('US')) return WATERCOOLER_MESSAGES['US'];
    
    // Check for common European locales to use EU English bucket
    const euroLocales = ['DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'BE', 'PL'];
    if (euroLocales.some(ext => locale.includes(ext))) return WATERCOOLER_MESSAGES['EU'];

    return WATERCOOLER_MESSAGES['US']; // Default
};
