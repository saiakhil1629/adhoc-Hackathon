import { supabase, isMockMode, mockDB } from './supabase';

// Helper to log audit events
const logAuditEvent = async (action, details, performedBy = 'HR Admin') => {
  if (isMockMode) {
    mockDB.insert('audit_logs', { action, details, performed_by: performedBy });
  } else {
    try {
      await supabase.from('audit_logs').insert([{ action, details, performed_by: performedBy }]);
    } catch (e) {
      console.error('Audit logging failed', e);
    }
  }
};

export const hackathonService = {
  getAll: async () => {
    if (isMockMode) {
      const hackathons = mockDB.getTable('hackathons');
      const years = mockDB.getTable('hackathon_years');
      const branches = mockDB.getTable('hackathon_branches');
      const allocations = mockDB.getTable('trainer_allocations');

      return hackathons.map(h => {
        // Calculate allocations progress
        const hYears = years.filter(y => y.hackathon_id === h.id);
        const hBranches = branches.filter(b => hYears.some(y => y.id === b.year_id));
        const totalSections = hBranches.reduce((sum, b) => sum + b.section_count, 0);
        const hAllocations = allocations.filter(a => a.hackathon_id === h.id);
        
        return {
          ...h,
          total_sections: totalSections,
          allocated_sections: hAllocations.length,
          trainer_count: new Set(hAllocations.map(a => a.trainer_id)).size
        };
      }).sort((a, b) => {
        // Pending first, then In Progress, then Allocation Done, then Completed
        const statusWeight = { 'Pending': 1, 'Allocation Done': 2, 'In Progress': 3, 'Completed': 4 };
        return statusWeight[a.status] - statusWeight[b.status];
      });
    } else {
      const { data, error } = await supabase
        .from('hackathons')
        .select(`
          *,
          hackathon_years (
            id,
            hackathon_branches (
              section_count
            )
          ),
          trainer_allocations (
            trainer_id
          )
        `);
      
      if (error) throw error;
      
      return data.map(h => {
        let totalSections = 0;
        h.hackathon_years?.forEach(y => {
          y.hackathon_branches?.forEach(b => {
            totalSections += b.section_count;
          });
        });
        
        const allocatedSections = h.trainer_allocations?.length || 0;
        const trainers = new Set(h.trainer_allocations?.map(a => a.trainer_id) || []);

        return {
          ...h,
          total_sections: totalSections,
          allocated_sections: allocatedSections,
          trainer_count: trainers.size
        };
      }).sort((a, b) => {
        const statusWeight = { 'Pending': 1, 'Allocation Done': 2, 'In Progress': 3, 'Completed': 4 };
        return statusWeight[a.status] - statusWeight[b.status];
      });
    }
  },

  getById: async (id) => {
    if (isMockMode) {
      const hackathons = mockDB.getTable('hackathons');
      const hackathon = hackathons.find(h => h.id === id);
      if (!hackathon) throw new Error('Hackathon not found');

      const years = mockDB.getTable('hackathon_years').filter(y => y.hackathon_id === id);
      const branches = mockDB.getTable('hackathon_branches');
      
      const yearsWithBranches = years.map(y => ({
        ...y,
        branches: branches.filter(b => b.year_id === y.id)
      }));

      const allocations = mockDB.getTable('trainer_allocations').filter(a => a.hackathon_id === id);
      const trainers = mockDB.getTable('trainers');
      
      const allocationsWithTrainer = allocations.map(a => ({
        ...a,
        trainer: trainers.find(t => t.id === a.trainer_id)
      }));

      return {
        ...hackathon,
        years: yearsWithBranches,
        allocations: allocationsWithTrainer
      };
    } else {
      const { data, error } = await supabase
        .from('hackathons')
        .select(`
          *,
          hackathon_years (
            id,
            year_name,
            hackathon_branches (
              id,
              branch_name,
              section_count
            )
          ),
          trainer_allocations (
            id,
            trainer_id,
            branch_name,
            section_name,
            assigned_date,
            status,
            payment_amount,
            trainers (
              id,
              name,
              phone,
              email
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Map relations standardly
      const formattedAllocations = data.trainer_allocations?.map(a => ({
        ...a,
        trainer: a.trainers
      })) || [];

      const formattedYears = data.hackathon_years?.map(y => ({
        ...y,
        branches: y.hackathon_branches || []
      })) || [];

      return {
        ...data,
        years: formattedYears,
        allocations: formattedAllocations
      };
    }
  },

  create: async (hackathonData) => {
    const { campus_name, location, contact_person, contact_phone, hackathon_date, status, years } = hackathonData;
    
    if (isMockMode) {
      const hackathon = mockDB.insert('hackathons', {
        campus_name,
        location,
        contact_person,
        contact_phone,
        hackathon_date,
        status: status || 'Pending'
      });

      years.forEach(year => {
        const yr = mockDB.insert('hackathon_years', {
          hackathon_id: hackathon.id,
          year_name: year.year_name
        });

        year.branches.forEach(branch => {
          mockDB.insert('hackathon_branches', {
            year_id: yr.id,
            branch_name: branch.branch_name,
            section_count: parseInt(branch.section_count, 10)
          });
        });
      });

      await logAuditEvent('CREATE_HACKATHON', `Created Hackathon for ${campus_name}`);
      return hackathon;
    } else {
      // 1. Create hackathon
      const { data: hackathon, error: hErr } = await supabase
        .from('hackathons')
        .insert([{ campus_name, location, contact_person, contact_phone, hackathon_date, status: status || 'Pending' }])
        .select()
        .single();

      if (hErr) throw hErr;

      // 2. Create years and branches
      for (const year of years) {
        const { data: yr, error: yErr } = await supabase
          .from('hackathon_years')
          .insert([{ hackathon_id: hackathon.id, year_name: year.year_name }])
          .select()
          .single();

        if (yErr) throw yErr;

        const branchRecords = year.branches.map(b => ({
          year_id: yr.id,
          branch_name: b.branch_name,
          section_count: parseInt(b.section_count, 10)
        }));

        const { error: bErr } = await supabase
          .from('hackathon_branches')
          .insert(branchRecords);

        if (bErr) throw bErr;
      }

      await logAuditEvent('CREATE_HACKATHON', `Created Hackathon for ${campus_name}`);
      return hackathon;
    }
  },

  updateStatus: async (id, status, campusName) => {
    if (isMockMode) {
      const h = mockDB.update('hackathons', id, { status });
      await logAuditEvent('UPDATE_STATUS', `Marked hackathon ${campusName || id} as ${status}`);
      return h;
    } else {
      const { data, error } = await supabase
        .from('hackathons')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await logAuditEvent('UPDATE_STATUS', `Marked hackathon ${campusName || id} as ${status}`);
      return data;
    }
  },

  allocateTrainers: async (hackathonId, allocationsList, campusName) => {
    // allocationsList is an array of { trainer_id, branch_name, section_name, payment_amount }
    if (isMockMode) {
      // Clear old allocations for this hackathon
      const allAllocations = mockDB.getTable('trainer_allocations');
      const filtered = allAllocations.filter(a => a.hackathon_id !== hackathonId);
      
      // Add new ones
      const createdAllocations = allocationsList.map(item => ({
        id: crypto.randomUUID(),
        hackathon_id: hackathonId,
        trainer_id: item.trainer_id,
        branch_name: item.branch_name,
        section_name: item.section_name,
        payment_amount: parseFloat(item.payment_amount || 5000),
        assigned_date: new Date().toISOString().split('T')[0],
        status: 'Assigned'
      }));

      mockDB.setTable('trainer_allocations', [...filtered, ...createdAllocations]);

      // Update trainer statuses to 'On Assignment' if allocated
      const uniqueTrainerIds = [...new Set(allocationsList.map(a => a.trainer_id))];
      const trainers = mockDB.getTable('trainers');
      trainers.forEach(t => {
        if (uniqueTrainerIds.includes(t.id) && t.status !== 'Inactive') {
          t.status = 'On Assignment';
        }
      });
      mockDB.setTable('trainers', trainers);

      // Automatically update Hackathon Status to "Allocation Done" if it was "Pending"
      const hackathons = mockDB.getTable('hackathons');
      const hackathon = hackathons.find(h => h.id === hackathonId);
      if (hackathon && hackathon.status === 'Pending') {
        hackathon.status = 'Allocation Done';
        mockDB.setTable('hackathons', hackathons);
      }

      await logAuditEvent('ALLOCATE_TRAINER', `Allocated ${uniqueTrainerIds.length} trainers for ${campusName || 'campus'}`);
      return true;
    } else {
      // Real database execution
      // 1. Delete existing allocations
      const { error: delErr } = await supabase
        .from('trainer_allocations')
        .delete()
        .eq('hackathon_id', hackathonId);
      
      if (delErr) throw delErr;

      // 2. Insert new allocations
      if (allocationsList.length > 0) {
        const records = allocationsList.map(item => ({
          hackathon_id: hackathonId,
          trainer_id: item.trainer_id,
          branch_name: item.branch_name,
          section_name: item.section_name,
          payment_amount: parseFloat(item.payment_amount || 5000),
          assigned_date: new Date().toISOString().split('T')[0],
          status: 'Assigned'
        }));

        const { error: insErr } = await supabase
          .from('trainer_allocations')
          .insert(records);

        if (insErr) throw insErr;

        // Update trainer statuses
        const uniqueTrainerIds = [...new Set(allocationsList.map(a => a.trainer_id))];
        await supabase
          .from('trainers')
          .update({ status: 'On Assignment' })
          .in('id', uniqueTrainerIds)
          .neq('status', 'Inactive');
          
        // Update hackathon status
        const { data: h } = await supabase.from('hackathons').select('status').eq('id', hackathonId).single();
        if (h && h.status === 'Pending') {
          await supabase.from('hackathons').update({ status: 'Allocation Done' }).eq('id', hackathonId);
        }
      }

      await logAuditEvent('ALLOCATE_TRAINER', `Allocated trainers for ${campusName || 'campus'}`);
      return true;
    }
  }
};

export const trainerService = {
  getAll: async () => {
    if (isMockMode) {
      const trainers = mockDB.getTable('trainers');
      const allocations = mockDB.getTable('trainer_allocations');
      const hackathons = mockDB.getTable('hackathons');
      const transactions = mockDB.getTable('money_transactions');

      return trainers.map(t => {
        const tAllocations = allocations.filter(a => a.trainer_id === t.id);
        const tTransactions = transactions.filter(tx => tx.trainer_id === t.id);
        
        // Find current campus (active/in-progress allocation)
        let currentCampus = 'None';
        const activeAlloc = tAllocations.find(a => a.status !== 'Completed');
        if (activeAlloc) {
          const h = hackathons.find(hack => hack.id === activeAlloc.hackathon_id);
          if (h) currentCampus = h.campus_name;
        }

        // Assigned branches and sections info
        const assignedBranches = [...new Set(tAllocations.map(a => a.branch_name))];
        const assignedSections = tAllocations.map(a => `${a.branch_name} (${a.section_name})`);

        // Financial calculations
        const totalEarned = tAllocations.reduce((sum, a) => sum + parseFloat(a.payment_amount || 0), 0);
        const totalGiven = tTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

        return {
          ...t,
          current_campus: currentCampus,
          assigned_branches: assignedBranches,
          assigned_sections: assignedSections,
          total_money_given: totalGiven,
          remaining_balance: totalEarned - totalGiven,
          workload_count: tAllocations.filter(a => a.status !== 'Completed').length
        };
      });
    } else {
      const { data: trainers, error: tErr } = await supabase.from('trainers').select('*');
      if (tErr) throw tErr;

      const { data: allocations, error: aErr } = await supabase
        .from('trainer_allocations')
        .select('*, hackathons(campus_name)');
      if (aErr) throw aErr;

      const { data: transactions, error: txErr } = await supabase.from('money_transactions').select('*');
      if (txErr) throw txErr;

      return trainers.map(t => {
        const tAllocations = allocations.filter(a => a.trainer_id === t.id);
        const tTransactions = transactions.filter(tx => tx.trainer_id === t.id);

        let currentCampus = 'None';
        const activeAlloc = tAllocations.find(a => a.status !== 'Completed');
        if (activeAlloc && activeAlloc.hackathons) {
          currentCampus = activeAlloc.hackathons.campus_name;
        }

        const assignedBranches = [...new Set(tAllocations.map(a => a.branch_name))];
        const assignedSections = tAllocations.map(a => `${a.branch_name} (${a.section_name})`);

        const totalEarned = tAllocations.reduce((sum, a) => sum + parseFloat(a.payment_amount || 0), 0);
        const totalGiven = tTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

        return {
          ...t,
          current_campus: currentCampus,
          assigned_branches: assignedBranches,
          assigned_sections: assignedSections,
          total_money_given: totalGiven,
          remaining_balance: totalEarned - totalGiven,
          workload_count: tAllocations.filter(a => a.status !== 'Completed').length
        };
      });
    }
  },

  getById: async (id) => {
    if (isMockMode) {
      const trainers = mockDB.getTable('trainers');
      const trainer = trainers.find(t => t.id === id);
      if (!trainer) throw new Error('Trainer not found');

      const allocations = mockDB.getTable('trainer_allocations').filter(a => a.trainer_id === id);
      const hackathons = mockDB.getTable('hackathons');
      const transactions = mockDB.getTable('money_transactions').filter(tx => tx.trainer_id === id);

      const allocationsWithHackathon = allocations.map(a => {
        const h = hackathons.find(hack => hack.id === a.hackathon_id);
        return {
          ...a,
          hackathon: h
        };
      });

      const totalEarned = allocations.reduce((sum, a) => sum + parseFloat(a.payment_amount || 0), 0);
      const totalGiven = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

      // Timeline combines allocations and money payments, sorted by date DESC
      const timeline = [
        ...transactions.map(tx => ({
          id: tx.id,
          type: 'Payment',
          title: `Money Given - ₹${tx.amount}`,
          subtitle: `Purpose: ${tx.purpose} | Remarks: ${tx.remarks || 'None'}`,
          date: tx.date,
          amount: tx.amount,
          rawItem: tx
        })),
        ...allocationsWithHackathon.map(a => ({
          id: a.id,
          type: 'Allocation',
          title: `Allocated to ${a.hackathon?.campus_name || 'Hackathon'}`,
          subtitle: `Branch: ${a.branch_name} | Section: ${a.section_name} | Fee: ₹${a.payment_amount}`,
          date: a.assigned_date,
          status: a.status,
          rawItem: a
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        ...trainer,
        allocations: allocationsWithHackathon,
        transactions: transactions.sort((a, b) => new Date(b.date) - new Date(a.date)),
        timeline,
        money_summary: {
          total_earned: totalEarned,
          total_given: totalGiven,
          remaining_balance: totalEarned - totalGiven
        }
      };
    } else {
      const { data: trainer, error: tErr } = await supabase.from('trainers').select('*').eq('id', id).single();
      if (tErr) throw tErr;

      const { data: allocations, error: aErr } = await supabase
        .from('trainer_allocations')
        .select('*, hackathons(*)')
        .eq('trainer_id', id);
      if (aErr) throw aErr;

      const { data: transactions, error: txErr } = await supabase
        .from('money_transactions')
        .select('*')
        .eq('trainer_id', id)
        .order('date', { ascending: false });
      if (txErr) throw txErr;

      const formattedAllocations = allocations.map(a => ({
        ...a,
        hackathon: a.hackathons
      }));

      const totalEarned = allocations.reduce((sum, a) => sum + parseFloat(a.payment_amount || 0), 0);
      const totalGiven = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

      const timeline = [
        ...transactions.map(tx => ({
          id: tx.id,
          type: 'Payment',
          title: `Money Given - ₹${tx.amount}`,
          subtitle: `Purpose: ${tx.purpose} | Remarks: ${tx.remarks || 'None'}`,
          date: tx.date,
          amount: tx.amount,
          rawItem: tx
        })),
        ...formattedAllocations.map(a => ({
          id: a.id,
          type: 'Allocation',
          title: `Allocated to ${a.hackathon?.campus_name || 'Hackathon'}`,
          subtitle: `Branch: ${a.branch_name} | Section: ${a.section_name} | Fee: ₹${a.payment_amount}`,
          date: a.assigned_date,
          status: a.status,
          rawItem: a
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        ...trainer,
        allocations: formattedAllocations,
        transactions,
        timeline,
        money_summary: {
          total_earned: totalEarned,
          total_given: totalGiven,
          remaining_balance: totalEarned - totalGiven
        }
      };
    }
  },

  create: async (trainerData) => {
    if (isMockMode) {
      const record = mockDB.insert('trainers', trainerData);
      await logAuditEvent('CREATE_TRAINER', `Added new trainer: ${trainerData.name}`);
      return record;
    } else {
      const { data, error } = await supabase.from('trainers').insert([trainerData]).select().single();
      if (error) throw error;
      await logAuditEvent('CREATE_TRAINER', `Added new trainer: ${trainerData.name}`);
      return data;
    }
  },

  update: async (id, updates) => {
    if (isMockMode) {
      const record = mockDB.update('trainers', id, updates);
      await logAuditEvent('UPDATE_TRAINER', `Updated details for ${updates.name || id}`);
      return record;
    } else {
      const { data, error } = await supabase.from('trainers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      await logAuditEvent('UPDATE_TRAINER', `Updated details for ${updates.name || id}`);
      return data;
    }
  },

  uploadPhoto: async (trainerId, file) => {
    if (isMockMode) {
      // Mock upload returns local object URL or random photo
      const mockPhotoUrl = URL.createObjectURL(file);
      mockDB.update('trainers', trainerId, { photo_url: mockPhotoUrl });
      return mockPhotoUrl;
    } else {
      const fileExt = file.name.split('.').pop();
      const fileName = `${trainerId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trainer-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('trainer-photos')
        .getPublicUrl(filePath);

      await supabase.from('trainers').update({ photo_url: data.publicUrl }).eq('id', trainerId);
      return data.publicUrl;
    }
  }
};

export const moneyService = {
  getAll: async () => {
    if (isMockMode) {
      const transactions = mockDB.getTable('money_transactions');
      const trainers = mockDB.getTable('trainers');
      
      return transactions.map(tx => ({
        ...tx,
        trainer: trainers.find(t => t.id === tx.trainer_id)
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      const { data, error } = await supabase
        .from('money_transactions')
        .select('*, trainers(*)')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data.map(tx => ({
        ...tx,
        trainer: tx.trainers
      }));
    }
  },

  create: async (txData) => {
    const { trainer_id, amount, purpose, remarks, given_by, date } = txData;
    const cleanAmount = parseFloat(amount);

    if (isMockMode) {
      const tx = mockDB.insert('money_transactions', {
        trainer_id,
        amount: cleanAmount,
        purpose,
        remarks,
        given_by,
        date: date || new Date().toISOString().split('T')[0]
      });

      const trainer = mockDB.getTable('trainers').find(t => t.id === trainer_id);
      await logAuditEvent('GIVE_MONEY', `Transferred ₹${cleanAmount} to ${trainer?.name || 'trainer'} for ${purpose}`);
      return tx;
    } else {
      const { data, error } = await supabase
        .from('money_transactions')
        .insert([{
          trainer_id,
          amount: cleanAmount,
          purpose,
          remarks,
          given_by,
          date: date || new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();
      
      if (error) throw error;

      const { data: trainer } = await supabase.from('trainers').select('name').eq('id', trainer_id).single();
      await logAuditEvent('GIVE_MONEY', `Transferred ₹${cleanAmount} to ${trainer?.name || 'trainer'} for ${purpose}`);
      return data;
    }
  }
};

export const auditService = {
  getAll: async () => {
    if (isMockMode) {
      return mockDB.getTable('audit_logs').sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  }
};
