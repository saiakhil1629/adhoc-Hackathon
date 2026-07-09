import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiGrid, 
  FiAward, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiSettings, 
  FiLogOut,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { darkMode } = useApp();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: FiGrid },
    { name: 'Hackathons', path: '/hackathons', icon: FiAward },
    { name: 'Technical Trainers', path: '/trainers', icon: FiUsers },
    { name: 'Money Management', path: '/money', icon: FiDollarSign },
    { name: 'Reports', path: '/reports', icon: FiBarChart2 },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <>
      {/* Sidebar background overlay on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 w-64 glass border-r border-slate-200 dark:border-slate-800 z-40 transition-transform duration-300 transform lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col justify-between`}>
        <div>
          {/* Header / Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary-500/20">
                A
              </div>
              <span className="font-bold text-sm tracking-wide text-slate-800 dark:text-slate-100 uppercase">
                Aditya portal
              </span>
            </div>
            
            <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={onClose}>
              <FiX size={20} />
            </button>
          </div>

          {/* User Profile Quick Info */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 font-bold flex items-center justify-center uppercase shadow-inner border border-primary-200/20">
                {user?.user_metadata?.name?.[0] || user?.email?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {user?.user_metadata?.name || 'HR Admin'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || 'hr@aditya.ac.in'}
                </p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="mt-6 px-4 space-y-1">
            {menuItems.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }
                `}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850">
          <button
            onClick={() => {
              logout();
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
