import type { Severity } from '../data/incidents';

interface PoolNode {
  osc: OscillatorNode;
  gain: GainNode;
  inUse: boolean;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nodePool: PoolNode[] = [];
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  init(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Initialize Pool: 10 recycled nodes
    for (let i = 0; i < 10; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      osc.connect(gain).connect(this.masterGain);
      osc.start();
      this.nodePool.push({ osc, gain, inUse: false });
    }

    return this.ctx;
  }

  playTone(freq: number, type: OscillatorType, volume: number, duration: number, startTime: number = 0) {
    const ctx = this.init();
    if (!ctx || !this.masterGain) return;

    const node = this.nodePool.find(n => !n.inUse);
    if (!node) return;

    node.inUse = true;
    const now = ctx.currentTime;
    const start = now + startTime;

    node.osc.type = type;
    node.osc.frequency.cancelScheduledValues(now);
    node.osc.frequency.setValueAtTime(freq, start);

    node.gain.gain.cancelScheduledValues(now);
    node.gain.gain.setValueAtTime(0, start);
    node.gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    node.gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    node.gain.gain.setValueAtTime(0, start + duration + 0.01);

    setTimeout(() => {
      node.inUse = false;
    }, (startTime + duration + 0.1) * 1000);
  }

  playAlert(type: Severity) {
    if (type === 'NOMINAL') return;
    const ctx = this.init();
    if (!ctx) return;

    const node = this.nodePool.find(n => !n.inUse);
    if (!node) return;

    node.inUse = true;
    const now = ctx.currentTime;
    const { osc, gain } = node;

    osc.frequency.cancelScheduledValues(now);
    gain.gain.cancelScheduledValues(now);

    if (type === 'P0') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 1);
      setTimeout(() => { node.inUse = false; }, 1100);
    } else if (type === 'P1') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      gain.gain.setValueAtTime(0, now + 0.21);
      setTimeout(() => { node.inUse = false; }, 300);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      gain.gain.setValueAtTime(0, now + 0.11);
      setTimeout(() => { node.inUse = false; }, 200);
    }
  }

  playDegauss() {
    const ctx = this.init();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    
    osc.connect(gain).connect(this.masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  }

  setMasterVolume(target: number, time: number = 0.1) {
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, time);
      if (target === 0) {
        setTimeout(() => {
          if (this.ctx?.state === 'running') this.ctx.suspend();
        }, 200);
      } else {
        this.ctx.resume();
      }
    }
  }

  updateAmbient(isAudioOn: boolean, isLoggedIn: boolean, severity: Severity) {
    if (!isAudioOn || !isLoggedIn) {
      const now = this.ctx?.currentTime || 0;
      if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(0, now, 0.1);
      if (this.noiseGain) this.noiseGain.gain.setTargetAtTime(0, now, 0.1);
      return;
    }

    const ctx = this.init();
    if (!ctx || !this.masterGain) return;

    // Hum
    if (!this.ambientOsc) {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime);
      filter.Q.setValueAtTime(10, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2);
      osc.connect(filter).connect(gain).connect(this.masterGain);
      osc.start();
      this.ambientOsc = osc;
      this.ambientGain = gain;
    }

    // Fan
    if (!this.noiseNode) {
      if (!this.noiseBuffer) {
        const bufferSize = ctx.sampleRate * 2;
        this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      noise.connect(filter).connect(gain).connect(this.masterGain);
      noise.start();
      this.noiseNode = noise;
      this.noiseGain = gain;
    }

    const targetVolume = severity === 'P0' ? 0.05 : 
                         severity === 'P1' ? 0.02 : 
                         severity === 'P3' ? 0.01 : 0.005;

    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.5);
    }
  }

  stopAll() {
    if (this.ctx) {
      this.ctx.suspend();
      const now = this.ctx.currentTime;
      this.nodePool.forEach(node => {
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setValueAtTime(0, now);
        node.inUse = false;
      });
    }
    if (this.ambientOsc) {
      try { this.ambientOsc.stop(); this.ambientOsc.disconnect(); } catch {
        // Suppress expected errors during cleanup
      }
      this.ambientOsc = null;
      this.ambientGain = null;
    }
    if (this.noiseNode) {
      try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch {
        // Suppress expected errors during cleanup
      }
      this.noiseNode = null;
      this.noiseGain = null;
    }
  }
}
