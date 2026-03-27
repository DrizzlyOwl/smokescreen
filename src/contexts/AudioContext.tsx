import React, { useRef, useCallback, useEffect, useState } from 'react';
import { AudioContextInstance } from './instances';
import type { Severity } from '../data/excuses';

interface ExtendedWindow extends Window {
    webkitAudioContext?: typeof AudioContext;
}

export function AudioProvider({ children, isLoggedIn }: { children: React.ReactNode, isLoggedIn: boolean }) {
  const [isAudioOn, setIsAudioOn] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientNode = useRef<GainNode | null>(null);
  const ambientOsc = useRef<OscillatorNode | null>(null);
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
  }, []);

  const playSlackPing = useCallback(() => {
    if (!isAudioOn) return;
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;
    const now = ctx.currentTime;
    const playPulse = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.connect(gain).connect(masterGain.current!);
      osc.start(time);
      osc.stop(time + 0.1);
    };
    playPulse(now, 800);
    playPulse(now + 0.05, 600);
  }, [initAudio, isAudioOn]);

  const playTeamsPing = useCallback(() => {
    if (!isAudioOn) return;
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;
    const now = ctx.currentTime;
    const notes = [659.25, 783.99, 880.0, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.08 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
      osc.connect(gain).connect(masterGain.current!);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.15);
    });
  }, [initAudio, isAudioOn]);

  const playTagPing = useCallback(() => {
    if (!isAudioOn) return;
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;
    const now = ctx.currentTime;
    const playPulse = (time: number, freq: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.15, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.connect(gain).connect(masterGain.current!);
      osc.start(time);
      osc.stop(time + 0.1);
    };
    playPulse(now, 1200);
    playPulse(now + 0.08, 1200);
  }, [initAudio, isAudioOn]);

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
    } else if (type === 'P1') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }
    osc.connect(gain).connect(masterGain.current!);
    osc.start();
    osc.stop(now + (type === 'P0' ? 1 : 0.2));
  }, [initAudio, isAudioOn]);

  const playLoginChime = useCallback(() => {
    if (!isAudioOn) return;
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.connect(gain).connect(masterGain.current!);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }, [initAudio, isAudioOn]);

  const playLogoutChime = useCallback(() => {
    if (!isAudioOn) return;
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;
    const now = ctx.currentTime;
    const notes = [783.99, 659.25, 523.25]; 
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      if (i === notes.length - 1) {
        osc.frequency.exponentialRampToValueAtTime(100, now + i * 0.15 + 0.5);
      }
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.15 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.6);
      osc.connect(gain).connect(masterGain.current!);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.6);
    });
  }, [initAudio, isAudioOn]);

  const playPostBeep = useCallback(() => {
    if (!isAudioOn) return;
    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(masterGain.current!);
    osc.start(now);
    osc.stop(now + 0.15);
  }, [initAudio, isAudioOn]);

  // Ambient Hum logic
  useEffect(() => {
    if (!isAudioOn || !isLoggedIn) {
      if (ambientNode.current) {
        ambientNode.current.gain.setTargetAtTime(0, audioCtx.current?.currentTime || 0, 0.1);
      }
      if (ambientOsc.current) {
          const oscToStop = ambientOsc.current;
          setTimeout(() => {
              if (oscToStop && (!isAudioOn || !isLoggedIn)) {
                  try {
                    oscToStop.stop();
                    oscToStop.disconnect();
                  } catch { /* already stopped */ }
                  if (ambientOsc.current === oscToStop) ambientOsc.current = null;
              }
          }, 200);
      }
      return;
    }

    const ctx = initAudio();
    if (!ctx || !masterGain.current) return;

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

    ambientNode.current = gain;
    ambientOsc.current = osc;

    const clickInterval = setInterval(() => {
      if (!isAudioOn || !isLoggedIn) return;
      if (Math.random() > 0.7) {
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(Math.random() * 1000 + 2000, ctx.currentTime);
        clickGain.gain.setValueAtTime(0.005, ctx.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        clickOsc.connect(clickGain).connect(masterGain.current!);
        clickOsc.start();
        clickOsc.stop(ctx.currentTime + 0.05);
      }
    }, 500);

    return () => {
      clearInterval(clickInterval);
      if (osc) {
          try {
            osc.stop();
            osc.disconnect();
          } catch { /* already stopped */ }
      }
    };
  }, [isAudioOn, isLoggedIn, initAudio]);

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
