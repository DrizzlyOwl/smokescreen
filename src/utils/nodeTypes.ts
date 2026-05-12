export const NodeType = {
  K8S: 'k8s',
  DB: 'db',
  BGP: 'bgp',
  MESH: 'mesh',
  VAULT: 'vault',
  PROBE: 'probe',
  COMPUTE: 'compute',
  CDN: 'cdn',
  QUEUE: 'queue',
  NETWORK: 'network',
  STORAGE: 'storage',
  UNKNOWN: 'unknown'
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

export const NODE_TYPE_REMEDIATION: Record<NodeType, string> = {
  [NodeType.K8S]: 'k8s restart',
  [NodeType.DB]: 'db kill',
  [NodeType.BGP]: 'bgp reset',
  [NodeType.MESH]: 'mesh restart',
  [NodeType.VAULT]: 'vault seal',
  [NodeType.PROBE]: 'probe override',
  [NodeType.COMPUTE]: 'compute cycle',
  [NodeType.CDN]: 'cdn purge',
  [NodeType.QUEUE]: 'queue flush',
  [NodeType.NETWORK]: 'network reset',
  [NodeType.STORAGE]: 'storage sync',
  [NodeType.UNKNOWN]: 'system override'
};

const K8S_KEYWORDS = ['eks', 'gke', 'aks', 'k8s', 'cluster', 'fargate', 'lambda'];
const DB_KEYWORDS = ['rds', 'spanner', 'sql', 'database', 'redis', 'kafka'];
const BGP_KEYWORDS = ['gateway', 'transit', 'directconnect', 'peer', 'dns', 'route'];
const MESH_KEYWORDS = ['mesh', 'ingress', 'proxy', 'consul'];
const VAULT_KEYWORDS = ['vault', 'secret', 'iam', 'policy', 'cognito', 'entra', 'active directory', 'identity', 'auth'];
const PROBE_KEYWORDS = ['probe', 'scraper', 'monitor', 'watchdog', 'health', 'agent', 'router', 'logplex', 'analytics', 'cloudwatch', 'telemetry', 'optimizer', 'compiler', 'cli'];
const COMPUTE_KEYWORDS = ['compute', 'vm', 'instance', 'host', 'dyno', 'runtime', 'worker', 'server', 'blade', 'rack', 'machine', 'pool', 'node', 'app', 'function', 'manager', 'engine'];
const CDN_KEYWORDS = ['cloudfront', 'cdn', 'edge', 'cloudflare', 'front door', 'pages', 'tunnel', 'distribution', 'waf'];
const QUEUE_KEYWORDS = ['queue', 'stream', 'pub/sub', 'kinesis', 'event', 'topic', 'bus', 'sqs', 'message'];
const NETWORK_KEYWORDS = ['vpc', 'network', 'firewall', 'switch', 'vlan', 'mac', 'port', 'circuit', 'balancer', 'nat', 'nsg', 'ip', 'peering', 'link', 'endpoint'];
const STORAGE_KEYWORDS = ['s3', 'bucket', 'blob', 'ebs', 'san', 'nfs', 'datastore', 'volume', 'vhdx', 'disk', 'filer', 'tape', 'array', 'kv', 'object', 'storage'];

export const getNodeType = (name: string): NodeType => {
  const n = name.toLowerCase();
  if (VAULT_KEYWORDS.some(k => n.includes(k))) return NodeType.VAULT;
  if (K8S_KEYWORDS.some(k => n.includes(k))) return NodeType.K8S;
  if (CDN_KEYWORDS.some(k => n.includes(k))) return NodeType.CDN;
  if (MESH_KEYWORDS.some(k => n.includes(k))) return NodeType.MESH;
  if (PROBE_KEYWORDS.some(k => n.includes(k))) return NodeType.PROBE;
  if (BGP_KEYWORDS.some(k => n.includes(k))) return NodeType.BGP;
  if (DB_KEYWORDS.some(k => n.includes(k))) return NodeType.DB;
  if (QUEUE_KEYWORDS.some(k => n.includes(k))) return NodeType.QUEUE;
  if (STORAGE_KEYWORDS.some(k => n.includes(k))) return NodeType.STORAGE;
  if (NETWORK_KEYWORDS.some(k => n.includes(k))) return NodeType.NETWORK;
  if (COMPUTE_KEYWORDS.some(k => n.includes(k))) return NodeType.COMPUTE;
  return NodeType.UNKNOWN;
};
