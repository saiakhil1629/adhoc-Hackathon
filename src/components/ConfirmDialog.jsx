import React from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  const confirmBtnClasses = type === 'danger'
    ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/25'
    : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500/25';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay background */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      
      {/* Dialog container */}
      <div className="glass-card w-full max-w-md rounded-2xl p-6 shadow-2xl relative z-10 animate-fade-in">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
        
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors focus:ring-2 focus:ring-slate-500/20 outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-md transition-colors focus:ring-2 outline-none ${confirmBtnClasses}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
