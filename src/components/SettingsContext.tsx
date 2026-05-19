import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings, settingsService } from '../services/settingsService';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = settingsService.subscribeToSettings((data) => {
      setSettings(data);
      setLoading(false);
      
      // Update CSS variables for live preview of colors if needed
      document.documentElement.style.setProperty('--brand-color', data.brandColor);
      document.documentElement.style.setProperty('--brand-accent', data.accentColor);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
