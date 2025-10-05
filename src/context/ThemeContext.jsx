// File: src/ThemeContext.jsx
// New file for theme management (dark/light theme)

import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default to dark

  useEffect(() => {
    // Apply theme to body
    document.body.className = theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;