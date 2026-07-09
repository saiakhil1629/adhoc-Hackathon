import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 animate-pulse-subtle border border-slate-100 dark:border-slate-800">
    <div className="flex justify-between items-start">
      <div className="space-y-3 w-2/3">
        <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-1/2"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-850 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded w-1/3"></div>
      </div>
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-850 rounded-xl"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="glass-card rounded-2xl p-4 animate-pulse-subtle border border-slate-100 dark:border-slate-800 space-y-4">
    <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="h-10 bg-slate-200 dark:bg-slate-850 rounded-xl w-64"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-24"></div>
    </div>
    <div className="space-y-4 py-2">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex justify-between items-center space-x-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-850 rounded w-1/6"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-850 rounded w-1/5"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-850 rounded w-12"></div>
        </div>
      ))}
    </div>
  </div>
);

export const DetailsSkeleton = () => (
  <div className="space-y-6 animate-pulse-subtle">
    <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-850 rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-1/2"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-850 rounded w-3/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-1/2"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-850 rounded w-3/4"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-1/2"></div>
          <div className="h-5 bg-slate-200 dark:bg-slate-850 rounded w-3/4"></div>
        </div>
      </div>
    </div>
    <div className="h-64 bg-slate-200 dark:bg-slate-850 rounded-2xl"></div>
  </div>
);
