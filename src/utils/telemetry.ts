import type { Severity } from '../data/incidents';

export const getBurnRate = (severity: Severity): number => {
    switch (severity) {
        case 'NOMINAL': return 0;
        case 'P3': return 0.08;
        case 'P1': return 0.83;
        case 'P0': return 8.33;
    }
};

export const formatTime = (date: Date = new Date()): string => {
    return date.toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' });
};

export const formatTimeWithSeconds = (date: Date = new Date()): string => {
    return date.toLocaleTimeString('en-GB', { hour12: false, fractionalSecondDigits: 3 });
};

export const getRandomItem = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};
