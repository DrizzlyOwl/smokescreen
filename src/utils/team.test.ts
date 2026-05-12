import { describe, it, expect } from 'vitest';
import { 
    getPersonByRole, 
    getStackBot, 
    getRandomExecutive, 
    COMPANY_TEAM, 
    BOT_FLEET 
} from './team';
import type { Stack } from '../data/incidents';

describe('team utility', () => {
    describe('getPersonByRole', () => {
        it('should return a human persona if the role matches exactly', () => {
            const ciso = getPersonByRole('CISO');
            expect(ciso.role).toBe('CISO');
            expect(ciso.isBot).toBe(false);
            expect(COMPANY_TEAM).toContainEqual(ciso);
        });

        it('should find a human persona case-insensitively', () => {
            const vp = getPersonByRole('vp_eng');
            expect(vp.role).toBe('VP_Eng');
        });

        it('should return a bot if the name or role matches exactly', () => {
            const pagerDuty = getPersonByRole('PagerDuty');
            expect(pagerDuty.name).toBe('PagerDuty');
            expect(pagerDuty.isBot).toBe(true);
            expect(BOT_FLEET).toContainEqual(pagerDuty);

            const opsGenie = getPersonByRole('INCIDENT_ROUTING');
            expect(opsGenie.name).toBe('OpsGenie');
            expect(opsGenie.isBot).toBe(true);
        });

        it('should return a fallback for known system roles', () => {
            const coreOS = getPersonByRole('CORE_OS');
            expect(coreOS.role).toBe('CORE_OS');
            expect(coreOS.name).toBe('CORE_OS');
            expect(coreOS.isBot).toBe(true);

            const k8sAdmin = getPersonByRole('K8S_ADMIN');
            expect(k8sAdmin.role).toBe('K8S_ADMIN');
            expect(k8sAdmin.isBot).toBe(false);
        });

        it('should return a generic staff fallback for unknown roles', () => {
            const unknown = getPersonByRole('SOME_UNKNOWN_ROLE');
            expect(unknown.bio).toBe('General engineering and technical support.');
            expect(unknown.isBot).toBe(false);
            expect(unknown.role).toBe(COMPANY_TEAM[0].role);
        });
    });

    describe('getStackBot', () => {
        it('should return the current bot if it matches the stack', () => {
            const bot = getStackBot('AWS', 'CloudWatch');
            expect(bot.name).toBe('CloudWatch');
            expect(bot.bio).toBe(BOT_FLEET.find(b => b.name === 'CloudWatch')?.bio);
        });

        it('should return the current bot if it has no specific stacks (generic)', () => {
            const bot = getStackBot('GCP', 'PagerDuty');
            expect(bot.name).toBe('PagerDuty');
        });

        it('should return a bot that matches the stack if the current one does not', () => {
            // Azure Monitor doesn't match AWS
            const bot = getStackBot('AWS', 'Azure Monitor');
            // Expected to pick a bot that matches AWS, which is CloudWatch
            expect(bot.name).toBe('CloudWatch');
        });

        it('should return a generic bot if no stack matches and current bot is wrong', () => {
            // CloudWatch is AWS-specific. If we query a stack like HEROKU (which has Logplex)
            // but we want a generic fallback if we can't find a match? 
            // Actually getStackBot tries to find a betterBot with matching stack, then generic.
            const bot = getStackBot('UNKNOWN_STACK' as Stack, 'CloudWatch');
            expect(bot.name).toBe('PagerDuty'); // First generic bot in the list
        });
    });

    describe('getRandomExecutive', () => {
        it('should return a random executive persona', () => {
            const exec = getRandomExecutive();
            const execRoles = ['VP_Eng', 'CISO', 'CTO', 'Legal'];
            expect(execRoles).toContain(exec.role);
            expect(exec.isBot).toBe(false);
        });
    });
});
