import React, { createContext, useContext, useState, useEffect } from 'react';
import { hackathonService, trainerService, moneyService, auditService } from '../services/dbServices';
import { isMockMode } from '../services/supabase';
import { toast } from 'react-toastify';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [hackathons, setHackathons] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState({
    hackathons: false,
    trainers: false,
    transactions: false,
    auditLogs: false
  });

  // Settings
  const [defaultRate, setDefaultRate] = useState(() => {
    return parseFloat(localStorage.getItem('tt_setting_default_rate') || '5000');
  });

  // Theme settings
  const [darkMode, setDarkMode] = useState(() => {
    const localTheme = localStorage.getItem('tt_theme');
    if (localTheme) return localTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to root body on change
  useEffect(() => {
    const root = window.document.body;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('tt_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('tt_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const updateDefaultRate = (rate) => {
    const cleanRate = parseFloat(rate);
    setDefaultRate(cleanRate);
    localStorage.setItem('tt_setting_default_rate', cleanRate.toString());
    toast.success(`Default section allocation rate updated to ₹${cleanRate.toLocaleString('en-IN')}`);
  };

  const fetchHackathons = async () => {
    setLoading(prev => ({ ...prev, hackathons: true }));
    try {
      const data = await hackathonService.getAll();
      setHackathons(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load hackathons list');
    } finally {
      setLoading(prev => ({ ...prev, hackathons: false }));
    }
  };

  const fetchTrainers = async () => {
    setLoading(prev => ({ ...prev, trainers: true }));
    try {
      const data = await trainerService.getAll();
      setTrainers(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load trainers list');
    } finally {
      setLoading(prev => ({ ...prev, trainers: false }));
    }
  };

  const fetchTransactions = async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    try {
      const data = await moneyService.getAll();
      setTransactions(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(prev => ({ ...prev, auditLogs: true }));
    try {
      const data = await auditService.getAll();
      setAuditLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(prev => ({ ...prev, auditLogs: false }));
    }
  };

  const refreshAllData = async () => {
    await Promise.all([
      fetchHackathons(),
      fetchTrainers(),
      fetchTransactions(),
      fetchAuditLogs()
    ]);
  };

  const value = {
    hackathons,
    trainers,
    transactions,
    auditLogs,
    loading,
    defaultRate,
    darkMode,
    toggleDarkMode,
    updateDefaultRate,
    refreshHackathons: fetchHackathons,
    refreshTrainers: fetchTrainers,
    refreshTransactions: fetchTransactions,
    refreshAuditLogs: fetchAuditLogs,
    refreshAllData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
