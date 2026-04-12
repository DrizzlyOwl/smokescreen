import { useContext } from 'react';
import { AudioContextInstance } from '../contexts/instances';
import { useAudioStore } from '../store/useAudioStore';

export const useAudio = () => {
  const context = useContext(AudioContextInstance);
  const { isAudioOn, setIsAudioOn } = useAudioStore();
  
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  
  return {
    ...context,
    isAudioOn,
    setIsAudioOn
  };
};
