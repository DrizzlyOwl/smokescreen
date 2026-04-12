import { create } from 'zustand';

interface AudioStore {
  isAudioOn: boolean;
  setIsAudioOn: (val: boolean) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  isAudioOn: new URLSearchParams(window.location.search).get('audio') === 'true' || false,
  setIsAudioOn: (isAudioOn) => set({ isAudioOn }),
}));
