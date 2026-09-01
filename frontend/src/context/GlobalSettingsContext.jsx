import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const GlobalSettingsContext = createContext();

export const GlobalSettingsProvider = ({ children }) => {
  const [globalSettings, setGlobalSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/public/settings');
      if (data.success) {
        setGlobalSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch public settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <GlobalSettingsContext.Provider value={{ globalSettings, loadingSettings, refreshSettings: fetchSettings }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
