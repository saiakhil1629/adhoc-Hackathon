import React from 'react';

const Card = ({ title, value, icon: Icon, description, trend, trendType, gradient }) => {
  const gradientClasses = gradient || "from-blue-500/10 to-indigo-500/5";

  return (
    <div className={`glass-card relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group`}>
      {/* Decorative gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses} opacity-50 transition-opacity duration-300 group-hover:opacity-75 -z-10`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{value}</h3>
          
          {description && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{description}</p>
          )}

          {trend && (
            <div className="mt-4 flex items-center space-x-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                trendType === 'positive' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : trendType === 'negative' 
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' 
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {trend}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">vs last month</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
            <Icon size={24} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
