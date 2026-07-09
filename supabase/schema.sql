-- Supabase Schema for Adhoc Network Management Portal

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. trainers table
create table if not exists trainers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text unique not null,
  address text,
  joining_date date not null default current_date,
  status text not null default 'Available', -- 'Available', 'On Assignment', 'Inactive'
  photo_url text,
  created_at timestamptz not null default now()
);

-- 2. hackathons table
create table if not exists hackathons (
  id uuid primary key default uuid_generate_v4(),
  campus_name text not null,
  location text not null,
  contact_person text not null,
  contact_phone text not null,
  hackathon_date date not null,
  status text not null default 'Pending', -- 'Pending', 'Allocation Done', 'In Progress', 'Completed'
  created_at timestamptz not null default now()
);

-- 3. hackathon_years table (e.g. 1st Year, 2nd Year, 3rd Year)
create table if not exists hackathon_years (
  id uuid primary key default uuid_generate_v4(),
  hackathon_id uuid references hackathons(id) on delete cascade not null,
  year_name text not null -- '1st Year', '2nd Year', '3rd Year'
);

-- 4. hackathon_branches table
create table if not exists hackathon_branches (
  id uuid primary key default uuid_generate_v4(),
  year_id uuid references hackathon_years(id) on delete cascade not null,
  branch_name text not null, -- 'CSE', 'AIML', 'ECE', 'CSD', etc.
  section_count integer not null default 1 check (section_count > 0)
);

-- 5. trainer_allocations table
create table if not exists trainer_allocations (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid references trainers(id) on delete cascade not null,
  hackathon_id uuid references hackathons(id) on delete cascade not null,
  branch_name text not null,
  section_name text not null, -- 'A', 'B', 'C', etc.
  assigned_date date not null default current_date,
  status text not null default 'Assigned', -- 'Assigned', 'In Progress', 'Completed'
  payment_amount numeric not null default 5000 check (payment_amount >= 0)
);

-- 6. money_transactions table
create table if not exists money_transactions (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid references trainers(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  purpose text not null, -- 'Travel', 'Food', 'Accommodation', 'Advance', 'Other'
  remarks text,
  given_by text not null, -- Name of HR Admin who gave it
  date date not null default current_date
);

-- 7. audit_logs table
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null, -- 'CREATE_HACKATHON', 'ALLOCATE_TRAINER', 'DEALLOCATE_TRAINER', 'GIVE_MONEY', 'UPDATE_STATUS'
  details text not null,
  performed_by text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security (RLS) Enablement
alter table trainers enable row level security;
alter table hackathons enable row level security;
alter table hackathon_years enable row level security;
alter table hackathon_branches enable row level security;
alter table trainer_allocations enable row level security;
alter table money_transactions enable row level security;
alter table audit_logs enable row level security;

-- Policies for HR Admin (Authenticated users only)
create policy "Allow authenticated users to read trainers" on trainers for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert trainers" on trainers for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update trainers" on trainers for update using (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete trainers" on trainers for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated users to read hackathons" on hackathons for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert hackathons" on hackathons for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update hackathons" on hackathons for update using (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete hackathons" on hackathons for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated users to read hackathon_years" on hackathon_years for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert hackathon_years" on hackathon_years for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update hackathon_years" on hackathon_years for update using (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete hackathon_years" on hackathon_years for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated users to read hackathon_branches" on hackathon_branches for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert hackathon_branches" on hackathon_branches for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update hackathon_branches" on hackathon_branches for update using (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete hackathon_branches" on hackathon_branches for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated users to read trainer_allocations" on trainer_allocations for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert trainer_allocations" on trainer_allocations for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update trainer_allocations" on trainer_allocations for update using (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete trainer_allocations" on trainer_allocations for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated users to read money_transactions" on money_transactions for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert money_transactions" on money_transactions for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update money_transactions" on money_transactions for update using (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete money_transactions" on money_transactions for delete using (auth.role() = 'authenticated');

create policy "Allow authenticated users to read audit_logs" on audit_logs for select using (auth.role() = 'authenticated');
create policy "Allow authenticated users to insert audit_logs" on audit_logs for insert with check (auth.role() = 'authenticated');
