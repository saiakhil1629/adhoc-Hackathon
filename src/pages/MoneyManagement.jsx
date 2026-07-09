import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiPlus, FiX, FiDollarSign, FiUser, FiCalendar, FiFileText, FiActivity, FiTag } from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';
import { moneyService } from '../services/dbServices';
import { useAuth } from '../contexts/AuthContext';
import Table from '../components/Table';
import { TableSkeleton } from '../components/Skeleton';
import Card from '../components/Card';
import { toast } from 'react-toastify';

const MoneyManagement = () => {
  const { transactions, trainers, loading, refreshTransactions, refreshTrainers } = useApp();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      purpose: 'Travel'
    }
  });

  useEffect(() => {
    refreshTransactions();
    if (trainers.length === 0) {
      refreshTrainers();
    }
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        trainer_id: data.trainer_id,
        amount: parseFloat(data.amount),
        purpose: data.purpose,
        remarks: data.remarks,
        given_by: user?.user_metadata?.name || user?.email || 'HR Admin',
        date: data.date
      };

      await moneyService.create(payload);
      toast.success('Funds disbursed successfully!');
      reset();
      setIsModalOpen(false);
      
      // Refresh contexts
      refreshTransactions();
      refreshTrainers();
    } catch (e) {
      console.error(e);
      toast.error('Failed to disburse funds. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    const total = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const count = transactions.length;
    const avg = count > 0 ? Math.round(total / count) : 0;

    return {
      total,
      avg,
      count
    };
  }, [transactions]);

  const columns = [
    {
      header: 'Trainer Name',
      key: 'trainer_id',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-3">
          {row.trainer?.photo_url ? (
            <img src={row.trainer.photo_url} alt={row.trainer.name} className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-105 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 font-bold flex items-center justify-center text-xs uppercase">
              {row.trainer?.name[0] || 'T'}
            </div>
          )}
          <Link to={`/trainers/${row.trainer?.id}`} className="font-bold text-slate-800 dark:text-slate-205 hover:text-primary-500 transition-colors">
            {row.trainer?.name || 'Unknown Trainer'}
          </Link>
        </div>
      )
    },
    {
      header: 'Date',
      key: 'date',
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })
    },
    {
      header: 'Purpose',
      key: 'purpose',
      sortable: true,
      render: (row) => {
        const colors = {
          'Travel': 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
          'Food': 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
          'Accommodation': 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
          'Advance': 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400',
          'Other': 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        };
        return (
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${colors[row.purpose] || colors.Other}`}>
            {row.purpose}
          </span>
        );
      }
    },
    {
      header: 'Remarks',
      key: 'remarks',
      render: (row) => <span className="text-slate-500 dark:text-slate-400 italic text-xs">{row.remarks || 'None'}</span>
    },
    {
      header: 'HR Disbursers',
      key: 'given_by',
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700 dark:text-slate-350">{row.given_by}</span>
    },
    {
      header: 'Amount Paid',
      key: 'amount',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-rose-500">
          -₹{parseFloat(row.amount).toLocaleString('en-IN')}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Money Management</h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">Record payments given to technical trainers and disburse payouts.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <FiPlus size={16} />
          <span>Disburse Payout (Give Money)</span>
        </button>
      </div>

      {/* Financial metrics summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card
          title="Total Funds Distributed"
          value={`₹${stats.total.toLocaleString('en-IN')}`}
          icon={FiDollarSign}
          gradient="from-blue-500/15 to-indigo-500/5"
          description="Total funds disbursed to date"
        />
        <Card
          title="Average Disbursed"
          value={`₹${stats.avg.toLocaleString('en-IN')}`}
          icon={FiActivity}
          gradient="from-purple-500/15 to-pink-500/5"
          description="Average rate per transaction disburse"
        />
        <Card
          title="Total Disbursers Transactions"
          value={stats.count}
          icon={FiFileText}
          gradient="from-sky-500/15 to-cyan-500/5"
          description="Total transaction count logs"
        />
      </div>

      {loading.transactions && transactions.length === 0 ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={columns}
          data={transactions}
          searchField="given_by"
          placeholder="Search by HR Name..."
        />
      )}

      {/* DISBURSE MONEY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="glass-card w-full max-w-xl rounded-3xl p-6 shadow-2xl relative z-10 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Disburse Payout (Give Money)</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Technical Trainer</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-3.5 text-slate-400" />
                  <select
                    {...register("trainer_id", { required: "Trainer selection is required" })}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold"
                  >
                    <option value="">-- Choose Trainer --</option>
                    {trainers.filter(t => t.status !== 'Inactive').map(t => (
                      <option key={t.id} value={t.id}>{t.name} (Balance: ₹{(t.remaining_balance || 0).toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>
                {errors.trainer_id && <p className="mt-1 text-xs text-rose-450">{errors.trainer_id.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payout Amount (₹)</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      min="1"
                      {...register("amount", { 
                        required: "Amount is required",
                        min: { value: 1, message: "Amount must be greater than zero" }
                      })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-850 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.amount && <p className="mt-1 text-xs text-rose-450">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payout Purpose</label>
                  <div className="relative">
                    <FiTag className="absolute left-4 top-3.5 text-slate-400" />
                    <select
                      {...register("purpose", { required: "Purpose is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-855 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      <option value="Travel">Travel Reimbursement</option>
                      <option value="Food">Food Reimbursement</option>
                      <option value="Accommodation">Accommodation Stay</option>
                      <option value="Advance">Advance Paid</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="date"
                      {...register("date", { required: "Date is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-850 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.date && <p className="mt-1 text-xs text-rose-450">{errors.date.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks / Note</label>
                <textarea
                  placeholder="e.g. Travel tickets from Kakinada to Rajahmundry..."
                  rows="3"
                  {...register("remarks")}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-105 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-655 dark:text-slate-300 rounded-xl transition-colors outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-md transition-all outline-none flex items-center justify-center min-w-24 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Disburse Funds"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyManagement;
