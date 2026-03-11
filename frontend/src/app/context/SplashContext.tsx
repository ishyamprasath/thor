import { createContext, useContext, useState, ReactNode } from 'react';

interface SplashContextType {
  hasSeenSplash: boolean;
  setHasSeenSplash: (seen: boolean) => void;
  showSplash: () => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

export function SplashProvider({ children }: { children: ReactNode }) {
  const [hasSeenSplash, setHasSeenSplash] = useState(() => {
    // Check if this is a hot restart or first time
    const sessionStart = sessionStorage.getItem('sessionStart');
    const now = Date.now();
    
    if (!sessionStart) {
      // First time in this session
      sessionStorage.setItem('sessionStart', now.toString());
      return false;
    }
    
    // Check if it's been less than 5 seconds since last session start (hot restart)
    const timeDiff = now - parseInt(sessionStart);
    if (timeDiff < 5000) {
      return false; // Show splash for hot restart
    }
    
    // Update session start time
    sessionStorage.setItem('sessionStart', now.toString());
    return true;
  });

  const showSplash = () => {
    setHasSeenSplash(false);
    sessionStorage.removeItem('sessionStart');
  };

  return (
    <SplashContext.Provider value={{ hasSeenSplash, setHasSeenSplash, showSplash }}>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}
