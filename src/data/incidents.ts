import { GoogleGenerativeAI } from '@google/generative-ai';

export type Severity = 'NOMINAL' | 'P3' | 'P1' | 'P0';
export type Stack = 'AWS' | 'GCP' | 'AZURE' | 'ON-PREM' | 'SERVERLESS' | 'CLOUDFLARE' | 'HEROKU' | 'HYPER-V' | 'VMWARE';

interface Jargon {
  systems: string[];
  actions: string[];
  errors: Record<Severity, string[]>;
}

const commonJargon: Jargon = {
  systems: [
    'Prometheus scraper', 'Kafka broker cluster', 'Vault secret engine', 'Redis sentinel', 
    'NGINX ingress controller', 'CoreDNS mesh', 'Consul agent', 'sidecar proxy',
    'service mesh control plane', 'message queue consumer', 'Vector log router',
    'Elasticsearch data node', 'HashiCorp Nomad client', 'internal gRPC gateway'
  ],
  actions: [
    'rotating the TLS certs', 'purging some stale keys', 're-syncing the state', 'patching a zero-day',
    're-balancing the shards', 'draining the worker nodes', 'invalidating the CDN edge cache',
    'auditing the firewall rules', 're-indexing the search cluster', 'flushing the dead-letter queues',
    'manually failing over the primary', 'garbage collecting the heap', 'debugging the race condition'
  ],
  errors: {
    NOMINAL: [],
    P3: ['minor latency spike', 'increased tail latency', 'stale cache entry', 'non-critical background job failure', 'minor schema drift'],
    P1: ['503 Service Unavailable', 'OOM killer trigger', 'checksum mismatch', 'race condition', 'TCP window size collapse', 'inode exhaustion'],
    P0: ['total cluster blackhole', 'cascading kernel panic', 'global state corruption', 'active data exfiltration', 'unrecoverable hardware fault']
  }
};

