import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiPlus, FiX, FiSearch, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiCamera } from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';
import { trainerService } from '../services/dbServices';
import Table from '../components/Table';
import { TableSkeleton } from '../components/Skeleton';
import { toast } from 'react-toastify';

const Trainers = () => {
  const { trainers, loading, refreshTrainers } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState('All');

  // Avatar Upload State
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      joining_date: new Date().toISOString().split('T')[0],
      status: 'Available'
    }
  });

  useEffect(() => {
    refreshTrainers();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const trainerData = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        joining_date: data.joining_date,
        status: data.status
      };

      // 1. Create trainer
      const newTrainer = await trainerService.create(trainerData);

      // 2. Upload photo if selected
      if (selectedPhoto && newTrainer.id) {
        await trainerService.uploadPhoto(newTrainer.id, selectedPhoto);
      }

      toast.success(`Trainer ${data.name} added successfully!`);
      reset();
      setSelectedPhoto(null);
      setPhotoPreview('');
      setIsModalOpen(false);
      refreshTrainers();
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to add technical trainer');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter trainers based on status dropdown
  const filteredTrainers = React.useMemo(() => {
    if (statusFilter === 'All') return trainers;
    return trainers.filter(t => t.status === statusFilter);
  }, [trainers, statusFilter]);

  const columns = [
    {
      header: 'Trainer Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-3">
          {row.photo_url ? (
            <img src={row.photo_url} alt={row.name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100 dark:border-slate-800" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 font-bold flex items-center justify-center text-sm uppercase">
              {row.name[0]}
            </div>
          )}
          <div>
            <Link to={`/trainers/${row.id}`} className="font-bold text-slate-805 dark:text-slate-200 hover:text-primary-500 transition-colors">
              {row.name}
            </Link>
            <p className="text-xs text-slate-400">Joined {new Date(row.joining_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      key: 'email',
      render: (row) => (
        <div>
          <p className="text-slate-700 dark:text-slate-350 font-medium">{row.email}</p>
          <p className="text-xs text-slate-400">{row.phone}</p>
        </div>
      )
    },
    {
      header: 'Current Assignment',
      key: 'current_campus',
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{row.current_campus || 'None'}</p>
          {row.assigned_branches && row.assigned_branches.length > 0 && (
            <p className="text-xs text-slate-400 truncate">Branches: {row.assigned_branches.join(', ')}</p>
          )}
        </div>
      )
    },
    {
      header: 'Workload',
      key: 'workload_count',
      sortable: true,
      render: (row) => {
        const count = row.workload_count || 0;
        let color = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400';
        let label = 'Idle';

        if (count > 0 && count <= 2) {
          color = 'bg-sky-100 text-sky-850 dark:bg-sky-950/30 dark:text-sky-400';
          label = `${count} Sec (Low)`;
        } else if (count > 2 && count <= 4) {
          color = 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
          label = `${count} Sec (Med)`;
        } else if (count > 4) {
          color = 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
          label = `${count} Sec (High)`;
        }

        return (
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${color}`}>
            {label}
          </span>
        );
      }
    },
    {
      header: 'Total Paid',
      key: 'total_money_given',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-750 dark:text-slate-250">
          ₹{(row.total_money_given || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const colors = {
          'Available': 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
          'On Assignment': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
          'Inactive': 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
        };
        return (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${colors[row.status]}`}>
            {row.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-805 dark:text-slate-100 tracking-tight">Technical Trainers</h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">Directory of expert trainers, workload, and financial payouts.</p>
        </div>
        
        <div className="flex space-x-3">
          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none text-slate-700 dark:text-slate-300 focus:border-primary-500 transition-all shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Assignment">On Assignment</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <FiPlus size={16} />
            <span>Add Trainer</span>
          </button>
        </div>
      </div>

      {loading.trainers && trainers.length === 0 ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={columns}
          data={filteredTrainers}
          searchField="name"
          placeholder="Search trainer name..."
          actions={(row) => (
            <Link
              to={`/trainers/${row.id}`}
              className="px-3 py-1.5 bg-slate-50 hover:bg-primary-50 text-primary-600 hover:text-primary-700 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-primary-400 text-xs font-bold rounded-xl transition-colors"
            >
              View Profile
            </Link>
          )}
        />
      )}

      {/* ADD TRAINER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="glass-card w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative z-10 my-8 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add Technical Trainer</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
              
              {/* Photo Avatar Upload widget */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative group cursor-pointer">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <FiCamera size={24} />
                      <span className="text-[10px] font-semibold mt-1">Upload Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
                    title="Choose avatar image file"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Preferred square PNG or JPG, max 2MB.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trainer Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Venkatesh Prasad"
                      {...register("name", { required: "Name is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-rose-450">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      {...register("phone", { 
                        required: "Phone is required",
                        pattern: { value: /^[0-9]{10}$/, message: "Must be a 10-digit number" }
                      })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-805 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-rose-450">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. venkatesh@aditya.ac.in"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                      })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-805 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-rose-450">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Joining Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="date"
                      {...register("joining_date", { required: "Joining date is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-805 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.joining_date && <p className="mt-1 text-xs text-rose-450">{errors.joining_date.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Home Address</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Surampalem Campus Staff Quarters"
                      {...register("address")}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-805 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Trainer Status</label>
                  <select
                    {...register("status")}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-805 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="Available">Available</option>
                    <option value="On Assignment">On Assignment</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                    "Save Trainer"
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

export default Trainers;
