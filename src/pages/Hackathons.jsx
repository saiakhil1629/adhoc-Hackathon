import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash, FiX, FiCalendar, FiMapPin, FiPhone, FiUser, FiInfo, FiAward } from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';
import { hackathonService } from '../services/dbServices';
import Table from '../components/Table';
import { TableSkeleton } from '../components/Skeleton';
import { toast } from 'react-toastify';

const Hackathons = () => {
  const { hackathons, loading, refreshHackathons } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic years and branches state
  const [yearsData, setYearsData] = useState({
    '1st Year': { selected: false, branches: [{ branch_name: 'CSE', section_count: 2 }] },
    '2nd Year': { selected: false, branches: [{ branch_name: 'CSE', section_count: 2 }] },
    '3rd Year': { selected: false, branches: [{ branch_name: 'CSE', section_count: 2 }] }
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    refreshHackathons();
  }, []);

  const toggleYear = (year) => {
    setYearsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        selected: !prev[year].selected
      }
    }));
  };

  const addBranch = (year) => {
    setYearsData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        branches: [...prev[year].branches, { branch_name: '', section_count: 1 }]
      }
    }));
  };

  const removeBranch = (year, index) => {
    setYearsData(prev => {
      const branches = [...prev[year].branches];
      branches.splice(index, 1);
      return {
        ...prev,
        [year]: {
          ...prev[year],
          branches
        }
      };
    });
  };

  const updateBranchField = (year, index, field, value) => {
    setYearsData(prev => {
      const branches = [...prev[year].branches];
      branches[index] = { ...branches[index], [field]: value };
      return {
        ...prev,
        [year]: {
          ...prev[year],
          branches
        }
      };
    });
  };

  const onSubmit = async (data) => {
    // Validate that at least one year is selected
    const activeYears = Object.entries(yearsData)
      .filter(([_, value]) => value.selected)
      .map(([key, value]) => ({
        year_name: key,
        branches: value.branches.filter(b => b.branch_name.trim() !== '')
      }));

    if (activeYears.length === 0) {
      toast.warning('Please select at least one Year and add a Branch');
      return;
    }

    // Verify all branches have names and section counts
    for (const year of activeYears) {
      if (year.branches.length === 0) {
        toast.warning(`Please add at least one branch for ${year.year_name}`);
        return;
      }
      for (const branch of year.branches) {
        if (!branch.branch_name || branch.section_count <= 0) {
          toast.warning('Please enter valid branch names and section counts');
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        campus_name: data.campus_name,
        location: data.location,
        contact_person: data.contact_person,
        contact_phone: data.contact_phone,
        hackathon_date: data.hackathon_date,
        status: data.status,
        years: activeYears
      };

      await hackathonService.create(payload);
      toast.success(`Hackathon for ${data.campus_name} created successfully!`);
      
      // Reset State
      reset();
      setYearsData({
        '1st Year': { selected: false, branches: [{ branch_name: 'CSE', section_count: 2 }] },
        '2nd Year': { selected: false, branches: [{ branch_name: 'CSE', section_count: 2 }] },
        '3rd Year': { selected: false, branches: [{ branch_name: 'CSE', section_count: 2 }] }
      });
      setIsModalOpen(false);
      refreshHackathons();
    } catch (e) {
      console.error(e);
      toast.error('Failed to create hackathon. Please check logs.');
    } finally {
      setSubmitting(false);
    }
  };

  // Table structure definitions
  const columns = [
    {
      header: 'Campus Name',
      key: 'campus_name',
      sortable: true,
      render: (row) => (
        <Link to={`/hackathons/${row.id}`} className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary-500 transition-colors">
          {row.campus_name}
        </Link>
      )
    },
    {
      header: 'Date',
      key: 'hackathon_date',
      sortable: true,
      render: (row) => new Date(row.hackathon_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })
    },
    {
      header: 'Location',
      key: 'location',
      sortable: true
    },
    {
      header: 'Contact Person',
      key: 'contact_person',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">{row.contact_person}</p>
          <p className="text-xs text-slate-400">{row.contact_phone}</p>
        </div>
      )
    },
    {
      header: 'Sections Progress',
      key: 'total_sections',
      render: (row) => {
        const percent = row.total_sections > 0 
          ? Math.round((row.allocated_sections / row.total_sections) * 100) 
          : 0;
        return (
          <div className="w-full max-w-xs space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500 dark:text-slate-450">{row.allocated_sections} / {row.total_sections} sections</span>
              <span className="text-primary-500">{percent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const statusColors = {
          'Pending': 'bg-amber-100 text-amber-850 dark:bg-amber-950/30 dark:text-amber-400',
          'Allocation Done': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
          'In Progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400',
          'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
        };
        return (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusColors[row.status]}`}>
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Hackathons Portal</h1>
          <p className="text-sm text-slate-550 dark:text-slate-400">Manage Aditya campus hackathons and track status.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <FiPlus size={16} />
          <span>Create New Hackathon</span>
        </button>
      </div>

      {loading.hackathons && hackathons.length === 0 ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={columns}
          data={hackathons}
          searchField="campus_name"
          placeholder="Search campus name..."
          actions={(row) => (
            <Link
              to={`/hackathons/${row.id}`}
              className="px-3 py-1.5 bg-slate-50 hover:bg-primary-50 text-primary-600 hover:text-primary-700 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-primary-400 text-xs font-bold rounded-xl transition-colors"
            >
              View Details
            </Link>
          )}
        />
      )}

      {/* CREATE HACKATHON DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Overlay */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          {/* Modal Container */}
          <div className="glass-card w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative z-10 my-8 max-h-[90vh] flex flex-col animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Hackathon</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto py-4 flex-1 space-y-6 pr-2">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Campus Name</label>
                  <div className="relative">
                    <FiAward className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Aditya Engineering College (AEC)"
                      {...register("campus_name", { required: "Campus name is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.campus_name && <p className="mt-1 text-xs text-rose-450">{errors.campus_name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Surampalem, Seminar Hall"
                      {...register("location", { required: "Location is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.location && <p className="mt-1 text-xs text-rose-450">{errors.location.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Point of Contact Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Dr. K. Srinivas"
                      {...register("contact_person", { required: "POC name is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.contact_person && <p className="mt-1 text-xs text-rose-450">{errors.contact_person.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">POC Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      {...register("contact_phone", { 
                        required: "POC phone is required",
                        pattern: { value: /^[0-9]{10}$/, message: "Must be a 10-digit number" }
                      })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.contact_phone && <p className="mt-1 text-xs text-rose-450">{errors.contact_phone.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hackathon Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="date"
                      {...register("hackathon_date", { required: "Date is required" })}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                  {errors.hackathon_date && <p className="mt-1 text-xs text-rose-450">{errors.hackathon_date.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Status</label>
                  <select
                    {...register("status")}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Allocation Done">Allocation Done</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Campus Hierarchy Years Definition */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                  <FiInfo className="mr-2 text-primary-500" />
                  Define Academic Hierarchy & Branches
                </h4>
                <p className="text-xs text-slate-400 mb-4">Select the years participating in this hackathon, then dynamically add the branches and number of sections for each.</p>

                <div className="space-y-4">
                  {Object.entries(yearsData).map(([year, val]) => (
                    <div key={year} className="glass bg-white/40 dark:bg-slate-900/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={val.selected}
                            onChange={() => toggleYear(year)}
                            className="w-4.5 h-4.5 text-primary-500 border-slate-300 rounded focus:ring-primary-500"
                          />
                          <span className="font-bold text-sm text-slate-700 dark:text-slate-350">{year}</span>
                        </label>

                        {val.selected && (
                          <button
                            type="button"
                            onClick={() => addBranch(year)}
                            className="flex items-center space-x-1 px-3 py-1 bg-primary-50 hover:bg-primary-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg transition-colors"
                          >
                            <FiPlus />
                            <span>Add Branch</span>
                          </button>
                        )}
                      </div>

                      {/* Display branches if year is checked */}
                      {val.selected && (
                        <div className="mt-4 space-y-3 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                          {val.branches.map((branch, bIdx) => (
                            <div key={bIdx} className="flex items-center space-x-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="e.g. CSE, ECE"
                                  value={branch.branch_name}
                                  onChange={(e) => updateBranchField(year, bIdx, 'branch_name', e.target.value.toUpperCase())}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs outline-none text-slate-800 dark:text-slate-200 focus:border-primary-500 transition-all"
                                  required
                                />
                              </div>
                              <div className="w-24">
                                <input
                                  type="number"
                                  placeholder="Sections"
                                  min="1"
                                  value={branch.section_count}
                                  onChange={(e) => updateBranchField(year, bIdx, 'section_count', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs outline-none text-slate-805 dark:text-slate-200 focus:border-primary-500 transition-all"
                                  required
                                />
                              </div>
                              {val.branches.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeBranch(year, bIdx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                                >
                                  <FiTrash size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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
                    "Save Hackathon"
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

export default Hackathons;
