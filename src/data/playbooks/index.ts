import type { Playbook } from './types';
import { getPersonByRole } from '../../utils/team';

export const PLAYBOOKS: Record<string, Playbook> = {
    'l0-certification': {
        id: 'l0-certification',
        name: 'Scenario L0: Operator Certification',
        description: 'Guided walkthrough of the core SMOKESCREEN game loop. Required for all new recruits.',
        difficulty: 'L0',
        runbookText: '### CERTIFICATION_RUNBOOK\n1. Initialize Stack: `aws` / `gcp` / `azure`\n2. Escalate Threat: `p3` / `p1` / `p0`\n3. Engage Theatre: `declare`\n4. Mitigate: Follow on-screen beacons.\n5. Resolve: `resolve`',
        events: [
            { offsetMs: 0, type: 'OBJECTIVE', payload: { title: 'Initialize Primary Stack', status: 'active' } },
            { offsetMs: 1000, type: 'CHAT', payload: { id: 'l0-1', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'Welcome to the war room. First, we need to choose a cloud provider. Type `aws` to initialize our primary stack.', isBot: false } },
            { offsetMs: 2000, type: 'WAIT', payload: null },
            
            { offsetMs: 3000, type: 'OBJECTIVE', payload: { title: 'Escalate Threat Level', status: 'active' } },
            { offsetMs: 4000, type: 'CHAT', payload: { id: 'l0-2', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'Good. Now we need to simulate a threat. Type `p3` to escalate the threat level.', isBot: false } },
            { offsetMs: 5000, type: 'WAIT', payload: null },

            { offsetMs: 6000, type: 'OBJECTIVE', payload: { title: 'Declare Incident', status: 'active' } },
            { offsetMs: 7000, type: 'CHAT', payload: { id: 'l0-3', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'Threat detected. We need to officially engage. Type `declare` to start the incident theatre.', isBot: false } },
            { offsetMs: 8000, type: 'WAIT', payload: null },

            { offsetMs: 9000, type: 'OBJECTIVE', payload: { title: 'Open Incident Chat', status: 'active' } },
            { offsetMs: 10000, type: 'CHAT', payload: { id: 'l0-4', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'The war room is active. Open the Incident Chat pane [F5] to stay in sync with the team.', isBot: false } },
            { offsetMs: 11000, type: 'BEACON', payload: 'chat' },
            { offsetMs: 12000, type: 'WAIT', payload: null },

            { offsetMs: 13000, type: 'OBJECTIVE', payload: { title: 'Resolve Incident', status: 'active' } },
            { offsetMs: 14000, type: 'CHAT', payload: { id: 'l0-5', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'We have mitigated the simulated issues. Close the incident by typing `resolve`.', isBot: false } },
            { offsetMs: 15000, type: 'WAIT', payload: null },

            { offsetMs: 16000, type: 'CHAT', payload: { id: 'l0-done', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'Certification complete. You are now authorized to handle production incidents. Good luck out there.', isBot: false } },
            { offsetMs: 17000, type: 'OBJECTIVE', payload: { title: 'Certification Complete', status: 'active' } }
        ]
    },
    'l1-routine-patch': {
        id: 'l1-routine-patch',
        name: 'Scenario L1: Routine Patching',
        description: 'Standard security-hardened image rotation across the production cluster. Low risk.',
        difficulty: 'L1',
        runbookText: '### PATCHING_RUNBOOK\n1. Monitor node drain in **DEPLOYMENT_STATUS**.\n2. Once nodes are healthy, run `patch confirm` in the terminal.',
        events: [
            { offsetMs: 0, type: 'OBJECTIVE', payload: { title: 'Mission Briefing: AMI Rotation', status: 'active' } },
            { offsetMs: 2000, type: 'BEACON', payload: 'incidentPlaybook' },
            { offsetMs: 5000, type: 'CHAT', payload: { id: 'l1-1', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'Initiating standard node-drain for secure AMI rotation.', isBot: false } },
            { offsetMs: 15000, type: 'SEVERITY', payload: 'P3' },
            { offsetMs: 20000, type: 'CHAT', payload: { id: 'l1-instruct-1', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: '@operator Open the K8s Deployment pane [F3] to monitor the evacuation.', isBot: false } },
            { offsetMs: 25000, type: 'BEACON', payload: 'deploy' },
            { offsetMs: 30000, type: 'LOG', payload: 'INFO: Draining node node-alpha-01...' },
            { offsetMs: 50000, type: 'OBJECTIVE', payload: { title: 'Monitor Workload Evacuation', status: 'active' } },
            { offsetMs: 60000, type: 'CHAT', payload: { id: 'l1-2', user: 'CloudWatch', bio: 'AWS_MONITOR', text: 'Workload evacuation proceeding within normal latency bounds.', isBot: true } },
            { offsetMs: 110000, type: 'OBJECTIVE', payload: { title: 'Awaiting Resolution', status: 'warning' } },
            { offsetMs: 115000, type: 'CHAT', payload: { id: 'l1-3', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: '@operator Patching complete. All nodes rotated and healthy. Type `resolve` in the terminal [F1] to close out.', isBot: false } },
            { offsetMs: 118000, type: 'BEACON', payload: 'terminal' }
        ]
    },
    'l2-network-flap': {
        id: 'l2-network-flap',
        name: 'Scenario L2: Network Flap',
        description: 'BGP prefix flapping causing intermittent connectivity loss. Requires manual override.',
        difficulty: 'L2',
        runbookText: '### BGP_EMERGENCY_RUNBOOK\n1. Analyze packet drops in **SYSTEM_LOGS**.\n2. When prompted, execute `bgp reset` in the terminal.\n3. Type the authorization phrase to finalize peer stability.',
        events: [
            { offsetMs: 0, type: 'OBJECTIVE', payload: { title: 'Mission Briefing: Peer Instability', status: 'active' } },
            { offsetMs: 5000, type: 'CHAT', payload: { id: 'l2-1', user: getPersonByRole('NetEng').name, bio: getPersonByRole('NetEng').role, text: 'Detected BGP prefix instability on upstream transit peers.', isBot: false } },
            { offsetMs: 15000, type: 'SEVERITY', payload: 'P3' },
            { offsetMs: 20000, type: 'CHAT', payload: { id: 'l2-instruct-1', user: getPersonByRole('NetEng').name, bio: getPersonByRole('NetEng').role, text: '@operator Open the Technical Logs [F2] to track packet drops.', isBot: false } },
            { offsetMs: 25000, type: 'BEACON', payload: 'logs' },
            { offsetMs: 30000, type: 'CHAT', payload: { id: 'l2-2', user: 'PagerDuty', bio: 'ALERT_ORCHESTRATOR', text: 'Ingress packet loss spike: EMEA regions reporting 15% drop.', isBot: true } },
            { offsetMs: 45000, type: 'SEVERITY', payload: 'P1' },
            { offsetMs: 55000, type: 'OBJECTIVE', payload: { title: 'Prepare Peer Reset', status: 'warning' } },
            { offsetMs: 60000, type: 'CHAT', payload: { id: 'l2-instruct-2', user: getPersonByRole('NetEng').name, bio: getPersonByRole('NetEng').role, text: '@operator Stand by for emergency BGP session override. Get ready to type the code in the Terminal.', isBot: false } },
            { offsetMs: 68000, type: 'BEACON', payload: 'terminal' },
            { offsetMs: 70000, type: 'OVERRIDE', payload: null }, // Puzzle 1
            { offsetMs: 71000, type: 'WAIT', payload: null },
            { offsetMs: 75000, type: 'CHAT', payload: { id: 'l2-3', user: getPersonByRole('NetEng').name, bio: getPersonByRole('NetEng').role, text: 'Override accepted. Initiating reset.', isBot: false } },
            { offsetMs: 100000, type: 'OBJECTIVE', payload: { title: 'Authorize Recovery Sequence', status: 'warning' } },
            { offsetMs: 105000, type: 'CHAT', payload: { id: 'l2-instruct-3', user: getPersonByRole('VP_Eng').name, bio: getPersonByRole('VP_Eng').role, text: '@operator I need formal authorization. Type the confirmation phrase exactly when prompted.', isBot: false } },
            { offsetMs: 115000, type: 'APPROVAL', payload: 'phrase' }, // Puzzle 2 (+45s from P1)
            { offsetMs: 116000, type: 'WAIT', payload: null },
            { offsetMs: 118000, type: 'CHAT', payload: { id: 'l2-4', user: getPersonByRole('VP_Eng').name, bio: getPersonByRole('VP_Eng').role, text: 'Authorization confirmed. Good work.', isBot: false } },
            { offsetMs: 125000, type: 'CHAT', payload: { id: 'l2-instruct-4', user: getPersonByRole('NetEng').name, bio: getPersonByRole('NetEng').role, text: '@operator Peer stabilized. Type `resolve` to close out the incident.', isBot: false } },
            { offsetMs: 128000, type: 'BEACON', payload: 'terminal' },
            { offsetMs: 130000, type: 'OBJECTIVE', payload: { title: 'Awaiting Resolution', status: 'warning' } }
        ]
    },
    'l3-db-deadlock': {
        id: 'l3-db-deadlock',
        name: 'Scenario L3: Database Deadlock',
        description: 'Synchronous lock contention on primary write shards. Requires multiple approvals.',
        difficulty: 'L3',
        runbookText: '### DATABASE_DEADLOCK_RUNBOOK\n1. Authorize query kill sequence with `db kill` in terminal.\n2. Hold **DEPLOY** button in the Deployment pane to force-rebalance the pool.',
        events: [
            { offsetMs: 0, type: 'OBJECTIVE', payload: { title: 'Mission Briefing: Lock Contention', status: 'active' } },
            { offsetMs: 5000, type: 'CHAT', payload: { id: 'l3-1', user: getPersonByRole('DBA').name, bio: getPersonByRole('DBA').role, text: 'Critical lock contention detected on user_sessions table.', isBot: false } },
            { offsetMs: 15000, type: 'SEVERITY', payload: 'P3' },
            { offsetMs: 30000, type: 'CHAT', payload: { id: 'l3-2', user: 'OpsGenie', bio: 'INCIDENT_ROUTING', text: 'Connection pool saturation imminent. Latency at 5000ms.', isBot: true } },
            { offsetMs: 50000, type: 'SEVERITY', payload: 'P1' },
            { offsetMs: 65000, type: 'OBJECTIVE', payload: { title: 'Authorize Kill Sequence', status: 'warning' } },
            { offsetMs: 80000, type: 'APPROVAL', payload: 'phrase' }, // Puzzle 1
            { offsetMs: 81000, type: 'WAIT', payload: null },
            { offsetMs: 85000, type: 'CHAT', payload: { id: 'l3-3', user: getPersonByRole('DBA').name, bio: getPersonByRole('DBA').role, text: '@operator AUTHORIZE query kill sequence to break the deadlock.', isBot: false } },

            { offsetMs: 105000, type: 'OBJECTIVE', payload: { title: 'Prepare Pool Rebalance', status: 'warning' } },
            { offsetMs: 120000, type: 'APPROVAL', payload: 'hold' }, // Puzzle 2 (+40s from P1)
            { offsetMs: 121000, type: 'WAIT', payload: null },
            { offsetMs: 125000, type: 'CHAT', payload: { id: 'l3-4', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'Deadlock persists. Hold DEPLOY to force-rebalance the pool.', isBot: false } },
            { offsetMs: 140000, type: 'LOG', payload: 'WARN: High I/O wait on primary partition...' },
            { offsetMs: 150000, type: 'SEVERITY', payload: 'P0' },
            { offsetMs: 160000, type: 'OBJECTIVE', payload: { title: 'System Stabilizing', status: 'active' } }
        ]
    },
    'l4-cascade-failure': {
        id: 'l4-cascade-failure',
        name: 'Scenario L4: Cascade Failure',
        description: 'Multi-region service mesh failure with executive pressure. High complexity.',
        difficulty: 'L4',
        runbookText: '### CASCADING_FAILURE_RUNBOOK\n1. Reroute EMEA/US-EAST traffic on the **OUTAGE_MAP**.\n2. Run `mesh restart` to restore control plane connectivity.\n3. Execute emergency failover via slider in **APPROVAL_SYSTEM**.',
        events: [
            { offsetMs: 0, type: 'OBJECTIVE', payload: { title: 'Mission Briefing: Mesh Collapse', status: 'active' } },
            { offsetMs: 5000, type: 'CHAT', payload: { id: 'l4-1', user: getPersonByRole('SRE Lead').name, bio: getPersonByRole('SRE Lead').role, text: 'Service mesh control plane is non-responsive. Cascading timeouts detected.', isBot: false } },
            { offsetMs: 20000, type: 'SEVERITY', payload: 'P1' },
            { offsetMs: 35000, type: 'CHAOS', payload: true },
            { offsetMs: 50000, type: 'OBJECTIVE', payload: { title: 'SITREP Required', status: 'warning' } },
            { offsetMs: 65000, type: 'INTERRUPT', payload: null }, // Puzzle 1
            { offsetMs: 66000, type: 'WAIT', payload: null },
            { offsetMs: 67000, type: 'BEACON', payload: 'chat' },
            { offsetMs: 80000, type: 'SEVERITY', payload: 'P0' },
            { offsetMs: 95000, type: 'OBJECTIVE', payload: { title: 'Emergency Mesh Override', status: 'warning' } },
            { offsetMs: 110000, type: 'OVERRIDE', payload: null }, // Puzzle 2 (+45s from P1)
            { offsetMs: 111000, type: 'WAIT', payload: null },
            { offsetMs: 130000, type: 'OBJECTIVE', payload: { title: 'Authorize Global Failover', status: 'warning' } },
            { offsetMs: 145000, type: 'APPROVAL', payload: 'slider' }, // Puzzle 3 (+35s from P2)
            { offsetMs: 146000, type: 'WAIT', payload: null },
            { offsetMs: 150000, type: 'CHAT', payload: { id: 'l4-2', user: getPersonByRole('CTO').name, bio: getPersonByRole('CTO').role, text: '@operator Status report! Why is the entire stack red?', isBot: false } },
            { offsetMs: 165000, type: 'OBJECTIVE', payload: { title: 'Final Executive Demand', status: 'warning' } },
            { offsetMs: 180000, type: 'INTERRUPT', payload: null }, // Puzzle 4 (+35s from P3)
            { offsetMs: 181000, type: 'WAIT', payload: null }
        ]
    },
    'l5-extinction-event': {
        id: 'l5-extinction-event',
        name: 'Scenario L5: Extinction Event',
        description: 'Coordinated ransomware attack and total infrastructure wipe. Extreme difficulty.',
        difficulty: 'L5',
        runbookText: '### EXTINCTION_PROTOCOL\n1. Run `vault seal` in terminal to prevent further data purge.\n2. Complete multiple authorization puzzles (Phrase -> Hold -> Slider) to isolate global keys.\n3. Pray.',
        events: [
            { offsetMs: 0, type: 'OBJECTIVE', payload: { title: 'SURVIVE THE PURGE', status: 'active' } },
            { offsetMs: 2000, type: 'CHAT', payload: { id: 'l5-1', user: 'Sentry', bio: 'ERROR_TRACKING', text: 'TOTAL INFRASTRUCTURE BREACH. IRREVERSIBLE DATA PURGE DETECTED.', isBot: true } },
            { offsetMs: 10000, type: 'SEVERITY', payload: 'P0' },
            { offsetMs: 20000, type: 'CHAOS', payload: true },
            { offsetMs: 30000, type: 'LOG', payload: 'FATAL: /bin/rm -rf / --no-preserve-root EXECUTION DETECTED' },
            
            // Interaction 1: Override
            { offsetMs: 40000, type: 'OBJECTIVE', payload: { title: 'Seal Kernel Vault', status: 'warning' } },
            { offsetMs: 55000, type: 'OVERRIDE', payload: null }, 
            { offsetMs: 56000, type: 'WAIT', payload: null },
            { offsetMs: 60000, type: 'CHAT', payload: { id: 'l5-2', user: getPersonByRole('CISO').name, bio: getPersonByRole('CISO').role, text: 'ABANDON SHIP. PURGE ALL KEYS. SAVE WHAT YOU CAN.', isBot: false } },
            
            // Interaction 2: Multiple Approvals
            { offsetMs: 90000, type: 'OBJECTIVE', payload: { title: 'Final Authorization', status: 'warning' } },
            { offsetMs: 105000, type: 'APPROVAL', payload: 'phrase' },
            { offsetMs: 106000, type: 'WAIT', payload: null },
            { offsetMs: 120000, type: 'APPROVAL', payload: 'hold' },
            { offsetMs: 121000, type: 'WAIT', payload: null },
            { offsetMs: 135000, type: 'APPROVAL', payload: 'slider' },
            { offsetMs: 136000, type: 'WAIT', payload: null },

            // Final Pressure
            { offsetMs: 160000, type: 'OBJECTIVE', payload: { title: 'Awaiting Silence', status: 'active' } },
            { offsetMs: 180000, type: 'CHAT', payload: { id: 'l5-3', user: getPersonByRole('CISO').name, bio: getPersonByRole('CISO').role, text: 'Is it over?', isBot: false } }
        ]
    }
};
