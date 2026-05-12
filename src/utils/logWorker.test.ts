/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSetInterval = vi.fn((_cb: any, _delay: any) => 123);
const mockClearInterval = vi.fn((_id: any) => {});

vi.stubGlobal('setInterval', mockSetInterval);
vi.stubGlobal('clearInterval', mockClearInterval);

const selfMock: any = {
    onmessage: null,
    postMessage: vi.fn((_msg: any) => {}),
    setInterval: mockSetInterval,
    clearInterval: mockClearInterval
};

vi.stubGlobal('self', selfMock);

// Import the worker once
await import('./logWorker.ts');

describe('logWorker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize the worker correctly', () => {
        expect(self.onmessage).toBeDefined();
    });

    it('should set up an interval on START message', () => {
        const event = new MessageEvent('message', {
            data: { type: 'START', severity: 'NOMINAL' }
        });
        
        self.onmessage!(event);

        expect(mockSetInterval).toHaveBeenCalled();
        const callArgs = mockSetInterval.mock.calls[0];
        expect(callArgs[1]).toBe(2500); // baseDelay for NOMINAL
    });

    it('should clear interval on STOP message', () => {
        // Start
        self.onmessage!(new MessageEvent('message', { data: { type: 'START', severity: 'NOMINAL' } }));
        
        // Stop
        self.onmessage!(new MessageEvent('message', { data: { type: 'STOP' } }));
        
        expect(mockClearInterval).toHaveBeenCalledWith(123);
    });

    it('should post logs based on severity', () => {
        self.onmessage!(new MessageEvent('message', { data: { type: 'START', severity: 'P0' } }));
        
        const callback = mockSetInterval.mock.calls[0][0];
        callback();

        expect(self.postMessage).toHaveBeenCalled();
        const postedData = (self.postMessage as any).mock.calls[0][0];
        expect(postedData.type).toBe('LOG');
    });

    it('should send appropriate spikes based on log content', () => {
        self.onmessage!(new MessageEvent('message', { data: { type: 'START', severity: 'P0' } }));
        
        const callback = mockSetInterval.mock.calls[0][0];
        
        const originalRandom = Math.random;
        Math.random = () => 0; 
        
        callback();
        
        const postedData = (self.postMessage as any).mock.calls[0][0];
        if (postedData.log.includes('FATAL') || postedData.log.includes('CPU') || postedData.log.includes('HARD LOCKUP')) {
            expect(postedData.spike).toBeDefined();
            expect(postedData.spike.metric).toBe('cpu');
        }

        Math.random = originalRandom;
    });
});
