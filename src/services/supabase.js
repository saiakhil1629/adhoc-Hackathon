import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we should use real Supabase or the mock database
export const isMockMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase');

// Log mode for developer convenience
console.log(`[Adhoc Network Management Portal] Running in ${isMockMode ? 'MOCK / LOCAL STORAGE' : 'REAL SUPABASE'} mode.`);

// Initialize real Supabase client (only if credentials are valid)
export const supabase = isMockMode ? null : createClient(supabaseUrl, supabaseAnonKey);

// --- MOCK DATABASE IMPLEMENTATION ---
// Pre-populated data mirroring our schema and seed file
const DEFAULT_TRAINERS = [
  {
    id: 't1111111-1111-1111-1111-111111111111',
    name: 'Venkatesh Prasad',
    phone: '9876543210',
    email: 'venkatesh@aditya.ac.in',
    address: 'Surampalem, Andhra Pradesh',
    joining_date: '2025-01-15',
    status: 'On Assignment',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    created_at: new Date('2025-01-15').toISOString()
  },
  {
    id: 't2222222-2222-2222-2222-222222222222',
    name: 'Ravi Shankar',
    phone: '8765432109',
    email: 'ravishankar@aditya.ac.in',
    address: 'Kakinada, Andhra Pradesh',
    joining_date: '2025-02-10',
    status: 'Available',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    created_at: new Date('2025-02-10').toISOString()
  },
  {
    id: 't3333333-3333-3333-3333-333333333333',
    name: 'Sai Kumar',
    phone: '7654321098',
    email: 'saikumar@aditya.ac.in',
    address: 'Rajahmundry, Andhra Pradesh',
    joining_date: '2025-03-01',
    status: 'On Assignment',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    created_at: new Date('2025-03-01').toISOString()
  },
  {
    id: 't4444444-4444-4444-4444-444444444444',
    name: 'Ananya Sen',
    phone: '6543210987',
    email: 'ananya@aditya.ac.in',
    address: 'Visakhapatnam, Andhra Pradesh',
    joining_date: '2025-04-12',
    status: 'Available',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    created_at: new Date('2025-04-12').toISOString()
  }
];

const DEFAULT_HACKATHONS = [
  {
    id: 'h1111111-1111-1111-1111-111111111111',
    campus_name: 'Aditya Engineering College (AEC)',
    location: 'Surampalem Campus, K-Block',
    contact_person: 'Dr. K. Srinivas',
    contact_phone: '9440123456',
    hackathon_date: '2026-06-15',
    status: 'Completed',
    created_at: '2026-06-01T10:00:00.000Z'
  },
  {
    id: 'h2222222-2222-2222-2222-222222222222',
    campus_name: 'Aditya College of Engineering & Technology (ACET)',
    location: 'Surampalem Campus, Ramanujan Bhavan',
    contact_person: 'Prof. M. Rajesh',
    contact_phone: '9440234567',
    hackathon_date: '2026-07-12',
    status: 'In Progress',
    created_at: '2026-07-01T09:00:00.000Z'
  },
  {
    id: 'h3333333-3333-3333-3333-333333333333',
    campus_name: 'Aditya College of Engineering (ACOE)',
    location: 'Surampalem Campus, Bill Gates Bhavan',
    contact_person: 'Mr. S. V. Kumar',
    contact_phone: '9440345678',
    hackathon_date: '2026-07-28',
    status: 'Pending',
    created_at: '2026-07-05T11:30:00.000Z'
  }
];

const DEFAULT_YEARS = [
  { id: 'y1111111-1111-1111-1111-111111111111', hackathon_id: 'h1111111-1111-1111-1111-111111111111', year_name: '1st Year' },
  { id: 'y1111111-2222-2222-2222-222222222222', hackathon_id: 'h1111111-1111-1111-1111-111111111111', year_name: '2nd Year' },
  { id: 'y2222222-1111-1111-1111-111111111111', hackathon_id: 'h2222222-2222-2222-2222-222222222222', year_name: '1st Year' },
  { id: 'y2222222-2222-2222-2222-222222222222', hackathon_id: 'h2222222-2222-2222-2222-222222222222', year_name: '3rd Year' },
  { id: 'y3333333-1111-1111-1111-111111111111', hackathon_id: 'h3333333-3333-3333-3333-333333333333', year_name: '2nd Year' }
];

