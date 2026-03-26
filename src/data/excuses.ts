export type Severity = 'NOMINAL' | 'P3' | 'P1' | 'P0';
export type Stack = 'AWS' | 'GCP' | 'AZURE' | 'ON-PREM' | 'SERVERLESS';

interface Jargon {
  systems: string[];
  actions: string[];
  errors: string[];
}

const commonJargon: Jargon = {
  systems: [
    'Prometheus scraper', 'Kafka broker cluster', 'Vault secret engine', 'Redis sentinel', 
    'NGINX ingress controller', 'CoreDNS mesh', 'Consul agent', 'sidecar proxy',
    'service mesh control plane', 'message queue consumer', 'Vector log router'
  ],
  actions: [
    'rotating the TLS certs', 'purging some stale keys', 're-syncing the state', 'patching a zero-day',
    're-balancing the shards', 'draining the worker nodes', 'invalidating the CDN edge cache',
    'auditing the firewall rules', 're-indexing the search cluster', 'flushing the dead-letter queues'
  ],
  errors: [
    '503 Service Unavailable', 'OOM killer trigger', 'checksum mismatch', 'race condition',
    'TCP window size collapse', 'zombie process accumulation', 'socket leak',
    'MTU mismatch causing packet fragmentation', 'inode exhaustion', 'heartbeat timeout'
  ],
};

const stackJargon: Record<Stack, Jargon> = {
  AWS: {
    systems: [
      'EKS control plane', 'RDS Multi-AZ replica', 'S3 VPC endpoint', 'IAM policy engine', 
      'Kinesis stream shard', 'CloudFront distribution', 'Lambda@Edge runtime', 
      'Transit Gateway'
    ],
    actions: [
      'draining the Fargate nodes', 're-indexing the DynamoDB shards', 're-announcing BGP via DirectConnect',
      'modifying the Security Group ingress', 'rotating the IAM access keys', 're-syncing the EBS snapshots'
    ],
    errors: [
      'eventual consistency lag in US-East-1', 'VPC peering throughput collapse', 'KMS throttling incident',
      'S3 bucket policy conflict', '504 Gateway Timeout on the ELB'
    ],
  },
  GCP: {
    systems: [
      'GKE Autopilot cluster', 'Cloud Spanner node', 'BigQuery slot', 'Cloud Armor policy', 
      'Pub/Sub topic partition', 'Cloud Run instance'
    ],
    actions: [
      're-balancing the Global Load Balancer', 'migrating the Persistent Disks', 're-configuring Anthos',
      'adjusting the BigQuery priority jobs', 'rotating the Service Account keys'
    ],
    errors: [
      'quorum loss in the multi-region Spanner', 'IAM propagation delay', 'GCE preemption spike',
      'Shared VPC host project unreachable', 'Cloud Build timeout'
    ],
  },
  AZURE: {
    systems: [
      'AKS cluster', 'CosmosDB partition', 'Azure Front Door', 'ExpressRoute circuit', 'Entra ID sync'
    ],
    actions: [
      're-provisioning the Resource Group', 'purging the Blob Storage container', 're-configuring the Traffic Manager',
      'rotating the Key Vault secrets'
    ],
    errors: [
      'subscription quota limit', 'Service Bus namespace congestion', 'tenant-level throttling',
      'ARM template deployment failure'
    ],
  },
  'ON-PREM': {
    systems: [
      'VMWare ESXi host', 'SAN storage array', 'Cisco Catalyst switch', 'F5 Big-IP balancer', 'bare-metal blade'
    ],
    actions: [
      're-seating the RAID controller', 'clearing the MAC address table', 're-cabling the heartbeat link',
      're-imaging the PXE boot node'
    ],
    errors: [
      'predictive failure on a parity drive', 'BGP flapping in the core switch', 'air-con failure in Rack B',
      'memory ECC error'
    ],
  },
  SERVERLESS: {
    systems: [
      'Lambda runtime', 'API Gateway endpoint', 'cold start optimizer', 'Step Function state machine', 'Edge worker'
    ],
    actions: [
      'purging the CDN cache', 'warm-starting the concurrency pool', 're-mapping the trigger',
      'tracing the execution graph'
    ],
    errors: [
      'concurrency limit hit', 'execution timeout on a cold start', 'orchestration loop',
      'ephemeral storage overflow'
    ],
  },
};

const recoveryTimes = ['5 minutes', '20 minutes', 'an hour', 'the rest of the afternoon', 'a while'];

export const generateTicketId = () => `INC-${Math.floor(Math.random() * 9000 + 1000)}`;

const indefiniteArticle = (word: string) => {
    const firstLetter = word.toLowerCase().charAt(0);
    return ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
};

export const generateExcuse = (severity: Severity, stack: Stack): { text: string; ticketId: string; timeSaved: number } => {
  if (severity === 'NOMINAL') return { text: '', ticketId: '', timeSaved: 0 };

  const jargon = {
    systems: [...commonJargon.systems, ...stackJargon[stack].systems],
    actions: [...commonJargon.actions, ...stackJargon[stack].actions],
    errors: [...commonJargon.errors, ...stackJargon[stack].errors],
  };

  const getRand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const system = getRand(jargon.systems);
  const action = getRand(jargon.actions);
  const error = getRand(jargon.errors);
  const ttr = getRand(recoveryTimes);
  const ticketId = generateTicketId();

  const fillers = ['Sorry everyone,', 'Actually, I have to jump,', 'I\'m really sorry but', 'Right, I\'ve got to drop,'];
  const filler = getRand(fillers);
  const article = indefiniteArticle(error);

  const templates = [
    `${filler} the ${system} is reporting ${article} ${error}. I need to immediately start ${action} before it cascades. I'll probably be offline for ${ttr}. Ticket is ${ticketId}.`,
    `${filler} I'm seeing ${article} ${error} on the ${system}. It's starting to impact production so I need to jump on ${action} right now. I'll update ${ticketId} when I'm back.`,
    `${filler} we've got a major ${error} on the ${system}. I'm going to have to drop and start ${action} manually. Might be gone for ${ttr}. Ref: ${ticketId}.`,
    `${filler} I just got paged for ${article} ${error} affecting the ${system}. I need to ${action} to prevent any further data loss. I'll be back in ${ttr}.`,
  ];

  let excuse = getRand(templates);
  let timeSaved = severity === 'P0' ? 60 : severity === 'P1' ? 30 : 15;

  if (severity === 'P1') {
    excuse = `[P1 INCIDENT] ` + excuse;
  } else if (severity === 'P0') {
    excuse = `!!! [P0 CATASTROPHIC FAILURE] !!! ` + excuse.toUpperCase() + ` TOTAL OUTAGE IMMINENT.`;
  }

  return { text: excuse, ticketId, timeSaved };
};
