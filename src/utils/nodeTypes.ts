export const NodeType = {
  K8S: 'k8s',
  DB: 'db',
  BGP: 'bgp',
  MESH: 'mesh',
  VAULT: 'vault',
  UNKNOWN: 'unknown'
} as const;

export type NodeType = typeof NodeType[keyof typeof NodeType];

export const NODE_TYPE_REMEDIATION: Record<NodeType, string> = {
  [NodeType.K8S]: 'k8s restart',
  [NodeType.DB]: 'db kill',
  [NodeType.BGP]: 'bgp reset',
  [NodeType.MESH]: 'mesh restart',
  [NodeType.VAULT]: 'vault seal',
  [NodeType.UNKNOWN]: 'manual override'
};

const K8S_KEYWORDS = ['eks', 'gke', 'aks', 'k8s', 'cluster', 'fargate', 'lambda'];
const DB_KEYWORDS = ['rds', 'spanner', 'sql', 'database', 'redis', 'kafka', 'storage'];
const BGP_KEYWORDS = ['gateway', 'transit', 'directconnect', 'peer', 'dns', 'route'];
const MESH_KEYWORDS = ['mesh', 'ingress', 'proxy', 'consul'];
const VAULT_KEYWORDS = ['vault', 'secret', 'iam', 'policy'];

export const getNodeType = (name: string): NodeType => {
  const n = name.toLowerCase();
  if (K8S_KEYWORDS.some(k => n.includes(k))) return NodeType.K8S;
  if (DB_KEYWORDS.some(k => n.includes(k))) return NodeType.DB;
  if (BGP_KEYWORDS.some(k => n.includes(k))) return NodeType.BGP;
  if (MESH_KEYWORDS.some(k => n.includes(k))) return NodeType.MESH;
  if (VAULT_KEYWORDS.some(k => n.includes(k))) return NodeType.VAULT;
  return NodeType.UNKNOWN;
};