const DEFAULT_BRANCHES = [
  { id: 'b1111111-1111-1111-1111-111111111111', year_id: 'y1111111-1111-1111-1111-111111111111', branch_name: 'CSE', section_count: 2 },
  { id: 'b1111111-2222-2222-2222-222222222222', year_id: 'y1111111-1111-1111-1111-111111111111', branch_name: 'ECE', section_count: 1 },
  { id: 'b1111111-3333-3333-3333-333333333333', year_id: 'y1111111-2222-2222-2222-222222222222', branch_name: 'CSE', section_count: 2 },
  { id: 'b2222222-1111-1111-1111-111111111111', year_id: 'y2222222-1111-1111-1111-111111111111', branch_name: 'CSE', section_count: 2 },
  { id: 'b2222222-2222-2222-2222-222222222222', year_id: 'y2222222-1111-1111-1111-111111111111', branch_name: 'AIML', section_count: 1 },
  { id: 'b2222222-3333-3333-3333-333333333333', year_id: 'y2222222-2222-2222-2222-222222222222', branch_name: 'CSE', section_count: 3 },
  { id: 'b3333333-1111-1111-1111-111111111111', year_id: 'y3333333-1111-1111-1111-111111111111', branch_name: 'CSE', section_count: 2 }
];

const DEFAULT_ALLOCATIONS = [
  { id: 'a1', trainer_id: 't1111111-1111-1111-1111-111111111111', hackathon_id: 'h1111111-1111-1111-1111-111111111111', branch_name: 'CSE', section_name: 'A', assigned_date: '2026-06-14', status: 'Completed', payment_amount: 6000 },
  { id: 'a2', trainer_id: 't1111111-1111-1111-1111-111111111111', hackathon_id: 'h1111111-1111-1111-1111-111111111111', branch_name: 'CSE', section_name: 'B', assigned_date: '2026-06-14', status: 'Completed', payment_amount: 6000 },
  { id: 'a3', trainer_id: 't2222222-2222-2222-2222-222222222222', hackathon_id: 'h1111111-1111-1111-1111-111111111111', branch_name: 'ECE', section_name: 'A', assigned_date: '2026-06-14', status: 'Completed', payment_amount: 5000 },
  { id: 'a4', trainer_id: 't3333333-3333-3333-3333-333333333333', hackathon_id: 'h1111111-1111-1111-1111-111111111111', branch_name: 'CSE', section_name: 'A', assigned_date: '2026-06-14', status: 'Completed', payment_amount: 5000 },
  { id: 'a5', trainer_id: 't3333333-3333-3333-3333-333333333333', hackathon_id: 'h1111111-1111-1111-1111-111111111111', branch_name: 'CSE', section_name: 'B', assigned_date: '2026-06-14', status: 'Completed', payment_amount: 5000 },
  { id: 'a6', trainer_id: 't1111111-1111-1111-1111-111111111111', hackathon_id: 'h2222222-2222-2222-2222-222222222222', branch_name: 'CSE', section_name: 'A', assigned_date: '2026-07-11', status: 'In Progress', payment_amount: 6000 },
  { id: 'a7', trainer_id: 't1111111-1111-1111-1111-111111111111', hackathon_id: 'h2222222-2222-2222-2222-222222222222', branch_name: 'CSE', section_name: 'B', assigned_date: '2026-07-11', status: 'In Progress', payment_amount: 6000 },
  { id: 'a8', trainer_id: 't3333333-3333-3333-3333-333333333333', hackathon_id: 'h2222222-2222-2222-2222-222222222222', branch_name: 'AIML', section_name: 'A', assigned_date: '2026-07-11', status: 'In Progress', payment_amount: 5500 }
];

const DEFAULT_TRANSACTIONS = [
  { id: 'tx1', trainer_id: 't1111111-1111-1111-1111-111111111111', amount: 5000, purpose: 'Advance', remarks: 'Pre-hackathon advance payment', given_by: 'Akhil (HR)', date: '2026-06-10' },
  { id: 'tx2', trainer_id: 't1111111-1111-1111-1111-111111111111', amount: 7000, purpose: 'Travel', remarks: 'Flight & local taxi fares reimbursed', given_by: 'Akhil (HR)', date: '2026-06-18' },
  { id: 'tx3', trainer_id: 't2222222-2222-2222-2222-222222222222', amount: 5000, purpose: 'Food', remarks: 'Full meal allowance settlement', given_by: 'Suresh (HR)', date: '2026-06-19' },
  { id: 'tx4', trainer_id: 't3333333-3333-3333-3333-333333333333', amount: 8000, purpose: 'Accommodation', remarks: 'Hotel room booking refund', given_by: 'Akhil (HR)', date: '2026-06-18' },
  { id: 'tx5', trainer_id: 't1111111-1111-1111-1111-111111111111', amount: 6000, purpose: 'Accommodation', remarks: 'Hotel stay at Surampalem', given_by: 'Akhil (HR)', date: '2026-07-11' }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 'l1', action: 'CREATE_HACKATHON', details: 'Created hackathon for Aditya Engineering College (AEC)', performed_by: 'Akhil (HR)', created_at: '2026-06-01T10:00:00.000Z' },
  { id: 'l2', action: 'ALLOCATE_TRAINER', details: 'Allocated Venkatesh Prasad to AEC CSE Sec A & B', performed_by: 'Akhil (HR)', created_at: '2026-06-14T09:00:00.000Z' },
  { id: 'l3', action: 'GIVE_MONEY', details: 'Transferred ₹5,000 to Venkatesh Prasad for Advance', performed_by: 'Akhil (HR)', created_at: '2026-06-10T14:30:00.000Z' },
  { id: 'l4', action: 'UPDATE_STATUS', details: 'Marked hackathon AEC as Completed', performed_by: 'Akhil (HR)', created_at: '2026-06-15T18:00:00.000Z' },
  { id: 'l5', action: 'CREATE_HACKATHON', details: 'Created hackathon for Aditya College of Engineering & Technology (ACET)', performed_by: 'Akhil (HR)', created_at: '2026-07-01T09:00:00.000Z' },
  { id: 'l6', action: 'ALLOCATE_TRAINER', details: 'Allocated Venkatesh Prasad to ACET CSE Sec A & B', performed_by: 'Akhil (HR)', created_at: '2026-07-11T08:30:00.000Z' }
];

