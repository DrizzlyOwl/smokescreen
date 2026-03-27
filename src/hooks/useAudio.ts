import { useContext } from 'react';
import { AudioContextInstance } from '../contexts/instances';

export const useAudio = () => {
  const context = useContext(AudioContextInstance);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
