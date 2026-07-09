-- Supabase Schema for Adhoc Network Management Portal

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. hr_admins table (Custom Authentication & Approvals)
create table if not exists hr_admins (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique not null,
  password text not null, -- Plain text password for admin ease of approval/viewing
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. trainers table
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

-- 3. hackathons table
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

-- 4. hackathon_years table (e.g. 1st Year, 2nd Year, 3rd Year)
create table if not exists hackathon_years (
  id uuid primary key default uuid_generate_v4(),
  hackathon_id uuid references hackathons(id) on delete cascade not null,
  year_name text not null -- '1st Year', '2nd Year', '3rd Year'
);

-- 5. hackathon_branches table
create table if not exists hackathon_branches (
  id uuid primary key default uuid_generate_v4(),
  year_id uuid references hackathon_years(id) on delete cascade not null,
  branch_name text not null, -- 'CSE', 'AIML', 'ECE', 'CSD', etc.
  section_count integer not null default 1 check (section_count > 0)
);

-- 6. trainer_allocations table
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

-- 7. money_transactions table
create table if not exists money_transactions (
  id uuid primary key default uuid_generate_v4(),
  trainer_id uuid references trainers(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  purpose text not null, -- 'Travel', 'Food', 'Accommodation', 'Advance', 'Other'
  remarks text,
  given_by text not null, -- Name of HR Admin who gave it
  date date not null default current_date
);

-- 8. audit_logs table
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null, -- 'CREATE_HACKATHON', 'ALLOCATE_TRAINER', 'DEALLOCATE_TRAINER', 'GIVE_MONEY', 'UPDATE_STATUS'
  details text not null,
  performed_by text not null,
  created_at timestamptz not null default now()
);

-- Disable Row Level Security (RLS) on all tables to ensure public client operations succeed 
-- bypassing Supabase default JWT auth confirmations
alter table hr_admins disable row level security;
alter table trainers disable row level security;
alter table hackathons disable row level security;
alter table hackathon_years disable row level security;
alter table hackathon_branches disable row level security;
alter table trainer_allocations disable row level security;
alter table money_transactions disable row level security;
alter table audit_logs disable row level security;

-- Insert default approved administrator seed
insert into hr_admins (name, email, password, is_approved)
values ('Akhil (HR)', 'admin@aditya.ac.in', 'password123', true)
on conflict (email) do update set password = excluded.password, is_approved = true;