const stackJargon: Record<Stack, Jargon> = {
  AWS: {
    systems: [
      'EKS control plane', 'RDS Multi-AZ replica', 'S3 VPC endpoint', 'IAM policy engine', 
      'Kinesis stream shard', 'CloudFront distribution', 'Lambda@Edge runtime', 
      'Transit Gateway', 'AppMesh mesh', 'DirectConnect circuit', 'Cognito user pool'
    ],
    actions: [
      'draining the Fargate nodes', 're-indexing the DynamoDB shards', 're-announcing BGP via DirectConnect',
      'modifying the Security Group ingress', 'rotating the IAM access keys', 're-syncing the EBS snapshots',
      'purging the SQS queue', 'attaching the ENI', 're-provisioning the Aurora cluster', 'adjusting the Auto Scaling Group'
    ],
    errors: {
      NOMINAL: [],
      P3: ['eventual consistency lag', 'CloudWatch alarm delay', 'S3 eventual consistency ghosting', 'minor SQS queue depth increase'],
      P1: ['VPC peering throughput collapse', 'KMS throttling incident', 'S3 bucket policy conflict', '504 Gateway Timeout on the ELB'],
      P0: ['Region-wide US-EAST-1 outage', 'DirectConnect hardware failure', 'IAM permission boundary total lockout', 'Route53 global DNS failure']
    }
  },
  GCP: {
    systems: [
      'GKE Autopilot cluster', 'Cloud Spanner node', 'BigQuery slot', 'Cloud Armor policy', 
      'Pub/Sub topic partition', 'Cloud Run instance', 'Anthos Service Mesh', 'Cloud Storage bucket',
      'Compute Engine instance group', 'Cloud SQL proxy', 'Identity-Aware Proxy'
    ],
    actions: [
      're-balancing the Global Load Balancer', 'migrating the Persistent Disks', 're-configuring Anthos',
      'adjusting the BigQuery priority jobs', 'rotating the Service Account keys', 'purging the Cloud Tasks queue',
      're-imaging the GCI instance', 'modifying the VPC network peering', 'flushing the Cloud Memorystore',
      'validating the Binary Authorization policy'
    ],
    errors: {
      NOMINAL: [],
      P3: ['minor Project quota delay', 'Cloud Build queue buildup', 'GKE master node maintenance lag', 'Pub/Sub delivery latency'],
      P1: ['quorum loss in the multi-region Spanner', 'IAM propagation delay', 'GCE preemption spike', 'Shared VPC host project unreachable'],
      P0: ['Global Load Balancer total failure', 'Project-wide IAM revocation', 'BigTable cluster-wide corruption', 'Internal Load Balancer total partition']
    }
  },
  AZURE: {
    systems: [
      'AKS cluster', 'CosmosDB partition', 'Azure Front Door', 'ExpressRoute circuit', 'Entra ID sync',
      'Azure SQL database', 'Key Vault HSM', 'Service Bus namespace', 'App Service Plan',
      'Blob Storage container', 'Log Analytics workspace'
    ],
    actions: [
      're-provisioning the Resource Group', 'purging the Blob Storage container', 're-configuring the Traffic Manager',
      'rotating the Key Vault secrets', 'adjusting the Autoscale settings', 're-syncing the Entra ID tenant',
      'patching the virtual machine scale set', 'modifying the NSG rules', 'flushing the Redis cache',
      're-mapping the Private Link'
    ],
    errors: {
      NOMINAL: [],
      P3: ['Log Analytics ingestion delay', 'App Service slow start', 'minor subscription quota warning', 'Redis cache warm-up lag'],
      P1: ['Service Bus namespace congestion', 'tenant-level throttling', 'ARM template deployment failure', 'Regional outage in UK-South'],
      P0: ['Entra ID (Azure AD) global authentication failure', 'ExpressRoute BGP total collapse', 'CosmosDB primary region loss with no failover', 'Front Door global routing wipe']
    }
  },
  'ON-PREM': {
    systems: [
      'VMWare ESXi host', 'SAN storage array', 'Cisco Catalyst switch', 'F5 Big-IP balancer', 'bare-metal blade',
      'Active Directory controller', 'NetApp filer', 'Fortinet firewall', 'NFS mount point',
      'Dell PowerEdge rack', 'APC UPS management card'
    ],
    actions: [
      're-seating the RAID controller', 'clearing the MAC address table', 're-cabling the heartbeat link',
      're-imaging the PXE boot node', 'vMotioning the critical VM', 'patching the kernel on the hypervisor',
      'replacing the SFP+ module', 'manually clearing the tape drive', 're-configuring the VLAN tagging',
      'running a memory diagnostic'
    ],
    errors: {
      NOMINAL: [],
      P3: ['NFS stale file handle', 'minor predictive drive failure', 'VLAN 10 broadcast storm (suppressed)', 'UPS battery self-test failure'],
      P1: ['BGP flapping in the core switch', 'air-con failure in Rack B', 'memory ECC error', 'packet loss on the fiber uplink', 'disk pressure on the root partition'],
      P0: ['Core switch total hardware failure', 'SAN storage array head unit crash', 'Data center fire suppression discharge', 'Total site power loss (UPS bypassed)']
    }
  },
  SERVERLESS: {
    systems: [
      'Lambda runtime', 'API Gateway endpoint', 'cold start optimizer', 'Step Function state machine', 'Edge worker',
      'DynamoDB stream', 'EventBridge bus', 'AppSync GraphQL API', 'SQS trigger',
      'CloudWatch event rule', 'Serverless framework stack'
    ],
    actions: [
      'purging the CDN cache', 'warm-starting the concurrency pool', 're-mapping the trigger',
      'tracing the execution graph', 're-deploying the CloudFormation template', 'increasing the memory allocation',
      'adjusting the provisioned concurrency', 're-configuring the CORS policy', 'flushing the global state',
      'debugging the async callback'
    ],
    errors: {
      NOMINAL: [],
      P3: ['minor Lambda cold start spike', 'AppSync schema validation delay', 'EventBridge minor delivery lag', 'CloudWatch log stream delay'],
      P1: ['concurrency limit hit', 'execution timeout on a cold start', 'orchestration loop', 'ephemeral storage overflow', 'IAM execution role permission denied'],
      P0: ['Global Lambda runtime execution failure', 'API Gateway global route table corruption', 'Step Function state machine deadlock loop', 'DynamoDB Stream infinite recursion']
    }
  },
  CLOUDFLARE: {
    systems: [
      'Workers runtime', 'KV store', 'Durable Objects', 'Pages deployment', 'R2 bucket',
      'WAF rule engine', 'Argo Smart Routing', 'Zero Trust gateway', 'Cloudflared tunnel'
    ],
    actions: [
      'purging the edge cache', 're-deploying the Worker', 'modifying the Page rule',
      'invalidating the KV namespace', 'rotating the API tokens', 're-configuring the Firewall',
      'optimizing the Argo route', 'syncing the R2 replica'
    ],
    errors: {
      NOMINAL: [],
      P3: ['KV eventual consistency lag', 'minor WAF false positive', 'Worker cold start spike'],
      P1: ['522 Connection Timed Out', '524 A Timeout Occurred', 'WAF global bypass vulnerability', 'R2 throughput throttling'],
      P0: ['Global Edge Network blackout', 'Durable Object state corruption', 'DNS resolution failure at the edge']
    }
  },
  HEROKU: {
    systems: [
      'Dyno manager', 'slug compiler', 'Postgres add-on', 'Redis instance', 'Logplex router',
      'Heroku CLI', 'Private Space gateway', 'Heroku Connect'
    ],
    actions: [
      'scaling the dyno formation', 'cycling the dynos', 'running a database migration',
      'purging the buildpack cache', 'tailing the log stream', 'promoting the pipeline stage',
      're-provisioning the add-on', 'modifying the config vars'
    ],
    errors: {
      NOMINAL: [],
      P3: ['H12 Request Timeout', 'R14 Memory Quota Exceeded', 'minor slug compilation delay'],
      P1: ['H10 App Crashed', 'H13 Connection Closed Without Response', 'Postgres connection limit reached'],
      P0: ['Global Dyno Runtime outage', 'Logplex total buffer overflow', 'Heroku API service unavailability']
    }
  },
  'HYPER-V': {
    systems: [
      'Hyper-V Host', 'VHDX storage', 'Virtual Switch Manager', 'Failover Cluster',
      'Live Migration engine', 'Checkpoints', 'SCVMM console'
    ],
    actions: [
      'initiating Live Migration', 'compacting the VHDX', 're-configuring the Virtual Switch',
      'merging the checkpoints', 're-seating the CSV', 'patching the Host OS',
      'optimizing the VM memory'
    ],
    errors: {
      NOMINAL: [],
      P3: ['Dynamic Memory pressure', 'snapshot merge lag', 'minor VM heart beat miss'],
      P1: ['Live Migration failure', 'CSV volume re-parse point error', 'VHDX corruption detected'],
      P0: ['Hyper-V Cluster total quorum loss', 'Storage Spaces Direct total failure', 'Host Kernel Panic (BSOD)']
    }
  },
  VMWARE: {
    systems: [
      'vCenter Server', 'ESXi Host', 'vSAN datastore', 'NSX-T manager', 'vMotion engine',
      'DRS scheduler', 'HA agent', 'Tanzu cluster'
    ],
    actions: [
      'vMotioning the workload', 're-balancing the DRS', 're-scanning the HBA',
      'modifying the Port Group', 'patching the ESXi host', 're-syncing the vSAN',
      'mounting the ISO'
    ],
    errors: {
      NOMINAL: [],
      P3: ['Balloon driver active', 'vMotion timeout (retry)', 'minor datastore latency'],
      P1: ['Host Not Responding', 'vSAN component degraded', 'NSX-T edge controller failure'],
      P0: ['vCenter total database corruption', 'vSAN total data loss', 'All Paths Down (APD) on primary storage']
    }
  },
};

