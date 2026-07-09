import React, { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiAward, 
  FiUsers, 
  FiDollarSign, 
  FiMapPin, 
  FiClock, 
  FiCheckCircle, 
  FiCalendar, 
  FiArrowRight,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import Card from '../components/Card';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hackathons, trainers, transactions, auditLogs, loading, refreshAllData } = useApp();

  useEffect(() => {
    refreshAllData();
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    const totalHackathons = hackathons.length;
    const pendingCount = hackathons.filter(h => h.status === 'Pending').length;
    const completedCount = hackathons.filter(h => h.status === 'Completed').length;
    const activeCount = hackathons.filter(h => h.status === 'Allocation Done' || h.status === 'In Progress').length;
    const totalTrainers = trainers.length;
    
    // Unique campuses list
    const campuses = new Set(hackathons.map(h => {
      // Extract base name before parentheses e.g. "Aditya Engineering College"
      return h.campus_name.split('(')[0].trim();
    }));

    const totalMoneyDistributed = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    return {
      totalHackathons,
      pendingHackathons: pendingCount,
      completedHackathons: completedCount,
      activeHackathons: activeCount,
      totalTrainers,
      campusCount: campuses.size,
      moneyDistributed: totalMoneyDistributed
    };
  }, [hackathons, trainers, transactions]);

  // Compute Upcoming Hackathon Reminder (starts in the next 14 days)
  const upcomingHackathons = useMemo(() => {
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    return hackathons.filter(h => {
      const hDate = new Date(h.hackathon_date);
      return h.status === 'Pending' && hDate >= today && hDate <= twoWeeksLater;
    }).sort((a, b) => new Date(a.hackathon_date) - new Date(b.hackathon_date));
  }, [hackathons]);

  // Compute Money Chart Data (grouped by date)
  const moneyChartData = useMemo(() => {
    const groups = {};
    // Sort transactions chronologically
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let runningSum = 0;
    sortedTx.forEach(tx => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      runningSum += parseFloat(tx.amount || 0);
      groups[dateStr] = runningSum;
    });

    return Object.entries(groups).map(([date, amount]) => ({
      date,
      amount
    })).slice(-8); // Take last 8 dates
  }, [transactions]);

  // Compute Trainer Workload Data
  const workloadChartData = useMemo(() => {
    return trainers.map(t => ({
      name: t.name.split(' ')[0], // First name
      workload: t.workload_count || 0
    })).slice(0, 5); // Take top 5 trainers
  }, [trainers]);

  // Render Loading state
  const isPageLoading = loading.hackathons || loading.trainers || loading.transactions;

  if (isPageLoading && hackathons.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse-subtle"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Portal Dashboard</h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">Welcome to the Aditya Technical Trainer Management Portal.</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/hackathons"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary-500/10 hover:shadow-lg active:scale-95"
          >
            <span>Create Hackathon</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Hackathon Reminder Alert */}
      {upcomingHackathons.length > 0 && (
        <div className="glass bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 text-amber-800 dark:text-amber-400">
          <FiAlertCircle className="mt-0.5 text-amber-500 flex-shrink-0" size={18} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">Upcoming Hackathon Reminder</h4>
            <p className="mt-1 text-xs leading-relaxed">
              <strong>{upcomingHackathons[0].campus_name}</strong> hackathon is scheduled on <strong>{new Date(upcomingHackathons[0].hackathon_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</strong>. Allocation details should be reviewed immediately.
            </p>
          </div>
          <Link 
            to={`/hackathons/${upcomingHackathons[0].id}`} 
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>Allocate</span>
            <FiArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          title="Total Hackathons"
          value={metrics.totalHackathons}
          icon={FiAward}
          gradient="from-blue-500/15 to-indigo-500/5"
          description="Total hackathons registered"
        />
        <Card
          title="Pending Hackathons"
          value={metrics.pendingHackathons}
          icon={FiClock}
          gradient="from-amber-500/15 to-orange-500/5"
          description="Waiting for trainer allocation"
        />
        <Card
          title="Completed Hackathons"
          value={metrics.completedHackathons}
          icon={FiCheckCircle}
          gradient="from-emerald-500/15 to-teal-500/5"
          description="Successfully completed hackathons"
        />
        <Card
          title="Total Trainers"
          value={metrics.totalTrainers}
          icon={FiUsers}
          gradient="from-purple-500/15 to-pink-500/5"
          description="Registered technical trainers"
        />
        <Card
          title="Campus Count"
          value={metrics.campusCount}
          icon={FiMapPin}
          gradient="from-sky-500/15 to-cyan-500/5"
          description="Distinct campuses represented"
        />
        <Card
          title="Money Distributed"
          value={`₹${metrics.moneyDistributed.toLocaleString('en-IN')}`}
          icon={FiDollarSign}
          gradient="from-rose-500/15 to-red-500/5"
          description="Total funds disbursed to trainers"
        />
      </div>

      {/* Graphical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Money Distributed Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Cumulative Money Disbursed</h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Last 8 payouts</span>
          </div>
          <div className="h-64">
            {moneyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moneyChartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(30, 41, 59, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Distributed']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No transactions recorded yet</div>
            )}
          </div>
        </div>

        {/* Trainer Workload chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Workload (Sections Assigned)</h3>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Active Allocations</span>
          </div>
          <div className="h-64">
            {workloadChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadChartData} margin={{ left: -25, right: 5, top: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(30, 41, 59, 0.95)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(value) => [value, 'Sections']}
                  />
                  <Bar dataKey="workload" radius={[6, 6, 0, 0]}>
                    {workloadChartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No active allocations</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Lists Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hackathons Lists (Pending / In Progress) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Pending & Active Hackathons</h3>
              <span className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 font-semibold rounded-full">Allocating / Live</span>
            </div>
            
            {hackathons.filter(h => h.status !== 'Completed').length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {hackathons.filter(h => h.status !== 'Completed').map(h => (
                  <div key={h.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group">
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <div className="flex items-center space-x-2">
                        <Link to={`/hackathons/${h.id}`} className="font-bold text-slate-850 dark:text-slate-200 hover:text-primary-500 transition-colors truncate block">
                          {h.campus_name}
                        </Link>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          h.status === 'Pending' 
                            ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/30 dark:text-amber-400' 
                            : h.status === 'Allocation Done' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400' 
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap text-xs text-slate-400 dark:text-slate-500 gap-x-4 gap-y-1">
                        <span className="flex items-center"><FiMapPin className="mr-1" /> {h.location}</span>
                        <span className="flex items-center"><FiCalendar className="mr-1" /> {new Date(h.hackathon_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <p className="text-xs text-slate-400">Allocated</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {h.allocated_sections} / {h.total_sections} <span className="text-[10px] text-slate-400">sections</span>
                        </p>
                      </div>
                      <Link 
                        to={`/hackathons/${h.id}`}
                        className="p-2 bg-slate-50 hover:bg-primary-500 dark:bg-slate-900 dark:hover:bg-primary-500 text-slate-400 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                      >
                        <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No active hackathons" message="All campus hackathons are completed or none are registered." />
            )}
          </div>

          {/* Completed Hackathons List */}
          <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Completed Hackathons</h3>
              <span className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 font-semibold rounded-full">Archive</span>
            </div>

            {hackathons.filter(h => h.status === 'Completed').length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {hackathons.filter(h => h.status === 'Completed').map(h => (
                  <div key={h.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                      <Link to={`/hackathons/${h.id}`} className="font-bold text-slate-850 dark:text-slate-200 hover:text-primary-500 transition-colors truncate block">
                        {h.campus_name}
                      </Link>
                      <div className="flex flex-wrap text-xs text-slate-400 dark:text-slate-500 gap-x-4 gap-y-1">
                        <span className="flex items-center"><FiMapPin className="mr-1" /> {h.location}</span>
                        <span className="flex items-center"><FiCalendar className="mr-1" /> {new Date(h.hackathon_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <p className="text-xs text-slate-450">Trainers deployed</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-305">{h.trainer_count} allocated</p>
                      </div>
                      <Link 
                        to={`/hackathons/${h.id}`}
                        className="p-2 bg-slate-50 hover:bg-primary-500 dark:bg-slate-900 dark:hover:bg-primary-500 text-slate-400 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                      >
                        <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No completed hackathons" message="Completed hackathons will move here automatically." />
            )}
          </div>
        </div>

        {/* Recent Trainer Activity Feed */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Trainer Activity</h3>
              <span className="text-xs text-slate-400 dark:text-slate-550">Audit Feed</span>
            </div>

            {auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.slice(0, 6).map((log) => {
                  const dateStr = new Date(log.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={log.id} className="flex space-x-3 text-xs leading-relaxed relative pb-4 border-l border-slate-150 dark:border-slate-800 pl-4 ml-2 last:border-none last:pb-0">
                      {/* Timeline dot */}
                      <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 ${
                        log.action === 'GIVE_MONEY' 
                          ? 'bg-rose-500' 
                          : log.action === 'ALLOCATE_TRAINER' 
                          ? 'bg-blue-500' 
                          : log.action === 'CREATE_HACKATHON' 
                          ? 'bg-green-500' 
                          : 'bg-slate-450'
                      }`} />
                      
                      <div className="flex-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{log.action.replace('_', ' ')}</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{log.details}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>By {log.performed_by}</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No recent activity" message="Activity logging will populate as actions are taken." />
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link to="/reports" className="text-xs font-semibold text-primary-500 hover:underline">
              View All Audit Records
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
