import type { Severity } from '../incidents';
import type { ChatMessage, Objective } from '../../contexts/types';

export interface ScenarioEvent {
  offsetMs: number;
  type: 'CHAT' | 'LOG' | 'SEVERITY' | 'CHAOS' | 'METRIC' | 'BEACON' | 'APPROVAL' | 'OVERRIDE' | 'INTERRUPT' | 'OBJECTIVE' | 'WAIT';
  payload: Omit<ChatMessage, 'time'> | string | Severity | boolean | MetricPayload | Objective | null;
}

export interface MetricPayload {
  name: string;
  value: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  events: ScenarioEvent[];
  runbookText?: string;
}
