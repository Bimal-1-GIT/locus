import { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext();

export const MODES = {
  INDIGO: 'indigo', // Buyers/Sellers
  SAGE: 'sage',     // Renters/Landlords
};

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('auraEstate_mode');
    return saved || MODES.SAGE;
  });

  useEffect(() => {
    localStorage.setItem('auraEstate_mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === MODES.INDIGO ? MODES.SAGE : MODES.INDIGO);
  };

  const isIndigo = mode === MODES.INDIGO;
  const isSage = mode === MODES.SAGE;

  // Dynamic color classes based on mode
  const colors = {
    primary: isIndigo ? 'indigo' : 'sage',
    primaryBg: isIndigo ? 'bg-indigo-600' : 'bg-sage-400',
    primaryBgHover: isIndigo ? 'hover:bg-indigo-700' : 'hover:bg-sage-500',
    primaryBgLight: isIndigo ? 'bg-indigo-50' : 'bg-sage-50',
    primaryText: isIndigo ? 'text-indigo-600' : 'text-sage-500',
    primaryTextHover: isIndigo ? 'hover:text-indigo-700' : 'hover:text-sage-600',
    primaryBorder: isIndigo ? 'border-indigo-600' : 'border-sage-400',
    primaryRing: isIndigo ? 'ring-indigo-500' : 'ring-sage-400',
    gradient: isIndigo ? 'aura-gradient-indigo' : 'aura-gradient-sage',
  };

  return (
    <ModeContext.Provider value={{ 
      mode, 
      setMode, 
      toggleMode, 
      isIndigo, 
      isSage, 
      colors,
      MODES 
    }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
