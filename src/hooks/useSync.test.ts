import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSync } from './useSync';

describe('useSync', () => {
    it('should allow subscribing to messages', () => {
        const { result } = renderHook(() => useSync());
        const handler = vi.fn();

        act(() => {
            result.current.subscribe(handler);
        });

        const payload = { type: 'TEST_EVENT', data: { foo: 'bar' } };
        
        act(() => {
            // @ts-expect-error - SyncPayload type might be stricter but for testing we cast
            result.current.send(payload);
        });

        expect(handler).toHaveBeenCalledWith(payload);
    });

    it('should allow unsubscribing from messages', () => {
        const { result } = renderHook(() => useSync());
        const handler = vi.fn();

        let unsubscribe: () => void;
        act(() => {
            unsubscribe = result.current.subscribe(handler);
        });

        act(() => {
            unsubscribe();
        });

        act(() => {
            // @ts-expect-error - testing private internals
            result.current.send({ type: 'TEST_EVENT' });
        });

        expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
        const { result } = renderHook(() => useSync());
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        act(() => {
            result.current.subscribe(handler1);
            result.current.subscribe(handler2);
        });

        act(() => {
            // @ts-expect-error - testing private internals
            result.current.send({ type: 'TEST_EVENT' });
        });

        expect(handler1).toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });
});
