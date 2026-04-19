import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  buttonTextColor: string;
  textColor: string;
  backgroundColor: string;
  navBackgroundColor: string;
  navTextColor: string;
  announcements: string[];
  showAnnouncementBar: boolean;
  heroTitle: string;
  heroSubtitle: string;
  fontFamily: string;
}

const defaultTheme: ThemeConfig = {
  primaryColor: '#CE9F43',
  secondaryColor: '#303030',
  buttonColor: '#303030',
  buttonTextColor: '#ffffff',
  textColor: '#303030',
  backgroundColor: '#FBF9F4',
  navBackgroundColor: '#ffffff',
  navTextColor: '#303030',
  announcements: ['Free shipping on all orders above ₹2999'],
  showAnnouncementBar: true,
  heroTitle: 'Exquisite Aura for Every Occasion',
  heroSubtitle: 'Handcrafted luxury jewelry designed to elevate your style.',
  fontFamily: 'Inter'
};

interface ThemeContextType {
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'theme_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<ThemeConfig>;
        setTheme({ ...defaultTheme, ...data });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply theme colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', theme.primaryColor);
    root.style.setProperty('--brand-secondary', theme.secondaryColor);
    root.style.setProperty('--brand-button', theme.buttonColor);
    root.style.setProperty('--brand-button-text', theme.buttonTextColor);
    root.style.setProperty('--brand-text', theme.textColor);
    root.style.setProperty('--brand-bg', theme.backgroundColor);
    root.style.setProperty('--brand-nav-bg', theme.navBackgroundColor);
    root.style.setProperty('--brand-nav-text', theme.navTextColor);
    root.style.setProperty('--font-family', theme.fontFamily);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
