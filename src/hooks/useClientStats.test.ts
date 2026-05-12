/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClientStats } from './useClientStats';

describe('useClientStats', () => {
    beforeEach(() => {
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
            return setTimeout(() => cb(performance.now()), 16);
        });
        vi.stubGlobal('cancelAnimationFrame', (id: number) => {
            clearTimeout(id);
        });

        // Mock WebGL for GPU detection
        const mockGL = {
            getExtension: vi.fn().mockReturnValue({ UNMASKED_RENDERER_WEBGL: 0x9245 }),
            getParameter: vi.fn().mockReturnValue('Mock GPU')
        };
        
        // Use a spy that only intercepts 'canvas'
        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            const el = HTMLDocument.prototype.createElement.call(document, tagName);
            if (tagName === 'canvas') {
                (el as any).getContext = vi.fn().mockReturnValue(mockGL);
            }
            return el;
        });
    });

    it('should initialize with default stats', () => {
        const { result } = renderHook(() => useClientStats());
        expect(result.current.gpu).toBeDefined();
        expect(result.current.timezone).toBeDefined();
        expect(result.current.fps).toBe(60);
    });

    it('should collect network information if available', async () => {
        const mockConnection = {
            type: 'wifi',
            downlink: 10,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        };
        vi.stubGlobal('navigator', {
            ...navigator,
            connection: mockConnection
        });

        const { result } = renderHook(() => useClientStats());
        
        expect(result.current.connectionType).toBe('WIFI');
        expect(result.current.downlink).toBe(10);
    });

    it('should collect battery information if available', async () => {
        const mockBattery = {
            level: 0.85,
            charging: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        };
        vi.stubGlobal('navigator', {
            ...navigator,
            getBattery: vi.fn().mockResolvedValue(mockBattery)
        });

        const { result } = renderHook(() => useClientStats());
        
        // Battery is async, so we need to wait for it
        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.batteryLevel).toBe(85);
        expect(result.current.isCharging).toBe(true);
    });

    it('should update FPS over time', async () => {
        vi.useFakeTimers();
        const { result } = renderHook(() => useClientStats());

        // Simulate some frames
        await act(async () => {
            vi.advanceTimersByTime(1100);
        });

        expect(result.current.fps).toBeGreaterThan(0);
        vi.useRealTimers();
    });
});
