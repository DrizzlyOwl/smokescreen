import React, { useRef, useCallback, useEffect } from 'react';
import { AudioContextInstance } from './instances';
import { useAudioStore } from '../store/useAudioStore';
import { AudioEngine } from '../utils/AudioEngine';
import type { Severity } from '../data/incidents';

export function AudioProvider({ 
  children, 
  isLoggedIn, 
  severity, 
  isPaused 
}: { 
  children: React.ReactNode, 
  isLoggedIn: boolean, 
  severity: Severity, 
  isPaused: boolean 
}) {
  const isAudioOn = useAudioStore(state => state.isAudioOn);
  const setIsAudioOn = useAudioStore(state => state.setIsAudioOn);
  
  const engine = useRef<AudioEngine>(new AudioEngine());

  const initAudio = useCallback(() => {
    return engine.current.init();
  }, []);

  const stopAllSounds = useCallback(() => {
    engine.current.stopAll();
  }, []);

  const playSimplePing = useCallback(() => {
    if (!isAudioOn) return;
    engine.current.playTone(800, 'sine', 0.1, 0.1, 0);
    engine.current.playTone(600, 'sine', 0.1, 0.1, 0.05);
  }, [isAudioOn]);

  const playSequencePing = useCallback(() => {
    if (!isAudioOn) return;
    const notes = [659.25, 783.99, 880.0, 1046.5];
    notes.forEach((freq, i) => {
      engine.current.playTone(freq, 'sine', 0.05, 0.15, i * 0.08);
    });
  }, [isAudioOn]);

  const playDirectPing = useCallback(() => {
    if (!isAudioOn) return;
    engine.current.playTone(1200, 'sine', 0.15, 0.1, 0);
    engine.current.playTone(1200, 'sine', 0.15, 0.1, 0.08);
  }, [isAudioOn]);

  const playAlert = useCallback((type: Severity) => {
    if (!isAudioOn) return;
    engine.current.playAlert(type);
  }, [isAudioOn]);

  const playDegauss = useCallback(() => {
    if (!isAudioOn) return;
    engine.current.playDegauss();
  }, [isAudioOn]);

  const playLoginChime = useCallback(() => {
    if (!isAudioOn) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
      engine.current.playTone(freq, 'sine', 0.05, 0.3, i * 0.1);
    });
  }, [isAudioOn]);

  const playLogoutChime = useCallback(() => {
    if (!isAudioOn) return;
    const notes = [783.99, 659.25, 523.25]; 
    notes.forEach((freq, i) => {
      engine.current.playTone(freq, 'sine', 0.05, 0.6, i * 0.15);
    });
  }, [isAudioOn]);

  const playPostBeep = useCallback(() => {
    if (!isAudioOn) return;
    engine.current.playTone(800, 'square', 0.05, 0.15, 0);
  }, [isAudioOn]);

  const playMitigationSuccess = useCallback(() => {
    if (!isAudioOn) return;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, i) => {
      engine.current.playTone(freq, 'sine', 0.05, 0.4, i * 0.08);
    });
  }, [isAudioOn]);

  // Handle Master Volume (Pause/Mute)
  useEffect(() => {
    const volume = (isAudioOn && !isPaused) ? 1 : 0;
    engine.current.setMasterVolume(volume);
  }, [isAudioOn, isPaused]);

  // Handle Ambient Hum & Fan
  useEffect(() => {
    engine.current.updateAmbient(isAudioOn, isLoggedIn, severity);
    
    if (!isAudioOn || !isLoggedIn) {
      const timer = setTimeout(() => {
        if (!isAudioOn || !isLoggedIn) {
          engine.current.stopAll();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAudioOn, isLoggedIn, severity]);

  return (
    <AudioContextInstance.Provider value={{
      isAudioOn,
      setIsAudioOn,
      initAudio,
      playSimplePing,
      playSequencePing,
      playDirectPing,
      playAlert,
      playDegauss,
      playLoginChime,
      playLogoutChime,
      playPostBeep,
      playMitigationSuccess,
      stopAllSounds
    }}>
      {children}
    </AudioContextInstance.Provider>
  );
}
export default AudioProvider;
