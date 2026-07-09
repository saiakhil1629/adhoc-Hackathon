import React from 'react';
import { FiFolder } from 'react-icons/fi';

const EmptyState = ({ title = "No data available", message = "There is currently no information to show in this view.", icon: Icon = FiFolder, action }) => {
  return (
    <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
      <div className="p-4 bg-primary-50 dark:bg-slate-900 rounded-full text-primary-500 mb-4">
        <Icon size={36} />
      </div>
      <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
