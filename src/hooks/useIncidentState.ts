/// <reference types="node" />
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { type Severity, type Stack } from '../data/incidents';
import { useWindowManager, type PaneId } from './useWindowManager';
import { useUrlSync } from './useUrlSync';
import { usePlaybookEngine } from './usePlaybookEngine';
import { useIncidentChat } from './useIncidentChat';
import { useClientStats } from './useClientStats';
import { useDebugLogger } from './useDebugLogger';
import { useCommandRegistry } from './useCommandRegistry';
import { PLAYBOOKS } from '../data/playbooks';
import { getPersonByRole } from '../utils/team';
import { useIncidentStore } from '../store/useIncidentStore';
import { useTerminalStore } from '../store/useTerminalStore';
import { useAudioStore } from '../store/useAudioStore';
import { useAudio as useAudioHook } from './useAudio';

export type { ChatMessage } from '../contexts/types';

export interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'error' | 'system';
}

export const useIncidentState = () => {
  const { log } = useDebugLogger();
  
  // 1. Zustand Stores
  const {
    appState, setAppState,
    operatorName, setOperatorName,
    theme, setTheme,
    uplinkId,
    isDebugMode, setIsDebugMode,
    isEcoMode, setIsEcoMode,
    commandHistory, addCommandToHistory
  } = useTerminalStore();

  const {
    severity, setSeverity,
    stack, setStack,
    incidentReport, setIncidentReport,
    ticketId,
    status,
    moneyLost, setMoneyLost,
    isSlowBurn, setIsSlowBurn,
    isChaos, setIsChaos,
    slowBurnCountdown,
    tickSlowBurn,
    declareIncident,
    generateStrategy,
    ceaseTheatre,
    unreadChat, setUnreadChat,
    isTransitioning, setIsTransitioning,
    terminalHistory, setTerminalHistory,
    displayText, setDisplayText,
    view, setView,
    chatMultiplier, setChatMultiplier,
    logMultiplier, setLogMultiplier,
    activeApproval, setApproval,
    activeOverride, setOverride,
    activeObjective, setObjective,
    gameMode, setGameMode,
    selectedPlaybookId, setSelectedPlaybookId,
    isResolving, setIsResolving,
    mitigationCount, incrementMitigationCount, lastScoreEarned,
    isDeclared,
    onboardingStep, setOnboardingStep,
    addBeacon, removeBeacon
  } = useIncidentStore();

  const { isAudioOn, setIsAudioOn } = useAudioStore();

  // 2. Calculated / Memoized
  const systemMetrics = useMemo(() => ({
    cpu: severity === 'P0' ? 98 : severity === 'P1' ? 75 : severity === 'P3' ? 45 : 12,
    ram: severity === 'P0' ? 31.4 : severity === 'P1' ? 24.2 : severity === 'P3' ? 16.8 : 8.4
  }), [severity]);

  const lastEscTime = useRef<number>(0);
  const pendingInterruptRef = useRef<NodeJS.Timeout | null>(null);
  const interruptPersonaRef = useRef<{ name: string, bio: string } | null>(null);
  const overrideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 3. Simple Hooks
  const { 
    panes, minimizedPanes, zIndices, poppedOutPanes, snappedMainPanes, activePane, 
    openPane, closePane, togglePane, toggleMinimize, togglePopOut, toggleSnapMain,
    bringToFront: baseBringToFront, 
    closeAll, openAll, setPanes 
  } = useWindowManager({
    chat: false, logs: false, map: false, deploy: false,
    burn: false, howTo: !localStorage.getItem('smokescreen_visited'), settings: false, metrics: false, playbooks: false, incidentPlaybook: false, readout: false, terminal: true, debug: false
  });

  const clientStats = useClientStats();
  const audio = useAudioHook();
  const { 
    playSlackPing, 
    playTagPing, 
    playAlert, 
    playLoginChime, 
    playLogoutChime, 
    playPostBeep, 
    playMitigationSuccess, 
    stopAllSounds 
  } = audio;

  // 4. Base Callbacks
  const bringToFront = useCallback((id: PaneId) => {
    if (activePane !== id) {
        log('WINDOW_MANAGER', `Bringing ${id} to front`);
        baseBringToFront(id);
        removeBeacon(id);
    }
  }, [baseBringToFront, log, activePane, removeBeacon]);

  const loggedTogglePane = useCallback((id: PaneId) => {
    log('WINDOW_MANAGER', `${panes[id] ? 'Closing' : 'Opening'} ${id} pane`);
    togglePane(id);
    if (!panes[id]) {
        removeBeacon(id);
    }
  }, [togglePane, panes, log, removeBeacon]);

  const handleNewChatMessage = useCallback((isTag: boolean) => {
    log('CHAT_EVENT', `Incoming message (Tagged: ${isTag})`);
    if (!panes.chat || minimizedPanes.chat || activePane !== 'chat') {
      setUnreadChat(prev => (typeof prev === 'number' ? prev : 0) + 1);
    }
  }, [panes.chat, minimizedPanes.chat, activePane, setUnreadChat, log]);

  const injectLog = useCallback((logMsg: string) => {
    window.dispatchEvent(new CustomEvent('INJECT_LOG', { detail: logMsg }));
  }, []);

  const loggedSetStack = useCallback((s: Stack) => {
    log('CORE_CONFIG', `Switching cloud stack to ${s}`);
    setStack(s);
  }, [log, setStack]);

  const loggedSetSeverity = useCallback((s: Severity) => {
    log('THREAT_LEVEL', `Alert level shifted to ${s}`);
    setSeverity(s);
    if (s !== 'NOMINAL') {
        playAlert(s);
    }
  }, [log, playAlert, setSeverity]);

  const loggedSetIsSlowBurn = useCallback((on: boolean) => {
    log('AUTOMATION', `${on ? 'Initiating' : 'Aborting'} slow-burn protocol`);
    setIsSlowBurn(on);
  }, [log, setIsSlowBurn]);

  const loggedHandleDeclare = useCallback(() => {
    log('COMMAND_CENTER', '!!! INCIDENT DECLARED !!!');
    declareIncident(playAlert);
  }, [log, declareIncident, playAlert]);

  const handleLogout = useCallback(() => {
      playLogoutChime();
      setAppState('SHUTDOWN');
  }, [playLogoutChime, setAppState]);

  // 5. Engine Hooks & Complex Logic
  const stopPlaybookRef = useRef<() => void>(() => {});

  const { messages, sendMessage, typingUsers, markAsRead, markAllAsRead } = useIncidentChat(
    severity, 
    stack, 
    operatorName, 
    uplinkId, 
    handleNewChatMessage, 
    playSlackPing, 
    playTagPing, 
    appState === 'READY',
    panes.chat && !minimizedPanes.chat && activePane === 'chat',
    chatMultiplier,
    log
  );

  const loggedCeaseTheatre = useCallback(() => {
    if (isDeclared && mitigationCount === 0) {
        setTerminalHistory(prev => [
            ...prev,
            { text: 'ERROR: RESOLUTION DENIED. NO MITIGATION ACTIONS LOGGED. PERFORM FAILOVER ROUTING [MAP] OR AUTHORIZE OVERRIDES FIRST.', type: 'error' }
        ]);
        return;
    }

    log('COMMAND_CENTER', 'Initiating resolution protocol...');
    setIsResolving(true);
  }, [log, isDeclared, mitigationCount, setIsResolving, setTerminalHistory]);

  const executeCeaseTheatre = useCallback(() => {
    log('COMMAND_CENTER', 'All incidents resolved. System standby.');
    ceaseTheatre();
    stopPlaybookRef.current();
  }, [log, ceaseTheatre]);

  const triggerApprovalAction = useCallback((type?: 'phrase' | 'hold' | 'slider') => {
    const types: ('phrase' | 'hold' | 'slider')[] = ['phrase', 'hold', 'slider'];
    const selectedType = type || types[Math.floor(Math.random() * types.length)];
    
    const stackJargon: Record<Stack, string[]> = {
        'AWS': ['S3_BUCKET', 'EC2_FLEET', 'CLOUDFRONT_EDGE', 'IAM_POLICY', 'VPC_PEERING'],
        'GCP': ['COMPUTE_ENGINE', 'BIGQUERY_NODE', 'GKE_CLUSTER', 'CLOUD_SPANNER', 'ARTIFACT_REGISTRY'],
        'AZURE': ['BLOB_STORAGE', 'APP_SERVICE', 'COSMOS_DB', 'ENTRA_ID_CORE', 'VNET_GATEWAY'],
        'ON-PREM': ['CHASSIS_SLOT_B', 'HYPERVISOR_KVM', 'SAN_CONTROLLER', 'UPS_SECONDARY', 'CORE_SWITCH'],
        'SERVERLESS': ['LAMBDA_EXECUTION', 'COLD_START_THRESHOLD', 'API_GATEWAY', 'EDGE_RUNTIME', 'STEP_FUNCTION'],
        'CLOUDFLARE': ['WORKERS_KV', 'DURABLE_OBJECT', 'WAF_RULESET', 'TUNNEL_END_POINT', 'R2_STORAGE'],
        'HEROKU': ['DYNO_FORMATION', 'BUILDPACK_CACHE', 'POSTGRES_FOLLOWER', 'REDIS_INSTANCE', 'ROUTER_MESH'],
        'HYPER-V': ['VHDX_VOLUME', 'VIRTUAL_SWITCH', 'CHECKPOINT_CHAIN', 'SCVMM_CORE', 'REPLICA_NODE'],
        'VMWARE': ['VCENTER_APPLIANCE', 'ESXI_KERNEL', 'VMOTION_BUFFER', 'VSPHERE_CLUSTER', 'NSX_FIREWALL']
    };

    const jargon = stackJargon[stack] || stackJargon['AWS'];
    const component = jargon[Math.floor(Math.random() * jargon.length)];
    
    const severityPrefix = severity === 'P0' ? 'CATASTROPHIC_FAILURE' : 'CRITICAL_DEGRADATION';
    const actionVerb = severity === 'P0' ? 'FORCE_REBOOT' : 'INITIATE_FAILOVER';

    const phrases = [
        `CONFIRM-${actionVerb}-${component}`,
        `AUTHORIZE-${severityPrefix}-${stack}`,
        `EXECUTE-EMERGENCY-OVERRIDE-${component}`,
        `ISOLATE-AFFECTED-${stack}-NODES`
    ];
    
    const phrase = selectedType === 'phrase' ? phrases[Math.floor(Math.random() * phrases.length)] : undefined;
    
    const messages = [
        `${severityPrefix} DETECTED IN ${component}.`,
        `UNAUTHORIZED ACCESS ATTEMPT DETECTED IN ${stack} GATEWAY.`,
        `${stack} LOAD BALANCER SATURATION EXCEEDED THRESHOLD (98%).`,
        `ZOMBIE PROCESSES CONSUMING 100% OF AVAILABLE ${component} MEMORY.`,
        `ESCALATION: VP OF ENGINEERING REQUESTING SITREP ON ${stack}.`,
        `PR COMMUNICATIONS DEMANDS IMMEDIATE MITIGATION PLAN.`,
        `LEGAL DEPT: POTENTIAL PII EXPOSURE IN ${component}.`,
        `CISO: INITIATE HARD LOCKDOWN ON ${stack} EDGE.`
    ];
    
    setApproval({
        id: Math.random().toString(36).substr(2, 9),
        type: selectedType,
        message: messages[Math.floor(Math.random() * messages.length)],
        phrase
    });
  }, [setApproval, stack, severity]);

  const triggerTerminalOverride = useCallback(() => {
    if (activeOverride) return;

    const code = `OVERRIDE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setOverride({
        code,
        message: 'EMERGENCY_OVERRIDE_SEQUENCE_INITIATED'
    });

    setTerminalHistory(prev => [
        ...prev,
        { text: ' ', type: 'system' },
        { text: '!!! CRITICAL SYSTEM FAILURE: EMERGENCY OVERRIDE REQUIRED !!!', type: 'error' },
        { text: `!!! TYPE THE FOLLOWING CODE EXACTLY: ${code} !!!`, type: 'error' },
        { text: '!!! TIME REMAINING: 20 SECONDS !!!', type: 'error' },
        { text: ' ', type: 'system' }
    ]);

    overrideTimeoutRef.current = setTimeout(() => {
        setOverride(null);
        setMoneyLost(prev => prev + 250000); // Massive $250k penalty
        setTerminalHistory(prev => [
            ...prev,
            { text: 'ERROR: OVERRIDE SEQUENCE TIMED OUT. SEVERE DATA LOSS DETECTED.', type: 'error' }
        ]);
        overrideTimeoutRef.current = null;
    }, 20000);

  }, [activeOverride, setOverride, setTerminalHistory, setMoneyLost]);

  const triggerExecutiveInterrupt = useCallback(() => {
    if (pendingInterruptRef.current) return;

    const executives = [
        { name: getPersonByRole('VP_Eng').name, bio: 'VP_Eng' },
        { name: getPersonByRole('CISO').name, bio: 'CISO' },
        { name: getPersonByRole('CTO').name, bio: 'CTO' },
        { name: getPersonByRole('Legal').name, bio: 'Legal' }
    ];

    const exec = executives[Math.floor(Math.random() * executives.length)];
    interruptPersonaRef.current = exec;
    const tag = operatorName.split(' ')[0] || 'Operator';
    
    const demands = [
        `@${tag} I need a SITREP on the ${stack} outage IMMEDIATELY. Why is the burn rate so high?`,
        `@${tag} The CEO is asking for an ETA on resolution. Drop everything and give me an update in the chat.`,
        `@${tag} PR needs a statement. Confirm you are still on top of this. Now.`,
        `@${tag} Legal is breathing down my neck about the ${stack} breach. Report status at once.`
    ];

    const demand = demands[Math.floor(Math.random() * demands.length)];
    sendMessage(demand, exec.name, undefined, false, exec.bio);
    log('EXECUTIVE_INTERRUPT', `Triggered by ${exec.name}`);

    pendingInterruptRef.current = setTimeout(() => {
        const penalty = 150000; // $150k penalty
        setMoneyLost(prev => prev + penalty);
        
        const angryMessages = [
            `@${tag} YOUR SILENCE IS UNACCEPTABLE. WE JUST LOST $${(penalty/1000).toFixed(0)}K IN MARKET CAP.`,
            `@${tag} DO NOT IGNORE AN EXECUTIVE COMMAND. SLA BREACHED.`,
            `@${tag} I'M ESCALATING THIS TO HR. THE LACK OF COMMUNICATION IS COSTING US DEARLY.`,
            `@${tag} I'M BRINGING IN A THIRD-PARTY CONSULTANT. YOUR ACCESS MAY BE REVOKED.`
        ];
        
        sendMessage(angryMessages[Math.floor(Math.random() * angryMessages.length)], exec.name, undefined, false, exec.bio);
        log('EXECUTIVE_INTERRUPT', 'Penalty applied due to timeout');
        pendingInterruptRef.current = null;
        interruptPersonaRef.current = null;
    }, 30000); // 30 seconds to reply

  }, [operatorName, stack, sendMessage, setMoneyLost, log]);

  const { activePlaybook, startPlaybook, stopPlaybook, resumePlaybook, isWaiting } = usePlaybookEngine({
    sendMessage: (text, user, id, isBot, bio) => sendMessage(text, user, id, isBot, bio),
    injectLog,
    setSeverity,
    setIsChaos,
    addBeacon,
    triggerApproval: triggerApprovalAction,
    triggerOverride: triggerTerminalOverride,
    triggerInterrupt: triggerExecutiveInterrupt,
    setObjective,
    stack,
    operatorName,
    declareIncident: loggedHandleDeclare
  });

  // Resume playbook when interactions are cleared
  useEffect(() => {
    if (activePlaybook && isWaiting) {
        // If there are no blocking modals or pending interrupts, resume
        if (!activeApproval && !activeOverride && !pendingInterruptRef.current) {
            log('SYSTEM', 'All interaction gates cleared. Resuming playbook sequence.');
            resumePlaybook();
        }
    }
  }, [activeApproval, activeOverride, messages.length, activePlaybook, isWaiting, resumePlaybook, log]);

  useEffect(() => {
    stopPlaybookRef.current = stopPlaybook;
  }, [stopPlaybook]);

  // Auto-start Arcade Playbook
  useEffect(() => {
    if (appState === 'READY' && gameMode === 'ARCADE' && selectedPlaybookId && !activePlaybook && !isDeclared) {
        const pb = PLAYBOOKS[selectedPlaybookId];
        if (pb) {
            log('ARCADE_MODE', `Initializing auto-start for scenario: ${pb.name}`);
            startPlaybook(pb);
        }
    }
  }, [appState, gameMode, selectedPlaybookId, activePlaybook, isDeclared, startPlaybook, log]);

  const { commands, handleCommand: registryHandleCommand } = useCommandRegistry({
    gameMode,
    togglePane: loggedTogglePane,
    openPane,
    closePane,
    openAll,
    closeAll,
    setSeverity: loggedSetSeverity,
    setStack: loggedSetStack,
    setAudio: (on) => {
        log('SYSTEM', `Audio ${on ? 'enabled' : 'disabled'}`);
        setIsAudioOn(on);
    },
    setSlowBurn: loggedSetIsSlowBurn,
    setTheme,
    handleEject: loggedHandleDeclare,
    handleCease: loggedCeaseTheatre,
    copyPlaybook: () => {
        if (incidentReport) {
            navigator.clipboard.writeText(incidentReport);
            log('SYSTEM', 'Playbook copied to clipboard');
        }
    },
    setView,
    handleLogout,
    help: (cmds) => {
        const categories: Record<string, string[]> = {};
        cmds.forEach(c => {
            if (!categories[c.category]) categories[c.category] = [];
            const primaryPattern = c.patterns[0].toUpperCase();
            const usage = c.usage ? ` ${c.usage.split(' ').slice(1).join(' ')}` : '';
            categories[c.category].push(`${primaryPattern}${usage.padEnd(15)} - ${c.description}`);
        });

        let manPage = `SMOKESCREEN(1)                     Operator Manual                     SMOKESCREEN(1)\n\n`;
        manPage += `NAME\n\tsmokescreen - Technical Incident Theatre simulation control interface\n\n`;
        manPage += `SYNOPSIS\n\tcommand [arguments...]\n\n`;
        manPage += `DESCRIPTION\n\tsmokescreen provides a high-fidelity terminal interface for simulating catastrophic\n\tsystem failures. It is an immersive incident simulation game designed to test\n\toperator response efficiency and technical composure under pressure.\n\n`;
        manPage += `CATEGORIES\n`;
        manPage += `\tPANES   - Workspace viewport management\n`;
        manPage += `\tTHREAT  - Incident severity escalation (P3 to P0)\n`;
        manPage += `\tSTACK   - Infrastructure provider context (AWS, GCP, etc.)\n`;
        manPage += `\tSYSTEM  - Global environment settings and themes\n`;
        manPage += `\tACTION  - Incident lifecycle and playbook execution\n\n`;

        manPage += `AVAILABLE COMMANDS\n`;
        Object.entries(categories).forEach(([category, commands]) => {
            manPage += `\t${category}\n\t\t${commands.join('\n\t\t')}\n\n`;
        });

        manPage += `EXAMPLES\n`;
        manPage += `\tSet context and escalate:\n\t\t> aws\n\t\t> p0\n\t\t> declare\n\n`;
        manPage += `\tClear workspace and resolve:\n\t\t> clear\n\t\t> resolve\n\n`;

        manPage += `SEE ALSO\n\thowto(1), settings(1)\n\n`;
        manPage += `HISTORY\n\tLast updated: April 2026 | Orchestrator Edition\n`;

        setTerminalHistory(prev => {
            const history = Array.isArray(prev) ? prev : [];
            return [...history, { text: manPage, type: 'output' }];
        });
    },    startPlaybook: (id) => {
        const playbook = PLAYBOOKS[id];
        if (playbook) {
            log('SYSTEM', `Starting playbook ${id}`);
            startPlaybook(playbook);
        } else {
            log('SYSTEM', `Playbook ${id} not found`);
            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: `ERROR: PLAYBOOK [${id}] NOT FOUND`, type: 'error' }];
            });
        }
    },
    setEcoMode: setIsEcoMode,
    triggerApproval: triggerApprovalAction,
    mitigationCount,
    incrementMitigationCount,
    isDeclared,
    generateStrategy
  });

  const handleCommand = useCallback((cmd: string) => {
    log('TERMINAL', `Executing command: ${cmd}`);
    
    // Add command to display history
    setTerminalHistory(prev => {
        const history = Array.isArray(prev) ? prev : [];
        return [...history, { text: cmd, type: 'command' }];
    });

    // Handle Guided Onboarding
    if (onboardingStep > 0) {
        const normalizedCmd = cmd.toLowerCase().trim();
        let nextStep = -1;
        let successMsg = '';
        let nextInstruction = '';
        let isValid = false;

        if (onboardingStep === 1 && normalizedCmd === 'aws') {
            isValid = true;
            nextStep = 2;
            successMsg = '> INFRASTRUCTURE_CONNECTED. SECTOR_7G_AWS_NODE_ONLINE.';
            nextInstruction = '> MISSION 2: Minor degradation detected. TYPE \'p3\' to escalate threat level.';
        } else if (onboardingStep === 2 && normalizedCmd === 'p3') {
            isValid = true;
            nextStep = 3;
            successMsg = '> THREAT_LEVEL_UPDATED [P3].';
            nextInstruction = '> MISSION 3: Protocol requires formal declaration. TYPE \'declare\' to initiate.';
        } else if (onboardingStep === 3 && normalizedCmd === 'declare') {
            isValid = true;
            nextStep = 4;
            successMsg = '> !!! INCIDENT DECLARED !!! SECTOR_STABILIZATION_REQUIRED.';
            nextInstruction = '> MISSION 4: Stabilization sequence complete. TYPE \'resolve\' to close ticket.';
            setIncidentReport('TRAINING_PROTOCOL_INITIATED: SECTOR_7G_STABILIZATION_IN_PROGRESS...');
            openPane('howTo');
        } else if (onboardingStep === 4 && normalizedCmd === 'resolve') {
            isValid = true;
            nextStep = -1;
            successMsg = '> RESOLUTION_PROTOCOL_ACCEPTED. SYSTEM_STABILIZED.';
            nextInstruction = '> CERTIFICATION COMPLETE. FULL SYSTEM ACCESS GRANTED. TYPE \'help\' FOR MANIFEST.';
        }

        if (isValid) {
            registryHandleCommand(normalizedCmd);
            setOnboardingStep(nextStep);
            setTerminalHistory(prev => [
                ...prev,
                { text: successMsg, type: 'output' },
                { text: nextInstruction, type: 'system' }
            ]);
            return true;
        } else {
            const expected = onboardingStep === 1 ? 'aws' : onboardingStep === 2 ? 'p3' : onboardingStep === 3 ? 'declare' : 'resolve';
            setTerminalHistory(prev => [
                ...prev,
                { text: `[TRAINING MODE] INVALID COMMAND. TYPE '${expected}'.`, type: 'error' }
            ]);
            return false;
        }
    }

    // Handle Active Override
    if (activeOverride) {
        if (cmd.toUpperCase() === activeOverride.code.toUpperCase()) {
            if (overrideTimeoutRef.current) clearTimeout(overrideTimeoutRef.current);
            setOverride(null);
            setTerminalHistory(prev => [
                ...prev,
                { text: 'OVERRIDE_SEQUENCE_ACCEPTED. SYSTEMS_RECALIBRATING...', type: 'system' }
            ]);
            incrementMitigationCount();
            playMitigationSuccess();
            overrideTimeoutRef.current = null;
        } else {
            setTerminalHistory(prev => [
                ...prev,
                { text: `ERROR: INVALID_OVERRIDE_CODE. PENALTY_APPLIED. RETRY SEQUENCE.`, type: 'error' }
            ]);
            setMoneyLost(prev => prev + 10000); // $10k typo penalty
        }
        return true;
    }

    // Add to global command history for navigation
    addCommandToHistory(cmd);

    const result = registryHandleCommand(cmd);
    
    if (result.isValid) {
        if (result.message) {
            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: result.message!, type: 'output' }];
            });
        }
        return true;
    } else {
        if (result.message) {
            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: result.message!, type: 'error' }];
            });
        } else {
            const normalizedCmd = cmd.toLowerCase().trim();
            const allPatterns = Array.from(new Set(commands.flatMap(c => c.patterns)));
            
            // Find best suggestion: startsWith first, then includes
            let suggestion = allPatterns.find(p => p.startsWith(normalizedCmd));
            if (!suggestion && normalizedCmd.length >= 2) {
                suggestion = allPatterns.find(p => p.includes(normalizedCmd));
            }

            const errorText = suggestion 
                ? `COMMAND NOT RECOGNIZED. DID YOU MEAN '${suggestion}'? (TYPE 'help' FOR MANIFEST)`
                : `COMMAND NOT RECOGNIZED. (TYPE 'help' FOR MANIFEST)`;

            setTerminalHistory(prev => {
                const history = Array.isArray(prev) ? prev : [];
                return [...history, { text: errorText, type: 'error' }];
            });
        }
        return false;
    }
  }, [log, registryHandleCommand, setTerminalHistory, addCommandToHistory, commands, onboardingStep, setIncidentReport, openPane, setOnboardingStep, activeOverride, setOverride, incrementMitigationCount, playMitigationSuccess, setMoneyLost]);

  // 6. Effects
  useUrlSync({ 
    severity, stack, panes, theme, isEcoMode, isDebugMode, isAudioOn 
  }, (updates) => {
      if (updates.severity) setSeverity(updates.severity);
      if (updates.stack) setStack(updates.stack);
      if (updates.theme) setTheme(updates.theme);
      if (updates.isEcoMode !== undefined) setIsEcoMode(updates.isEcoMode);
      if (updates.isDebugMode !== undefined) setIsDebugMode(updates.isDebugMode);
      if (updates.panes) setPanes(updates.panes);
  });

  useEffect(() => {
    const count = messages.filter(m => !m.read).length;
    if (count !== unreadChat) {
        log('STORE', `Unread chat count: ${count}`);
        setUnreadChat(count);
    }
  }, [messages, unreadChat, setUnreadChat, log]);

  useEffect(() => {
    let interval: number;
    if (incidentReport) {
      // Logic for typing out the report
      let i = 0;
      setDisplayText('');
      interval = window.setInterval(() => {
        setDisplayText(incidentReport.slice(0, i));
        i++;
        if (i > incidentReport.length) clearInterval(interval);
      }, 15);
    }
    return () => clearInterval(interval);
  }, [incidentReport, setDisplayText]);

  // Slowburn Escalation Engine
  useEffect(() => {
    let interval: number;
    if (isSlowBurn && severity !== 'P0') {
      interval = window.setInterval(() => {
        tickSlowBurn(playAlert, declareIncident);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSlowBurn, severity, tickSlowBurn, playAlert, declareIncident]);

  // Executive Interrupt Response Interceptor
  useEffect(() => {
    if (messages.length > 0 && pendingInterruptRef.current && interruptPersonaRef.current) {
        const lastMsg = messages[messages.length - 1];
        // If the last message is from the operator (not a bot/exec)
        if (!lastMsg.isBot && lastMsg.user.toLowerCase().includes(operatorName.split(' ')[0].toLowerCase())) {
            const personaName = interruptPersonaRef.current.name;
            const personaBio = interruptPersonaRef.current.bio;
            clearTimeout(pendingInterruptRef.current);
            pendingInterruptRef.current = null;
            log('EXECUTIVE_INTERRUPT', 'Operator responded. Crisis averted.');
            
            setTimeout(() => {
                const acks = [
                    'Copy that. Keep me posted.',
                    'Acknowledged. Don\'t let it happen again.',
                    'Fine. Just fix it.',
                    'Understood. I\'ll tell the board you\'re on it.'
                ];
                sendMessage(acks[Math.floor(Math.random() * acks.length)], personaName, undefined, false, personaBio);
                interruptPersonaRef.current = null;
            }, 2000);
        }
    }
  }, [messages, operatorName, log, sendMessage]);

  // Periodic high-stakes modal trigger
  useEffect(() => {
    if (isDeclared && severity !== 'NOMINAL' && !activePlaybook) {
        const intervalTime = severity === 'P0' ? 15000 : severity === 'P1' ? 30000 : 45000;

        const interval = window.setInterval(() => {
            const roll = Math.random();
            const threshold = severity === 'P0' ? 0.4 : severity === 'P1' ? 0.7 : 0.85;

            if (roll > threshold && !activeApproval) {
                triggerApprovalAction();
            } else if (roll > threshold - 0.1 && !activeOverride) {
                triggerTerminalOverride();
            } else if (roll > threshold - 0.25 && !pendingInterruptRef.current) {
                triggerExecutiveInterrupt();
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }
  }, [severity, isDeclared, activeApproval, activeOverride, triggerApprovalAction, triggerTerminalOverride, triggerExecutiveInterrupt, activePlaybook]);

  // Burn Rate Auto-Open
  useEffect(() => {
    if (isDeclared && (severity === 'P0' || severity === 'P1')) {
        if (!panes.burn) openPane('burn');
    }
  }, [severity, isDeclared, panes.burn, openPane]);

  // Terminal Boot Guidance
  useEffect(() => {
    if (appState === 'READY' && terminalHistory.length === 0) {
        if (onboardingStep === -1) {
            setTerminalHistory([
                { text: 'SYSTEM INITIALIZED. AWAITING OPERATOR INPUT.', type: 'system' },
                { text: ' ', type: 'system' },
                { text: '> To manually orchestrate an event: Set threat level (e.g. \'p0\') and type \'declare\'.', type: 'system' },
                { text: '> To run an automated simulation: Open Playbooks [F8] or type \'playbook <id>\'.', type: 'system' },
            ]);
        } else if (onboardingStep === 0) {
            setOnboardingStep(1);
            setTerminalHistory([
                { text: 'SYSTEM INITIALIZED. UNVERIFIED_OPERATOR_DETECTED.', type: 'system' },
                { text: ' ', type: 'system' },
                { text: '!!! OPERATOR CERTIFICATION REQUIRED !!!', type: 'error' },
                { text: '> MISSION 1: Connect to primary infrastructure.', type: 'system' },
                { text: '> TYPE \'aws\' AND PRESS ENTER TO BEGIN.', type: 'system' },
            ]);
        }
    }
  }, [appState, terminalHistory.length, setTerminalHistory, onboardingStep, setOnboardingStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const visiblePanes = (Object.keys(panes) as Array<PaneId>)
            .filter(key => panes[key]);

        if (visiblePanes.length > 0) {
            // Close the active pane if it's visible, otherwise the top-most one
            const paneToClose = (activePane && panes[activePane]) 
                ? activePane 
                : visiblePanes.reduce((prev, curr) => zIndices[curr] > zIndices[prev] ? curr : prev);

            closePane(paneToClose);

            const remaining = visiblePanes.filter(p => p !== paneToClose);
            if (remaining.length > 0) {
                const nextActive = remaining.reduce((prev, curr) => 
                    zIndices[curr] > zIndices[prev] ? curr : prev
                );
                bringToFront(nextActive);
            }
            return;
        }

        if (severity !== 'NOMINAL') {
            loggedCeaseTheatre();
        }
        
        const now = Date.now();
        if (now - lastEscTime.current < 500) {
          loggedHandleDeclare();
        }
        lastEscTime.current = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [severity, panes, zIndices, activePane, loggedHandleDeclare, loggedCeaseTheatre, bringToFront, closePane]);

  useEffect(() => {
    const handleManualTrigger = (e: CustomEvent) => {
        const type = e.detail?.type;
        triggerApprovalAction(type);
    };
    window.addEventListener('TRIGGER_APPROVAL', (handleManualTrigger as EventListener));
    return () => window.removeEventListener('TRIGGER_APPROVAL', (handleManualTrigger as EventListener));
  }, [triggerApprovalAction]);

  const easterEggs = useMemo(() => [
    'SEARCHING FOR RED OCTOBER... [NOT FOUND]',
    'DECRYPTING ENIGMA STREAM... [SUCCESS]',
    'LOCATING FLUX CAPACITOR... [OFFLINE]',
  ], []);

  return {
    panes, minimizedPanes, zIndices, poppedOutPanes, snappedMainPanes, activePane, openPane, closePane, togglePane, toggleMinimize, togglePopOut, toggleSnapMain, bringToFront, closeAll, openAll, setPanes,
    appState, setAppState, operatorName, setOperatorName, severity, stack, status, setStatus: (s: string) => log('SYSTEM', s),
    unreadChat, moneyLost, isSlowBurn, slowBurnCountdown, isTransitioning, setIsTransitioning,
    gameMode, setGameMode,
    isChaos, incidentReport, setIncidentReport, terminalHistory, setTerminalHistory,
    displayText, setDisplayText, view, setView, activeObjective,
    selectedPlaybookId, setSelectedPlaybookId,
    easterEggs, activePlaybook, startPlaybook, stopPlaybook, typingUsers, messages, sendMessage,
    isDeclared, uplinkId, systemMetrics,
    theme, setTheme,
    handleLogout,
    clientStats,
    isEcoMode, setIsEcoMode,
    isDebugMode, setIsDebugMode,
    chatMultiplier, setChatMultiplier,
    logMultiplier, setLogMultiplier,
    loggedTogglePane,
    loggedSetStack,
    loggedSetSeverity,
    loggedSetIsSlowBurn,
    loggedCeaseTheatre,
    loggedHandleDeclare,
    handleCommand,
    commands,
    commandHistory,
    markAsRead,
    markAllAsRead,
    playLoginChime,
    playPostBeep,
    playMitigationSuccess,
    stopAllSounds,
    isAudioOn, setIsAudioOn,
    ticketId,
    activeApproval,
    setApproval,
    isResolving,
    setIsResolving,
    mitigationCount,
    lastScoreEarned,
    executeCeaseTheatre,
    onboardingStep, setOnboardingStep
  };
};