const recoveryTimes = ['5 minutes', '20 minutes', 'an hour', 'the rest of the afternoon', 'a while'];

export const generateTicketId = () => `INC-${Math.floor(Math.random() * 9000 + 1000)}`;

const indefiniteArticle = (word: string) => {
    const firstLetter = word.toLowerCase().charAt(0);
    return ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
};

export const generateIncidentReport = (severity: Severity, stack: Stack): { text: string; ticketId: string; timeSaved: number } => {
  if (severity === 'NOMINAL') return { text: '', ticketId: '', timeSaved: 0 };

  const getRand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const useStackSpecific = Math.random() > 0.3;
  
  const system = useStackSpecific ? getRand(stackJargon[stack].systems) : getRand(commonJargon.systems);
  const action = useStackSpecific ? getRand(stackJargon[stack].actions) : getRand(commonJargon.actions);
  const error = useStackSpecific ? getRand(stackJargon[stack].errors[severity]) : getRand(commonJargon.errors[severity]);
  const ttr = getRand(recoveryTimes);
  const ticketId = generateTicketId();

  const article = indefiniteArticle(error);

  const impacts: Record<Severity, string> = {
    NOMINAL: 'NONE',
    P3: 'Minor performance degradation. No immediate user impact.',
    P1: 'Service degradation detected. Elevated 5xx errors on public endpoints.',
    P0: 'TOTAL SYSTEM OUTAGE. Global service unavailability.'
  };

  const status = severity === 'P0' ? 'CRITICAL_TRIAGE' : severity === 'P1' ? 'ACTIVE_INVESTIGATION' : 'MONITORING';

  const report = 
`[${ticketId}] ISSUE_SUMMARY: ${error.toUpperCase()} ON ${system.toUpperCase()}
------------------------------------------------------------
TYPE: INCIDENT | SEVERITY: ${severity} | STATUS: ${status}
STACK: ${stack} | COMPONENT: ${system} | EST_TTR: ${ttr}

DESCRIPTION:
Automated monitoring detected ${article} ${error} within the ${system}.
Incident responders are currently ${action} to mitigate further spread.

IMPACT:
${impacts[severity]}`;

  const timeSaved = severity === 'P0' ? 60 : severity === 'P1' ? 30 : 15;

  return { text: report, ticketId, timeSaved };
};

