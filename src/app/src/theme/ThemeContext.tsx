import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { darkTheme, lightTheme, Theme, ThemeType } from './theme';
import LocalStorageService from '../services/LocalStorageService';

interface ThemeContextData {
  theme: Theme;
  themeType: ThemeType;
  toggleTheme: () => void;
  setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeType, setThemeTypeState] = useState<ThemeType>('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await LocalStorageService.CarregarTema();
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeTypeState(savedTheme);
      }
      setLoading(false);
    };
    loadTheme();
  }, []);

  const setThemeType = async (type: ThemeType) => {
    setThemeTypeState(type);
    await LocalStorageService.SalvarTema(type);
  };

  const toggleTheme = async () => {
    const newTheme = themeType === 'dark' ? 'light' : 'dark';
    setThemeTypeState(newTheme);
    await LocalStorageService.SalvarTema(newTheme);
  };

  const theme = themeType === 'dark' ? darkTheme : lightTheme;

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme, setThemeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
