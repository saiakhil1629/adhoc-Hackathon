import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiMapPin, 
  FiUser, 
  FiPhone, 
  FiCalendar, 
  FiGrid, 
  FiCheckCircle, 
  FiUsers, 
  FiPlus, 
  FiArrowLeft, 
  FiChevronRight,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';
import { hackathonService, trainerService } from '../services/dbServices';
import { DetailsSkeleton } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';

const HackathonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trainers, defaultRate, refreshTrainers } = useApp();
  
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [savingAllocations, setSavingAllocations] = useState(false);

  // Status Dialog State
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState('');

  // Allocation mapping state
  // Key format: 'YearName_BranchName_SectionName'
  // Value: { trainer_id, payment_amount }
  const [allocationsMap, setAllocationsMap] = useState({});

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await hackathonService.getById(id);
      setHackathon(data);
      
      // Initialize allocations map from loaded allocations
      const map = {};
      data.allocations.forEach(alloc => {
        const key = `${alloc.branch_name}_${alloc.section_name}`;
        // Wait, allocations in our DB don't explicitly store year_id inside allocations, 
        // they store trainer_id, hackathon_id, branch_name, section_name.
        // We will match them by branch_name and section_name!
        // To be safe, let's map using branch_name and section_name.
        map[key] = {
          trainer_id: alloc.trainer_id,
          payment_amount: alloc.payment_amount
        };
      });
      setAllocationsMap(map);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load hackathon details');
      navigate('/hackathons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    if (trainers.length === 0) {
      refreshTrainers();
    }
  }, [id]);

  // Generate sections list based on Year & Branch structure
  const flatSections = useMemo(() => {
    if (!hackathon || !hackathon.years) return [];
    
    const sections = [];
    hackathon.years.forEach(year => {
      year.branches.forEach(branch => {
        for (let i = 0; i < branch.section_count; i++) {
          const sectionLetter = String.fromCharCode(65 + i); // 65 is 'A'
          sections.push({
            year_name: year.year_name,
            branch_name: branch.branch_name,
            section_name: sectionLetter,
            key: `${branch.branch_name}_${sectionLetter}`
          });
        }
      });
    });
    return sections;
  }, [hackathon]);

  // Compute summary metrics
  const summary = useMemo(() => {
    if (flatSections.length === 0) return { total: 0, allocated: 0, pending: 0, trainerCount: 0 };
    
    let allocated = 0;
    const trainerIds = new Set();
    
    flatSections.forEach(sec => {
      const alloc = allocationsMap[sec.key];
      if (alloc && alloc.trainer_id) {
        allocated++;
        trainerIds.add(alloc.trainer_id);
      }
    });

    return {
      total: flatSections.length,
      allocated,
      pending: flatSections.length - allocated,
      trainerCount: trainerIds.size
    };
  }, [flatSections, allocationsMap]);

  const handleTrainerChange = (sectionKey, trainerId) => {
    setAllocationsMap(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        trainer_id: trainerId,
        payment_amount: prev[sectionKey]?.payment_amount || defaultRate
      }
    }));
  };

  const handlePaymentChange = (sectionKey, amount) => {
    setAllocationsMap(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        payment_amount: parseFloat(amount) || 0
      }
    }));
  };

  const handleSaveAllocations = async () => {
    setSavingAllocations(true);
    try {
      // Build allocations payload array
      const allocationsList = [];
      Object.entries(allocationsMap).forEach(([sectionKey, val]) => {
        if (val && val.trainer_id) {
          const [branchName, sectionName] = sectionKey.split('_');
          allocationsList.push({
            trainer_id: val.trainer_id,
            branch_name: branchName,
            section_name: sectionName,
            payment_amount: val.payment_amount || defaultRate
          });
        }
      });

      await hackathonService.allocateTrainers(id, allocationsList, hackathon.campus_name);
      toast.success('Trainer allocations updated successfully!');
      setEditMode(false);
      await fetchDetails();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save allocations');
    } finally {
      setSavingAllocations(false);
    }
  };

  const handleChangeStatusClick = (nextStatus) => {
    setSelectedNextStatus(nextStatus);
    setStatusConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      await hackathonService.updateStatus(id, selectedNextStatus, hackathon.campus_name);
      toast.success(`Hackathon status updated to ${selectedNextStatus}`);
      setStatusConfirmOpen(false);
      await fetchDetails();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  const statusColors = {
    'Pending': 'bg-amber-100 text-amber-850 dark:bg-amber-950/30 dark:text-amber-400',
    'Allocation Done': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400',
    'In Progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400',
    'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs / Back button */}
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link to="/hackathons" className="hover:text-primary-500 transition-colors">Hackathons</Link>
        <FiChevronRight />
        <span className="text-slate-600 dark:text-slate-300">Hackathon Details</span>
      </div>

      {/* Main Header Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/10">
            {hackathon.campus_name[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-xl font-bold text-slate-850 dark:text-slate-100">{hackathon.campus_name}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider ${statusColors[hackathon.status]}`}>
                {hackathon.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center"><FiMapPin className="mr-1" /> {hackathon.location}</span>
              <span className="flex items-center"><FiCalendar className="mr-1" /> Scheduled: {new Date(hackathon.hackathon_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
            </div>
          </div>
        </div>

        {/* Action Status Menu */}
        <div className="flex flex-wrap items-center gap-3">
          {hackathon.status === 'Pending' && (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-1"
            >
              <FiPlus />
              <span>Allocate Trainers</span>
            </button>
          )}

          {hackathon.status === 'Allocation Done' && (
            <button
              onClick={() => handleChangeStatusClick('In Progress')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Start Hackathon (In Progress)
            </button>
          )}

          {hackathon.status === 'In Progress' && (
            <button
              onClick={() => handleChangeStatusClick('Completed')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              Mark Completed
            </button>
          )}
          
          {hackathon.status !== 'Completed' && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-655 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
            >
              Edit Allocations
            </button>
          )}
        </div>
      </div>

      {/* Grid: Campus POC details & Allocation summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact details Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Campus Contact</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
              <FiUser className="text-primary-500" />
              <div>
                <p className="font-semibold">{hackathon.contact_person}</p>
                <p className="text-xs text-slate-400">Point of Contact</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
              <FiPhone className="text-primary-500" />
              <div>
                <p className="font-semibold">{hackathon.contact_phone}</p>
                <p className="text-xs text-slate-400">POC Phone Number</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
              <FiCalendar className="text-primary-500" />
              <div>
                <p className="font-semibold">{new Date(hackathon.created_at).toLocaleDateString('en-IN')}</p>
                <p className="text-xs text-slate-400">Portal Created Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation Summary Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800 md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Allocation Summary</h3>

          <div className="grid grid-cols-3 gap-4 pt-1">
            <div className="text-center md:text-left">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{summary.trainerCount}</p>
              <p className="text-xs text-slate-450 mt-1 flex items-center justify-center md:justify-start"><FiUsers className="mr-1 text-primary-500" /> Total Trainers</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{summary.allocated}</p>
              <p className="text-xs text-slate-450 mt-1 flex items-center justify-center md:justify-start"><FiCheckCircle className="mr-1 text-emerald-500" /> Allocated Sections</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{summary.pending}</p>
              <p className="text-xs text-slate-450 mt-1 flex items-center justify-center md:justify-start"><FiRefreshCw className="mr-1 text-amber-500" /> Pending Sections</p>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Section Allocation Progress</span>
              <span>{summary.total > 0 ? Math.round((summary.allocated / summary.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary.total > 0 ? (summary.allocated / summary.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trainer Allocation Interface Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">
            {editMode ? 'Manage Section Allocations' : 'Allocated Campuses & Section List'}
          </h3>
          {editMode && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setEditMode(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-655 dark:text-slate-350 text-xs font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAllocations}
                disabled={savingAllocations}
                className="flex items-center space-x-1 px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {savingAllocations ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSave />
                    <span>Save Allocations</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {flatSections.length > 0 ? (
          <div className="space-y-6">
            {hackathon.years.map(year => (
              <div key={year.id} className="space-y-4">
                <h4 className="font-extrabold text-sm text-primary-600 dark:text-primary-400 tracking-wide uppercase">{year.year_name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {year.branches.map(branch => {
                    // Loop through sections for this branch
                    const branchSections = [];
                    for (let i = 0; i < branch.section_count; i++) {
                      const letter = String.fromCharCode(65 + i);
                      branchSections.push(letter);
                    }

                    return branchSections.map(secLetter => {
                      const key = `${branch.branch_name}_${secLetter}`;
                      const currentAlloc = allocationsMap[key];
                      const assignedTrainer = trainers.find(t => t.id === currentAlloc?.trainer_id);

                      return (
                        <div key={key} className="glass bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-805 dark:text-slate-200 text-sm">
                              {branch.branch_name} &bull; Section {secLetter}
                            </span>
                            {!editMode && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                assignedTrainer 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                              }`}>
                                {assignedTrainer ? 'Allocated' : 'Pending'}
                              </span>
                            )}
                          </div>

                          {editMode ? (
                            <div className="space-y-2.5">
                              {/* Trainer Select Dropdown */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Trainer</label>
                                <select
                                  value={currentAlloc?.trainer_id || ''}
                                  onChange={(e) => handleTrainerChange(key, e.target.value)}
                                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 transition-all"
                                >
                                  <option value="">-- Assign Trainer --</option>
                                  {trainers.filter(t => t.status !== 'Inactive').map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                                  ))}
                                </select>
                              </div>

                              {/* Custom Allocation Payment Rate */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fee per Section (₹)</label>
                                <input
                                  type="number"
                                  placeholder={defaultRate}
                                  value={currentAlloc?.payment_amount || ''}
                                  onChange={(e) => handlePaymentChange(key, e.target.value)}
                                  className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none text-slate-800 dark:text-slate-100 focus:border-primary-500 transition-all"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 pt-1">
                              {assignedTrainer ? (
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 font-bold flex items-center justify-center text-xs">
                                    {assignedTrainer.name[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Link to={`/trainers/${assignedTrainer.id}`} className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary-500 truncate block">
                                      {assignedTrainer.name}
                                    </Link>
                                    <p className="text-[10px] text-slate-400 truncate">{assignedTrainer.phone}</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-450 italic">No trainer assigned to this section</p>
                              )}

                              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs text-slate-400">
                                <span>Allocation Rate</span>
                                <span className="font-bold text-slate-655 dark:text-slate-300">₹{(currentAlloc?.payment_amount || defaultRate).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No branches registered" message="Please configure years and branches first." />
        )}
      </div>

      {/* Confirm Status Dialog */}
      <ConfirmDialog
        isOpen={statusConfirmOpen}
        title="Confirm Status Change"
        message={`Are you sure you want to transition this hackathon status to "${selectedNextStatus}"? Once updated, the timeline and statistics will adapt automatically.`}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusConfirmOpen(false)}
        type="primary"
        confirmText="Yes, Update Status"
      />
    </div>
  );
};

export default HackathonDetails;