export const generateAIIncidentReport = async (severity: Severity, stack: Stack, apiKey: string): Promise<{ text: string; ticketId: string; timeSaved: number }> => {
  if (severity === 'NOMINAL') return { text: '', ticketId: '', timeSaved: 0 };
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `You are a senior SRE. Generate a highly technical incident report in a structured Jira Ticket format. 
    Use exactly this template:
    [INC-XXXX] ISSUE_SUMMARY: Short technical summary
    ------------------------------------------------------------
    TYPE: INCIDENT | SEVERITY: [SEV] | STATUS: [STATUS]
    STACK: [STACK] | COMPONENT: [COMPONENT] | EST_TTR: [TIME]

    DESCRIPTION:
    [2-3 sentences explaining the failure and the immediate remediation action.]

    IMPACT:
    [1 sentence explaining the blast radius.]
    
    Use heavy DevOps jargon. Sound urgent but professional.`
  });

  const prompt = `Generate a ${severity} incident report for a ${stack} environment failure.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const ticketId = generateTicketId();
    const timeSaved = severity === 'P0' ? 60 : severity === 'P1' ? 30 : 15;
    
    return { text: text.trim(), ticketId, timeSaved };
  } catch (error) {
    console.error("Gemini Error:", error);
    return generateIncidentReport(severity, stack);
  }
};
