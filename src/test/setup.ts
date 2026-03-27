import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock BroadcastChannel
class BroadcastChannelMock {
  onmessage: ((ev: MessageEvent) => void) | null = null;
  postMessage() {
    // Basic mock
  }
  close() {}
}

vi.stubGlobal('BroadcastChannel', BroadcastChannelMock);

// Mock AudioContext
class AudioContextMock {
  state = 'suspended';
  currentTime = 0;
  resume() { this.state = 'running'; return Promise.resolve(); }
  suspend() { this.state = 'suspended'; return Promise.resolve(); }
  createGain() { return { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn() }, connect: vi.fn() }; }
  createOscillator() { return { type: '', frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn(), disconnect: vi.fn() }; }
  createBiquadFilter() { return { type: '', frequency: { setValueAtTime: vi.fn() }, Q: { setValueAtTime: vi.fn() }, connect: vi.fn() }; }
  destination = {};
}

vi.stubGlobal('AudioContext', AudioContextMock);

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    length: 0,
    key: () => null,
  };
})();

vi.stubGlobal('localStorage', localStorageMock);