// Helper to initialize localStorage with defaults if empty
const initLocalStorage = () => {
  if (!localStorage.getItem('tt_trainers')) localStorage.setItem('tt_trainers', JSON.stringify(DEFAULT_TRAINERS));
  if (!localStorage.getItem('tt_hackathons')) localStorage.setItem('tt_hackathons', JSON.stringify(DEFAULT_HACKATHONS));
  if (!localStorage.getItem('tt_hackathon_years')) localStorage.setItem('tt_hackathon_years', JSON.stringify(DEFAULT_YEARS));
  if (!localStorage.getItem('tt_hackathon_branches')) localStorage.setItem('tt_hackathon_branches', JSON.stringify(DEFAULT_BRANCHES));
  if (!localStorage.getItem('tt_trainer_allocations')) localStorage.setItem('tt_trainer_allocations', JSON.stringify(DEFAULT_ALLOCATIONS));
  if (!localStorage.getItem('tt_money_transactions')) localStorage.setItem('tt_money_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
  if (!localStorage.getItem('tt_audit_logs')) localStorage.setItem('tt_audit_logs', JSON.stringify(DEFAULT_AUDIT_LOGS));
  if (!localStorage.getItem('tt_session')) {
    // Keep it empty initially to represent logged out state
    localStorage.setItem('tt_session', 'null');
  }
};

if (isMockMode) {
  initLocalStorage();
}

// High fidelity Mock DB Client
export const mockDB = {
  // Authentication Mock
  auth: {
    signIn: async (email, password) => {
      // Mock validation
      if (email && password.length >= 6) {
        const user = { id: 'u111-hr-admin', email, role: 'HR Admin', user_metadata: { name: 'Akhil' } };
        localStorage.setItem('tt_session', JSON.stringify(user));
        return { data: { user, session: { access_token: 'mock-token-abc' } }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials. Password must be at least 6 characters.' } };
    },
    signUp: async (email, password, options) => {
      if (email && password.length >= 6) {
        const name = options?.data?.name || 'HR Admin';
        const user = { id: crypto.randomUUID(), email, role: 'HR Admin', user_metadata: { name } };
        localStorage.setItem('tt_session', JSON.stringify(user));
        return { data: { user, session: { access_token: 'mock-token-abc' } }, error: null };
      }
      return { data: null, error: { message: 'Password must be at least 6 characters.' } };
    },
    signOut: async () => {
      localStorage.setItem('tt_session', 'null');
      return { error: null };
    },
    getUser: async () => {
      const session = localStorage.getItem('tt_session');
      const user = session ? JSON.parse(session) : null;
      return { data: { user }, error: null };
    }
  },

  // Generic DB methods
  getTable: (tableName) => {
    return JSON.parse(localStorage.getItem(`tt_${tableName}`) || '[]');
  },

  setTable: (tableName, data) => {
    localStorage.setItem(`tt_${tableName}`, JSON.stringify(data));
  },

  insert: (tableName, record) => {
    const data = mockDB.getTable(tableName);
    const newRecord = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...record };
    data.push(newRecord);
    mockDB.setTable(tableName, data);
    return newRecord;
  },

  update: (tableName, id, updates) => {
    const data = mockDB.getTable(tableName);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      mockDB.setTable(tableName, data);
      return data[index];
    }
    return null;
  },

  delete: (tableName, id) => {
    const data = mockDB.getTable(tableName);
    const filtered = data.filter(item => item.id !== id);
    mockDB.setTable(tableName, filtered);
    return true;
  }
};
