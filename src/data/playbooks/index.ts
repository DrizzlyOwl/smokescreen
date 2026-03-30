import type { Playbook } from './types';

export const PLAYBOOKS: Record<string, Playbook> = {
    'dns-meltdown': {
        id: 'dns-meltdown',
        name: 'DNS Meltdown',
        description: 'Coordinated multi-region DNS resolution failure with BGP prefix flapping.',
        events: [
            { 
                offsetMs: 0, 
                type: 'CHAT', 
                payload: { id: 'pb-dns-1', user: 'Network_Ops', text: 'Propagating revised BGP prefix announcements to tier-1 transit peers.', isBot: false } 
            },
            { offsetMs: 2000, type: 'SEVERITY', payload: 'P3' },
            { 
                offsetMs: 5000, 
                type: 'CHAT', 
                payload: { id: 'pb-dns-2', user: 'AlertManager', text: 'Ingress Gateway: Sustained 5xx delta breach; non-zero error rate on edge clusters.', isBot: true } 
            },
            { 
                offsetMs: 8000, 
                type: 'CHAT', 
                payload: { id: 'pb-dns-3', user: 'SRE_Lead', text: 'Investigating L3/L4 resolution failure; internal VPC authoritative zones are non-responsive.', isBot: false } 
            },
            { offsetMs: 10000, type: 'SEVERITY', payload: 'P1' },
            { offsetMs: 12000, type: 'LOG', payload: 'CRITICAL: BGP SESSION DROPPED - REGION BLACKOUT' },
            { offsetMs: 15000, type: 'CHAOS', payload: true },
            { offsetMs: 20000, type: 'SEVERITY', payload: 'P0' }
        ]
    },
    'db-deadlock': {
        id: 'db-deadlock',
        name: 'Database Deadlock',
        description: 'Cascading database connection pool exhaustion and synchronous lock contention.',
        events: [
            { 
                offsetMs: 0, 
                type: 'CHAT', 
                payload: { id: 'pb-db-1', user: 'Director_Of_Eng', text: 'Total ingress blackout in US-EAST-1. Initiating multi-region failover protocol.', isBot: false } 
            },
            { offsetMs: 2000, type: 'SEVERITY', payload: 'P3' },
            { 
                offsetMs: 5000, 
                type: 'CHAT', 
                payload: { id: 'pb-db-2', user: 'DBA_Team', text: 'Initiating multi-phase DDL schema evolution on core user-partitioned shards.', isBot: false } 
            },
            { offsetMs: 8000, type: 'SEVERITY', payload: 'P1' },
            { 
                offsetMs: 12000, 
                type: 'CHAT', 
                payload: { id: 'pb-db-3', user: 'Auth_Service', text: 'Connection pool saturation reached; blocking on I/O wait for primary write-ahead log (WAL).', isBot: true } 
            },
            { 
                offsetMs: 15000, 
                type: 'CHAT', 
                payload: { id: 'pb-db-4', user: 'Customer_Support', text: 'Auth-Service degradation: 100% failure rate on JWT token refresh and session persistence.', isBot: false } 
            },
            { offsetMs: 18000, type: 'LOG', payload: 'FATAL: RECURSIVE DELETE DETECTED ON RDS STAGING' },
            { offsetMs: 20000, type: 'SEVERITY', payload: 'P0' },
            { 
                offsetMs: 25000, 
                type: 'CHAT', 
                payload: { id: 'pb-db-5', user: 'DBA_Team', text: 'Primary instance termination via OOM-Killer; secondary promotion failed due to WAL lag; multi-node split-brain state detected.', isBot: false } 
            }
        ]
    },
    'bgp-blackhole': {
        id: 'bgp-blackhole',
        name: 'BGP Blackhole',
        description: 'Upstream transit provider misconfiguration resulting in total ASN isolation.',
        events: [
            { 
                offsetMs: 0, 
                type: 'CHAT', 
                payload: { id: 'pb-bgp-1', user: 'Core_Network', text: 'Initiating low-level optimization of BGP peering sessions with Tier-1 transit providers.', isBot: false } 
            },
            { offsetMs: 2000, type: 'SEVERITY', payload: 'P3' },
            { 
                offsetMs: 5000, 
                type: 'CHAT', 
                payload: { id: 'pb-bgp-2', user: 'Global_Monitoring', text: 'Telemetry Alert: Sustained packet loss delta detected across EMEA and APAC ingress points.', isBot: true } 
            },
            { offsetMs: 10000, type: 'SEVERITY', payload: 'P1' },
            { 
                offsetMs: 12000, 
                type: 'CHAT', 
                payload: { id: 'pb-bgp-3', user: 'SRE_OnCall', text: 'ASN visibility dropped to zero in global RIB; investigating upstream prefix withdrawal.', isBot: false } 
            },
            { offsetMs: 15000, type: 'LOG', payload: 'ERR: PACKET LOSS 100% ON CORE BACKBONE' },
            { offsetMs: 20000, type: 'SEVERITY', payload: 'P0' },
            { 
                offsetMs: 25000, 
                type: 'CHAT', 
                payload: { id: 'pb-bgp-4', user: 'CTO', text: 'Executive Dashboard: Total telemetry blackout. Confirming L1/L2 link status across all regions.', isBot: false } 
            }
        ]
    },
    'kernel-panic-cascade': {
        id: 'kernel-panic-cascade',
        name: 'Kernel Panic Cascade',
        description: 'Non-deterministic node failures across the production fleet due to faulty security agent update.',
        events: [
            { 
                offsetMs: 0, 
                type: 'CHAT', 
                payload: { id: 'pb-kernel-1', user: 'K8s_Admin', text: 'Executing rolling update of security-hardened AMIs across the production cluster.', isBot: false } 
            },
            { offsetMs: 2000, type: 'SEVERITY', payload: 'P3' },
            { 
                offsetMs: 5000, 
                type: 'CHAT', 
                payload: { id: 'pb-kernel-2', user: 'Node_Monitor', text: 'Node node-01-us-east: Transitioned to NotReady state; scheduling daemon triggering workload evacuation.', isBot: true } 
            },
            { offsetMs: 10000, type: 'SEVERITY', payload: 'P1' },
            { 
                offsetMs: 12000, 
                type: 'CHAT', 
                payload: { id: 'pb-kernel-3', user: 'SRE_Lead', text: 'Abort rolling update! Production fleet capacity diminished by 40% due to non-deterministic kernel exceptions.', isBot: false } 
            },
            { offsetMs: 15000, type: 'LOG', payload: 'KERNEL: PANIC - CPU 0 STUCK FOR 22s' },
            { offsetMs: 20000, type: 'SEVERITY', payload: 'P0' },
            { 
                offsetMs: 25000, 
                type: 'CHAT', 
                payload: { id: 'pb-kernel-4', user: 'System_Log', text: 'FATAL: Control plane resource exhaustion; zero schedulable capacity remaining in global cluster context.', isBot: true } 
            }
        ]
    },
    'cloud-security-breach': {
        id: 'cloud-security-breach',
        name: 'Security Compromise',
        description: 'Unauthorized administrative access detected on root production accounts.',
        events: [
            { 
                offsetMs: 0, 
                type: 'CHAT', 
                payload: { id: 'pb-sec-1', user: 'SecOps_Bot', text: 'ALERT: Anomalous IAM API orchestration detected on root-account-01. Pattern matches known lateral movement signatures.', isBot: true } 
            },
            { offsetMs: 2000, type: 'SEVERITY', payload: 'P3' },
            { 
                offsetMs: 5000, 
                type: 'CHAT', 
                payload: { id: 'pb-sec-2', user: 'SecOps_Lead', text: 'Who is executing administrative IAM mutations via non-standard egress points?', isBot: false } 
            },
            { offsetMs: 10000, type: 'SEVERITY', payload: 'P1' },
            { 
                offsetMs: 12000, 
                type: 'CHAT', 
                payload: { id: 'pb-sec-3', user: 'Infra_Bot', text: 'Executing emergency global credential rotation for all production IAM principals.', isBot: true } 
            },
            { offsetMs: 15000, type: 'LOG', payload: 'AUTH: UNAUTHORIZED ACCESS ATTEMPT REJECTED' },
            { offsetMs: 20000, type: 'SEVERITY', payload: 'P0' },
            { 
                offsetMs: 25000, 
                type: 'CHAT', 
                payload: { id: 'pb-sec-4', user: 'CISO', text: 'Full compromise of us-west-2 control plane confirmed. Initiating scorched-earth protocol and multi-region key revocation.', isBot: false } 
            }
        ]
    }
};
