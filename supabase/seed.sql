-- Seed Data for Technical Trainer Management Portal

-- Seed trainers
insert into trainers (id, name, phone, email, address, joining_date, status, photo_url) values
('t1111111-1111-1111-1111-111111111111', 'Venkatesh Prasad', '9876543210', 'venkatesh@aditya.ac.in', 'Surampalem, Andhra Pradesh', '2025-01-15', 'On Assignment', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'),
('t2222222-2222-2222-2222-222222222222', 'Ravi Shankar', '8765432109', 'ravishankar@aditya.ac.in', 'Kakinada, Andhra Pradesh', '2025-02-10', 'Available', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'),
('t3333333-3333-3333-3333-333333333333', 'Sai Kumar', '7654321098', 'saikumar@aditya.ac.in', 'Rajahmundry, Andhra Pradesh', '2025-03-01', 'On Assignment', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200'),
('t4444444-4444-4444-4444-444444444444', 'Ananya Sen', '6543210987', 'ananya@aditya.ac.in', 'Visakhapatnam, Andhra Pradesh', '2025-04-12', 'Available', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200');

-- Seed hackathons
-- 1st Hackathon: AEC (Completed)
insert into hackathons (id, campus_name, location, contact_person, contact_phone, hackathon_date, status, created_at) values
('h1111111-1111-1111-1111-111111111111', 'Aditya Engineering College (AEC)', 'Surampalem Campus, K-Block', 'Dr. K. Srinivas', '9440123456', '2026-06-15', 'Completed', '2026-06-01 10:00:00+00');

-- 2nd Hackathon: ACET (In Progress)
insert into hackathons (id, campus_name, location, contact_person, contact_phone, hackathon_date, status, created_at) values
('h2222222-2222-2222-2222-222222222222', 'Aditya College of Engineering & Technology (ACET)', 'Surampalem Campus, Ramanujan Bhavan', 'Prof. M. Rajesh', '9440234567', '2026-07-12', 'In Progress', '2026-07-01 09:00:00+00');

-- 3rd Hackathon: ACOE (Pending)
insert into hackathons (id, campus_name, location, contact_person, contact_phone, hackathon_date, status, created_at) values
('h3333333-3333-3333-3333-333333333333', 'Aditya College of Engineering (ACOE)', 'Surampalem Campus, Bill Gates Bhavan', 'Mr. S. V. Kumar', '9440345678', '2026-07-28', 'Pending', '2026-07-05 11:30:00+00');

-- Seed hackathon_years for AEC (Completed)
insert into hackathon_years (id, hackathon_id, year_name) values
('y1111111-1111-1111-1111-111111111111', 'h1111111-1111-1111-1111-111111111111', '1st Year'),
('y1111111-2222-2222-2222-222222222222', 'h1111111-1111-1111-1111-111111111111', '2nd Year');

-- Seed hackathon_branches for AEC (Completed)
insert into hackathon_branches (id, year_id, branch_name, section_count) values
('b1111111-1111-1111-1111-111111111111', 'y1111111-1111-1111-1111-111111111111', 'CSE', 2),
('b1111111-2222-2222-2222-222222222222', 'y1111111-1111-1111-1111-111111111111', 'ECE', 1),
('b1111111-3333-3333-3333-333333333333', 'y1111111-2222-2222-2222-222222222222', 'CSE', 2);

-- Seed hackathon_years for ACET (In Progress)
insert into hackathon_years (id, hackathon_id, year_name) values
('y2222222-1111-1111-1111-111111111111', 'h2222222-2222-2222-2222-222222222222', '1st Year'),
('y2222222-2222-2222-2222-222222222222', 'h2222222-2222-2222-2222-222222222222', '3rd Year');

-- Seed hackathon_branches for ACET (In Progress)
insert into hackathon_branches (id, year_id, branch_name, section_count) values
('b2222222-1111-1111-1111-111111111111', 'y2222222-1111-1111-1111-111111111111', 'CSE', 2),
('b2222222-2222-2222-2222-222222222222', 'y2222222-1111-1111-1111-111111111111', 'AIML', 1),
('b2222222-3333-3333-3333-333333333333', 'y2222222-2222-2222-2222-222222222222', 'CSE', 3);

-- Seed hackathon_years for ACOE (Pending)
insert into hackathon_years (id, hackathon_id, year_name) values
('y3333333-1111-1111-1111-111111111111', 'h3333333-3333-3333-3333-333333333333', '2nd Year');

-- Seed hackathon_branches for ACOE (Pending)
insert into hackathon_branches (id, year_id, branch_name, section_count) values
('b3333333-1111-1111-1111-111111111111', 'y3333333-1111-1111-1111-111111111111', 'CSE', 2);

-- Seed allocations for AEC (Completed)
insert into trainer_allocations (trainer_id, hackathon_id, branch_name, section_name, assigned_date, status, payment_amount) values
('t1111111-1111-1111-1111-111111111111', 'h1111111-1111-1111-1111-111111111111', 'CSE', 'A', '2026-06-14', 'Completed', 6000),
('t1111111-1111-1111-1111-111111111111', 'h1111111-1111-1111-1111-111111111111', 'CSE', 'B', '2026-06-14', 'Completed', 6000),
('t2222222-2222-2222-2222-222222222222', 'h1111111-1111-1111-1111-111111111111', 'ECE', 'A', '2026-06-14', 'Completed', 5000),
('t3333333-3333-3333-3333-333333333333', 'h1111111-1111-1111-1111-111111111111', 'CSE', 'A', '2026-06-14', 'Completed', 5000),
('t3333333-3333-3333-3333-333333333333', 'h1111111-1111-1111-1111-111111111111', 'CSE', 'B', '2026-06-14', 'Completed', 5000);

-- Seed allocations for ACET (In Progress)
insert into trainer_allocations (trainer_id, hackathon_id, branch_name, section_name, assigned_date, status, payment_amount) values
('t1111111-1111-1111-1111-111111111111', 'h2222222-2222-2222-2222-222222222222', 'CSE', 'A', '2026-07-11', 'In Progress', 6000),
('t1111111-1111-1111-1111-111111111111', 'h2222222-2222-2222-2222-222222222222', 'CSE', 'B', '2026-07-11', 'In Progress', 6000),
('t3333333-3333-3333-3333-333333333333', 'h2222222-2222-2222-2222-222222222222', 'AIML', 'A', '2026-07-11', 'In Progress', 5500);

-- Seed money transactions
insert into money_transactions (trainer_id, amount, purpose, remarks, given_by, date) values
('t1111111-1111-1111-1111-111111111111', 5000, 'Advance', 'Pre-hackathon advance payment', 'Akhil (HR)', '2026-06-10'),
('t1111111-1111-1111-1111-111111111111', 7000, 'Travel', 'Flight & local taxi fares reimbursed', 'Akhil (HR)', '2026-06-18'),
('t2222222-2222-2222-2222-222222222222', 5000, 'Food', 'Full meal allowance settlement', 'Suresh (HR)', '2026-06-19'),
('t3333333-3333-3333-3333-333333333333', 8000, 'Accommodation', 'Hotel room booking refund', 'Akhil (HR)', '2026-06-18'),
('t1111111-1111-1111-1111-111111111111', 6000, 'Accommodation', 'Hotel stay at Surampalem', 'Akhil (HR)', '2026-07-11');

-- Seed audit logs
insert into audit_logs (action, details, performed_by, created_at) values
('CREATE_HACKATHON', 'Created hackathon for Aditya Engineering College (AEC)', 'Akhil (HR)', '2026-06-01 10:00:00+00'),
('ALLOCATE_TRAINER', 'Allocated Venkatesh Prasad to AEC CSE Sec A & B', 'Akhil (HR)', '2026-06-14 09:00:00+00'),
('GIVE_MONEY', 'Transferred ₹5,000 to Venkatesh Prasad for Advance', 'Akhil (HR)', '2026-06-10 14:30:00+00'),
('UPDATE_STATUS', 'Marked hackathon AEC as Completed', 'Akhil (HR)', '2026-06-15 18:00:00+00'),
('CREATE_HACKATHON', 'Created hackathon for Aditya College of Engineering & Technology (ACET)', 'Akhil (HR)', '2026-07-01 09:00:00+00'),
('ALLOCATE_TRAINER', 'Allocated Venkatesh Prasad to ACET CSE Sec A & B', 'Akhil (HR)', '2026-07-11 08:30:00+00');
