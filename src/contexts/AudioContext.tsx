import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AudioContextInstance } from './instances';
import type { Severity } from '../data/excuses';

interface ExtendedWindow extends Window {
    webkitAudioContext?: typeof AudioContext;
}

export function AudioProvider({ children, isLoggedIn, severity }: { children: React.ReactNode, isLoggedIn: boolean, severity: Severity }) {
  const [isAudioOn, setIsAudioOn] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientNode = useRef<GainNode | null>(null);
  const ambientOsc = useRef<OscillatorNode | null>(null);
  const noiseNode = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainNode = useRef<GainNode | null>(null);
  const masterGain = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      const AudioContextClass = window.AudioContext || (window as ExtendedWindow).webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx.current = new AudioContextClass();
      
      masterGain.current = audioCtx.current.createGain();
      masterGain.current.gain.setValueAtTime(1, audioCtx.current.currentTime);
      masterGain.current.connect(audioCtx.current.destination);
    } else if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
    return audioCtx.current;
  }, []);

  const stopAllSounds = useCallback(() => {
    if (audioCtx.current) {
        audioCtx.current.suspend();
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

    const now = ctx.currentTime;
    const start = now + startTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    
    osc.connect(gain).connect(masterGain.current);
    osc.start(start);
    osc.stop(start + duration);
    
    setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
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
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (type === 'P0') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 1);
      osc.start(now);
      osc.stop(now + 1);
    } else if (type === 'P1') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
    
    osc.connect(gain).connect(masterGain.current);
    setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
    }, 1100);
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
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
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

    // Dynamic fan volume based on severity
    // NOMINAL: 0.005, P3: 0.01, P1: 0.02, P0: 0.05
    const targetVolume = severity === 'P0' ? 0.05 : 
                         severity === 'P1' ? 0.02 : 
                         severity === 'P3' ? 0.01 : 0.005;

    if (noiseGainNode.current) {
        noiseGainNode.current.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.5);
    }

    return () => {
        // Only stop if explicitly told or logged out via useEffect trigger
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
