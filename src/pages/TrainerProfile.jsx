import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiCalendar, 
  FiClock, 
  FiDollarSign, 
  FiAward, 
  FiTrendingUp, 
  FiArrowLeft,
  FiChevronRight,
  FiActivity,
  FiUser
} from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';
import { trainerService } from '../services/dbServices';
import { DetailsSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { toast } from 'react-toastify';

const TrainerProfile = () => {
  const { id } = useParams();
  const { refreshTrainers } = useApp();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status updates
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await trainerService.getById(id);
      setTrainer(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load trainer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await trainerService.update(id, { status: newStatus });
      toast.success(`Trainer status updated to ${newStatus}`);
      await fetchProfile();
      refreshTrainers();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Compute transactions running total (Latest on top)
  const transactionsWithRunningTotals = useMemo(() => {
    if (!trainer || !trainer.transactions) return [];

    // Sort chronologically (oldest first) to compute running sum
    const chronological = [...trainer.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let sum = 0;
    const withTotals = chronological.map(tx => {
      sum += parseFloat(tx.amount || 0);
      return {
        ...tx,
        running_total: sum
      };
    });

    // Reverse to show latest on top
    return withTotals.reverse();
  }, [trainer]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!trainer) {
    return <EmptyState title="Trainer profile not found" message="This trainer might have been deleted." />;
  }

  const statusColors = {
    'Available': 'bg-emerald-100 text-emerald-805 dark:bg-emerald-950/30 dark:text-emerald-400',
    'On Assignment': 'bg-blue-105 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
    'Inactive': 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
  };

  return (
    <div className="space-y-6">
      {/* Navigation Headers */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link to="/trainers" className="hover:text-primary-500 transition-colors">Trainers</Link>
        <FiChevronRight />
        <span className="text-slate-600 dark:text-slate-300">Trainer Profile</span>
      </div>

      {/* Main Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile Info Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6 h-fit">
          <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-850">
            {trainer.photo_url ? (
              <img 
                src={trainer.photo_url} 
                alt={trainer.name} 
                className="w-24 h-24 rounded-full object-cover mx-auto shadow-md border-2 border-primary-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 font-extrabold text-3xl flex items-center justify-center uppercase mx-auto shadow-inner border border-primary-200/20">
                {trainer.name[0]}
              </div>
            )}
            <h2 className="mt-4 text-xl font-bold text-slate-850 dark:text-slate-100">{trainer.name}</h2>
            
            <div className="mt-3 flex items-center justify-center space-x-2">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${statusColors[trainer.status]}`}>
                {trainer.status}
              </span>
            </div>

            {/* Quick action status select */}
            <div className="mt-4">
              <select
                value={trainer.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-700 dark:text-slate-300 focus:border-primary-500 transition-all font-semibold"
              >
                <option value="Available">Set Available</option>
                <option value="On Assignment">Set On Assignment</option>
                <option value="Inactive">Set Inactive</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</h4>
            
            <div className="space-y-3 text-sm text-slate-655 dark:text-slate-300">
              <div className="flex items-center space-x-3">
                <FiPhone className="text-slate-400" />
                <span>{trainer.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-slate-400 truncate" />
                <span className="truncate">{trainer.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMapPin className="text-slate-400" />
                <span>{trainer.address || 'No Address Provided'}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCalendar className="text-slate-400" />
                <span>Joined {new Date(trainer.joining_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Financial widgets and timelines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Money Summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Earned</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
                ₹{(trainer.money_summary?.total_earned || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Based on section allocations</p>
            </div>
            
            <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-405 uppercase tracking-wider">Total Paid</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
                ₹{(trainer.money_summary?.total_given || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Total transaction history</p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-100 dark:border-slate-800 bg-gradient-to-tr from-primary-500/5 to-indigo-500/5">
              <p className="text-xs font-medium text-primary-500 uppercase tracking-wider">Remaining Balance</p>
              <h3 className={`mt-2 text-2xl font-bold ${
                (trainer.money_summary?.remaining_balance || 0) < 0 ? 'text-rose-500' : 'text-primary-600 dark:text-primary-400'
              }`}>
                ₹{(trainer.money_summary?.remaining_balance || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Outstanding payments due</p>
            </div>
          </div>

          {/* Timeline Feed & Money Transactions Ledger */}
          <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
            {/* Tabs Header */}
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              Money Transaction Ledger (Running Total)
            </h3>

            {transactionsWithRunningTotals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">HR Admin Name</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Remarks</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Running Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {transactionsWithRunningTotals.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                        <td className="py-3 px-4">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-4 font-semibold">{tx.given_by}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 font-semibold rounded-full text-[10px] uppercase ${
                            tx.purpose === 'Travel' 
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' 
                              : tx.purpose === 'Food' 
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                              : tx.purpose === 'Accommodation'
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400'
                              : 'bg-slate-50 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                          }`}>
                            {tx.purpose}
                          </span>
                        </td>
                        <td className="py-3 px-4 italic text-slate-400 dark:text-slate-500">{tx.remarks || 'None'}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-500">-₹{tx.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-205">₹{tx.running_total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No transactions recorded" message="Money transactions given to this trainer will reflect here." />
            )}
          </div>

          {/* Allocation & Campus details timelines */}
          <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-805 dark:text-slate-100 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              Campus Allocations & Assignment History
            </h3>

            {trainer.timeline && trainer.timeline.filter(t => t.type === 'Allocation').length > 0 ? (
              <div className="space-y-4">
                {trainer.timeline.filter(t => t.type === 'Allocation').map((item) => (
                  <div key={item.id} className="flex space-x-4 p-3 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="p-3 bg-primary-100/50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 rounded-xl h-fit">
                      <FiAward size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Link to={`/hackathons/${item.rawItem?.hackathon?.id}`} className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-primary-500 transition-colors">
                          {item.rawItem?.hackathon?.campus_name}
                        </Link>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === 'Completed' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                            : 'bg-blue-105 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.subtitle}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Assigned: {new Date(item.date).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No assignments registered" message="Assign this trainer to sections from Hackathon Details pages." />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;
