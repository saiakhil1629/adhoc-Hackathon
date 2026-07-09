import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { isMockMode } from '../services/supabase';
import { FiSettings, FiDollarSign, FiMoon, FiSun, FiDatabase, FiAlertTriangle } from 'react-icons/fi';

const Settings = () => {
  const { defaultRate, updateDefaultRate, darkMode, toggleDarkMode } = useApp();
  const [rateInput, setRateInput] = useState(defaultRate);

  const handleRateSubmit = (e) => {
    e.preventDefault();
    updateDefaultRate(rateInput);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-805 dark:text-slate-100 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-550 dark:text-slate-400">Configure application variables, default payment rules, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Preferences Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 text-primary-500">
            <FiDollarSign size={20} />
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-105">Finance Configurations</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure the default amount allocated to technical trainers per assigned section. This rate is applied automatically during new allocations, though you can override it on individual sections.
          </p>

          <form onSubmit={handleRateSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Default Section Rate (₹)</label>
              <input
                type="number"
                min="0"
                value={rateInput}
                onChange={(e) => setRateInput(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 transition-all font-semibold"
              />
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Update Default Rate
            </button>
          </form>
        </div>

        {/* System Theme Toggles */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 text-indigo-500">
            {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-105">Display Preference</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Choose between standard high-contrast Light mode or slate-based premium Dark mode layouts. Theme updates are saved automatically.
          </p>

          <div className="pt-2">
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all outline-none"
            >
              {darkMode ? (
                <>
                  <FiSun />
                  <span>Switch to Light Theme</span>
                </>
              ) : (
                <>
                  <FiMoon />
                  <span>Switch to Dark Theme</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Database mode inspection / configurations log */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center space-x-3 text-emerald-500">
            <FiDatabase size={20} />
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-105">Database Connectivity Status</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl gap-4 border border-slate-100 dark:border-slate-850">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Current Connection: {isMockMode ? 'Mock Database (Local Storage)' : 'Real PostgreSQL (Supabase)'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                {isMockMode 
                  ? 'The app is running in Local Mock mode because no valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables were found in your .env file. Actions you take are persisted in your browser.'
                  : 'The app is successfully connected to your real Supabase workspace. RLS security rules are fully operational.'
                }
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isMockMode 
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/25 dark:text-amber-400' 
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/25 dark:text-emerald-450'
              }`}>
                {isMockMode ? <FiAlertTriangle /> : <FiDatabase />}
                <span>{isMockMode ? 'Mock Mode' : 'Connected'}</span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
