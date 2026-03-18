import { createContext, useContext } from 'react';

export const CelebrationContext = createContext({
  showCelebration: false,
  setShowCelebration: (_: boolean) => {},
});

export const useCelebration = () => useContext(CelebrationContext);
