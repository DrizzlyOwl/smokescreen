import type { Severity } from '../incidents';
import type { ChatMessage, Objective } from '../../contexts/types';

export interface PlaybookEvent {
  offsetMs: number;
  type: 'CHAT' | 'LOG' | 'SEVERITY' | 'CHAOS' | 'METRIC' | 'BEACON' | 'APPROVAL' | 'OVERRIDE' | 'INTERRUPT' | 'OBJECTIVE' | 'WAIT';
  payload: Omit<ChatMessage, 'time'> | string | Severity | boolean | MetricPayload | Objective | null;
}

export interface MetricPayload {
  name: string;
  value: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface PlaybookChatEvent extends PlaybookEvent {
  type: 'CHAT';
  payload: Omit<ChatMessage, 'time'>; // Time is generated dynamically
}

export interface PlaybookLogEvent extends PlaybookEvent {
  type: 'LOG';
  payload: string;
}

export interface PlaybookSeverityEvent extends PlaybookEvent {
  type: 'SEVERITY';
  payload: Severity;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  difficulty: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  events: PlaybookEvent[];
  runbookText?: string;
}
