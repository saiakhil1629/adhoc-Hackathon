import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSun, FiMoon, FiSearch, FiAward, FiUser } from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';

const Header = ({ onMenuToggle }) => {
  const { darkMode, toggleDarkMode, hackathons, trainers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ hackathons: [], trainers: [] });
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Run global search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ hackathons: [], trainers: [] });
      return;
    }

    const query = searchQuery.toLowerCase();

    const filteredHackathons = hackathons.filter(h => 
      h.campus_name.toLowerCase().includes(query) ||
      h.location.toLowerCase().includes(query)
    ).slice(0, 4);

    const filteredTrainers = trainers.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.phone.toLowerCase().includes(query) ||
      t.email.toLowerCase().includes(query) ||
      t.status.toLowerCase().includes(query)
    ).slice(0, 4);

    setResults({ hackathons: filteredHackathons, trainers: filteredTrainers });
  }, [searchQuery, hackathons, trainers]);

  const handleSelectResult = (type, id) => {
    setSearchQuery('');
    setShowResults(false);
    if (type === 'hackathon') {
      navigate(`/hackathons/${id}`);
    } else {
      navigate(`/trainers/${id}`);
    }
  };

  const hasResults = results.hackathons.length > 0 || results.trainers.length > 0;

  return (
    <header className="h-16 px-6 glass border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <FiMenu size={20} />
        </button>

        {/* Global Search Input */}
        <div className="relative max-w-md w-full" ref={dropdownRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FiSearch size={16} />
          </div>
          <input
            type="text"
            placeholder="Search campus, trainer, branch, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-slate-100"
          />

          {/* Search Results Dropdown */}
          {showResults && searchQuery.trim() && (
            <div className="absolute top-12 left-0 right-0 glass shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-2 overflow-hidden max-h-96 overflow-y-auto z-50 animate-fade-in">
              {hasResults ? (
                <div className="space-y-4">
                  {/* Hackathons Section */}
                  {results.hackathons.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Hackathons
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.hackathons.map(h => (
                          <button
                            key={h.id}
                            onClick={() => handleSelectResult('hackathon', h.id)}
                            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-colors"
                          >
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-lg">
                              <FiAward size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{h.campus_name}</p>
                              <p className="text-xs text-slate-400 truncate">{h.location} • {h.status}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trainers Section */}
                  {results.trainers.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Technical Trainers
                      </div>
                      <div className="mt-1 space-y-1">
                        {results.trainers.map(t => (
                          <button
                            key={t.id}
                            onClick={() => handleSelectResult('trainer', t.id)}
                            className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-colors"
                          >
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-lg">
                              <FiUser size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{t.name}</p>
                              <p className="text-xs text-slate-400 truncate">{t.email} • {t.phone} • {t.status}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-450 dark:text-slate-500">
                  No matching results found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm active:scale-95"
          title="Toggle Light/Dark Theme"
        >
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
