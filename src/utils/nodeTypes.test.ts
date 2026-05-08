import { describe, it, expect } from 'vitest';
import { NodeType, getNodeType, NODE_TYPE_REMEDIATION } from './nodeTypes';

describe('nodeTypes utility', () => {
  describe('getNodeType', () => {
    it('identifies K8S nodes', () => {
      expect(getNodeType('EKS control plane')).toBe(NodeType.K8S);
      expect(getNodeType('gke-cluster-1')).toBe(NodeType.K8S);
      expect(getNodeType('AKS-Node')).toBe(NodeType.K8S);
      expect(getNodeType('k8s-ingress')).toBe(NodeType.K8S);
      expect(getNodeType('fargate-executor')).toBe(NodeType.K8S);
      expect(getNodeType('Lambda-runtime')).toBe(NodeType.K8S);
    });

    it('identifies DB nodes', () => {
      expect(getNodeType('RDS Multi-AZ')).toBe(NodeType.DB);
      expect(getNodeType('Cloud Spanner node')).toBe(NodeType.DB);
      expect(getNodeType('MySQL-primary')).toBe(NodeType.DB);
      expect(getNodeType('Production Database')).toBe(NodeType.DB);
      expect(getNodeType('Redis-cache')).toBe(NodeType.DB);
      expect(getNodeType('Kafka-broker')).toBe(NodeType.DB);
    });

    it('identifies BGP/Network nodes', () => {
      expect(getNodeType('API Gateway')).toBe(NodeType.BGP);
      expect(getNodeType('Transit Gateway')).toBe(NodeType.BGP);
      expect(getNodeType('DirectConnect-A')).toBe(NodeType.BGP);
      expect(getNodeType('CoreDNS')).toBe(NodeType.BGP);
      expect(getNodeType('Route53-resolver')).toBe(NodeType.BGP);
    });

    it('identifies MESH nodes', () => {
      expect(getNodeType('Service Mesh')).toBe(NodeType.MESH);
      expect(getNodeType('Nginx Ingress')).toBe(NodeType.MESH);
      expect(getNodeType('Sidecar Proxy')).toBe(NodeType.MESH);
      expect(getNodeType('Consul-agent')).toBe(NodeType.MESH);
    });

    it('identifies VAULT nodes', () => {
      expect(getNodeType('Vault engine')).toBe(NodeType.VAULT);
      expect(getNodeType('Secret Manager')).toBe(NodeType.VAULT);
      expect(getNodeType('IAM policy engine')).toBe(NodeType.VAULT);
    });

    it('returns UNKNOWN for unmatched names', () => {
      expect(getNodeType('Random-Service')).toBe(NodeType.UNKNOWN);
      expect(getNodeType('')).toBe(NodeType.UNKNOWN);
    });
  });

  describe('NODE_TYPE_REMEDIATION', () => {
    it('provides correct remediation hints', () => {
      expect(NODE_TYPE_REMEDIATION[NodeType.K8S]).toBe('k8s restart');
      expect(NODE_TYPE_REMEDIATION[NodeType.DB]).toBe('db kill');
      expect(NODE_TYPE_REMEDIATION[NodeType.BGP]).toBe('bgp reset');
      expect(NODE_TYPE_REMEDIATION[NodeType.MESH]).toBe('mesh restart');
      expect(NODE_TYPE_REMEDIATION[NodeType.VAULT]).toBe('vault seal');
      expect(NODE_TYPE_REMEDIATION[NodeType.UNKNOWN]).toBe('manual override');
    });
  });
});
