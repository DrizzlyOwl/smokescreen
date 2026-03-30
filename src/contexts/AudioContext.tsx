import React, { useRef, useCallback, useEffect } from 'react';
import { AudioContextInstance } from './instances';
import { useTerminal } from '../hooks/useTerminal';
import type { Severity } from '../data/incidents';

interface ExtendedWindow extends Window {
    webkitAudioContext?: typeof AudioContext;
}

interface PoolNode {
  osc: OscillatorNode;
  gain: GainNode;
  inUse: boolean;
}

export function AudioProvider({ children, isLoggedIn, severity }: { children: React.ReactNode, isLoggedIn: boolean, severity: Severity }) {
  const { isAudioOn, setIsAudioOn } = useTerminal();
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientNode = useRef<GainNode | null>(null);
  const ambientOsc = useRef<OscillatorNode | null>(null);
  const noiseNode = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainNode = useRef<GainNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const nodePool = useRef<PoolNode[]>([]);
  const cachedNoiseBuffer = useRef<AudioBuffer | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      const AudioContextClass = window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx.current = new AudioContextClass();
      
      masterGain.current = audioCtx.current.createGain();
      masterGain.current.gain.setValueAtTime(1, audioCtx.current.currentTime);
      masterGain.current.connect(audioCtx.current.destination);

      // Initialize Pool: 10 recycled nodes
      for (let i = 0; i < 10; i++) {
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        gain.gain.setValueAtTime(0, audioCtx.current.currentTime);
        osc.connect(gain).connect(masterGain.current);
        osc.start();
        nodePool.current.push({ osc, gain, inUse: false });
      }
    } else if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
    return audioCtx.current;
  }, []);

  const stopAllSounds = useCallback(() => {
    if (audioCtx.current) {
        audioCtx.current.suspend();
        const now = audioCtx.current.currentTime;
        nodePool.current.forEach(node => {
            node.gain.gain.cancelScheduledValues(now);
            node.gain.gain.setValueAtTime(0, now);
            node.inUse = false;
        });
    }
    if (ambientOsc.current) {
        try {
            ambientOsc.current.stop();
            ambientOsc.current.disconnect();
        } catch { /* already stopped */ }
        ambientOsc.current = null;
    }
    if (noiseNode.current) {
        try {
            noiseNode.current.stop();
            noiseNode.current.disconnect();
        } catch { /* already stopped */ }
        noiseNode.current = null;
    }
  }, []);

  const playTone = useCallback((freq: number, type: OscillatorType, volume: number, duration: number, startTime: number = 0) => {
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;

    // Find free node in pool
    const node = nodePool.current.find(n => !n.inUse);
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
  }, [initAudio]);

  const playSlackPing = useCallback(() => {
    if (!isAudioOn) return;
    playTone(800, 'sine', 0.1, 0.1, 0);
    playTone(600, 'sine', 0.1, 0.1, 0.05);
  }, [isAudioOn, playTone]);

  const playTeamsPing = useCallback(() => {
    if (!isAudioOn) return;
    const notes = [659.25, 783.99, 880.0, 1046.5];
    notes.forEach((freq, i) => {
      playTone(freq, 'sine', 0.05, 0.15, i * 0.08);
    });
  }, [isAudioOn, playTone]);

  const playTagPing = useCallback(() => {
    if (!isAudioOn) return;
    playTone(1200, 'sine', 0.15, 0.1, 0);
    playTone(1200, 'sine', 0.15, 0.1, 0.08);
  }, [isAudioOn, playTone]);

  const playAlert = useCallback((type: Severity) => {
    if (type === 'NOMINAL' || !isAudioOn) return;
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;
    
    const node = nodePool.current.find(n => !n.inUse);
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
      
      setTimeout(() => {
        node.inUse = false;
      }, 1100);
    } else if (type === 'P1') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      gain.gain.setValueAtTime(0, now + 0.21);
      
      setTimeout(() => {
        node.inUse = false;
      }, 300);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      gain.gain.setValueAtTime(0, now + 0.11);
      
      setTimeout(() => {
        node.inUse = false;
      }, 200);
    }
  }, [initAudio, isAudioOn]);

  const playLoginChime = useCallback(() => {
    if (!isAudioOn) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
      playTone(freq, 'sine', 0.05, 0.3, i * 0.1);
    });
  }, [isAudioOn, playTone]);

  const playLogoutChime = useCallback(() => {
    if (!isAudioOn) return;
    const notes = [783.99, 659.25, 523.25]; 
    notes.forEach((freq, i) => {
      playTone(freq, 'sine', 0.05, 0.6, i * 0.15);
    });
  }, [isAudioOn, playTone]);

  const playPostBeep = useCallback(() => {
    if (!isAudioOn) return;
    playTone(800, 'square', 0.05, 0.15, 0);
  }, [isAudioOn, playTone]);

  useEffect(() => {
    if (audioCtx.current && masterGain.current) {
        if (isAudioOn) {
            audioCtx.current.resume();
            masterGain.current.gain.setTargetAtTime(1, audioCtx.current.currentTime, 0.1);
        } else {
            masterGain.current.gain.setTargetAtTime(0, audioCtx.current.currentTime, 0.1);
            const timer = setTimeout(() => {
                if (audioCtx.current?.state === 'running' && !isAudioOn) {
                    audioCtx.current.suspend();
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }
  }, [isAudioOn]);

  // Ambient Hum & Fan Logic
  useEffect(() => {
    if (!isAudioOn || !isLoggedIn) {
      if (ambientNode.current) ambientNode.current.gain.setTargetAtTime(0, audioCtx.current?.currentTime || 0, 0.1);
      if (noiseGainNode.current) noiseGainNode.current.gain.setTargetAtTime(0, audioCtx.current?.currentTime || 0, 0.1);
      
      const timer = setTimeout(() => {
          if (!isAudioOn || !isLoggedIn) {
            stopAllSounds();
          }
      }, 500);
      return () => clearTimeout(timer);
    }

    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;

    // Initialize Hum
    if (!ambientOsc.current) {
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

        osc.connect(filter).connect(gain).connect(masterGain.current);
        osc.start();
        ambientOsc.current = osc;
        ambientNode.current = gain;
    }

    // Initialize Fan (White Noise)
    if (!noiseNode.current) {
        if (!cachedNoiseBuffer.current) {
            const bufferSize = ctx.sampleRate * 2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            cachedNoiseBuffer.current = noiseBuffer;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = cachedNoiseBuffer.current;
        noise.loop = true;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(500, ctx.currentTime);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, ctx.currentTime);
        
        noise.connect(noiseFilter).connect(noiseGain).connect(masterGain.current);
        noise.start();
        
        noiseNode.current = noise;
        noiseGainNode.current = noiseGain;
    }

    const targetVolume = severity === 'P0' ? 0.05 : 
                         severity === 'P1' ? 0.02 : 
                         severity === 'P3' ? 0.01 : 0.005;

    if (noiseGainNode.current) {
        noiseGainNode.current.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.5);
    }

    return () => {
    };
  }, [isAudioOn, isLoggedIn, severity, initAudio, stopAllSounds]);

  return (
    <AudioContextInstance.Provider value={{
      isAudioOn,
      setIsAudioOn,
      initAudio,
      playSlackPing,
      playTeamsPing,
      playTagPing,
      playAlert,
      playLoginChime,
      playLogoutChime,
      playPostBeep,
      stopAllSounds
    }}>
      {children}
    </AudioContextInstance.Provider>
  );
}
export default AudioProvider;
