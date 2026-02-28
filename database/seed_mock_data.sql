-- DEVELOPMENT SEED DATA ONLY
-- Run: psql [connection_string] -f seed_mock_data.sql
-- Safe to re-run (uses ON CONFLICT DO NOTHING)
-- Do NOT run in production

SET session_replication_role = replica;

-- ============================================================
-- CREATE learning_modules table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  duration_minutes INT,
  slug TEXT UNIQUE,
  content_url TEXT,
  published_at TIMESTAMPTZ,
  prerequisites JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Seeding auth.users
-- ============================================================
-- Users 1-20 (real user accounts)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
('00000000-0000-0000-0000-000000000001', 'tan.weiming@gmail.com', '', NOW(), '2023-03-15 00:00:00+00', '2024-01-10 00:00:00+00', '{"name":"Tan Wei Ming","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000002', 'chen.meiling@gmail.com', '', NOW(), '2023-03-16 00:00:00+00', '2024-01-11 00:00:00+00', '{"name":"Chen Mei Ling","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000003', 'lim.jiahui@gmail.com', '', NOW(), '2023-04-20 00:00:00+00', '2024-02-05 00:00:00+00', '{"name":"Lim Jia Hui","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000004', 'wong.zixuan@gmail.com', '', NOW(), '2023-04-21 00:00:00+00', '2024-02-06 00:00:00+00', '{"name":"Wong Zi Xuan","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000005', 'ng.kaiwen@gmail.com', '', NOW(), '2023-05-10 00:00:00+00', '2024-03-01 00:00:00+00', '{"name":"Ng Kai Wen","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000006', 'ahmad.rizwan@gmail.com', '', NOW(), '2023-06-01 00:00:00+00', '2024-04-15 00:00:00+00', '{"name":"Ahmad Rizwan Bin Ismail","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000007', 'siti.rahimah@gmail.com', '', NOW(), '2023-06-02 00:00:00+00', '2024-04-16 00:00:00+00', '{"name":"Siti Rahimah Binte Aziz","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000008', 'muhammad.farid@gmail.com', '', NOW(), '2023-06-03 00:00:00+00', '2024-04-17 00:00:00+00', '{"name":"Muhammad Farid Bin Hassan","role":"buyer"}'::jsonb),
('00000000-0000-0000-0000-000000000009', 'nurul.ain@gmail.com', '', NOW(), '2023-07-10 00:00:00+00', '2024-05-20 00:00:00+00', '{"name":"Nurul Ain Binte Omar","role":"seller"}'::jsonb),
('00000000-0000-0000-0000-000000000010', 'priya.nair@gmail.com', '', NOW(), '2023-08-05 00:00:00+00', '2024-06-01 00:00:00+00', '{"name":"Priya Nair","role":"seller"}'::jsonb),
('00000000-0000-0000-0000-000000000011', 'raj.kumar@gmail.com', '', NOW(), '2023-09-12 00:00:00+00', '2024-07-08 00:00:00+00', '{"name":"Raj Kumar Pillai","role":"seller"}'::jsonb),
('00000000-0000-0000-0000-000000000012', 'deepa.krishna@gmail.com', '', NOW(), '2023-10-01 00:00:00+00', '2024-08-05 00:00:00+00', '{"name":"Deepa Krishnamurthy","role":"seller"}'::jsonb),
('00000000-0000-0000-0000-000000000013', 'arjun.subram@gmail.com', '', NOW(), '2023-11-05 00:00:00+00', '2024-09-01 00:00:00+00', '{"name":"Arjun Subramaniam","role":"renter"}'::jsonb),
('00000000-0000-0000-0000-000000000014', 'james.mitchell@outlook.com', '', NOW(), '2023-11-20 00:00:00+00', '2024-09-15 00:00:00+00', '{"name":"James Mitchell","role":"renter"}'::jsonb),
('00000000-0000-0000-0000-000000000015', 'emma.wilson@gmail.com', '', NOW(), '2023-12-01 00:00:00+00', '2024-10-01 00:00:00+00', '{"name":"Emma Wilson","role":"renter"}'::jsonb),
('00000000-0000-0000-0000-000000000016', 'hans.mueller@gmail.com', '', NOW(), '2023-05-22 00:00:00+00', '2024-02-28 00:00:00+00', '{"name":"Hans Mueller","role":"owner"}'::jsonb),
('00000000-0000-0000-0000-000000000017', 'sarah.chenokafor@gmail.com', '', NOW(), '2023-06-15 00:00:00+00', '2024-03-10 00:00:00+00', '{"name":"Sarah Chen-Okafor","role":"owner"}'::jsonb),
('00000000-0000-0000-0000-000000000018', 'david.teo@propnex.com', '', NOW(), '2022-01-10 00:00:00+00', '2024-11-01 00:00:00+00', '{"name":"David Teo","role":"agent"}'::jsonb),
('00000000-0000-0000-0000-000000000019', 'melissa.goh@propnex.com', '', NOW(), '2022-03-15 00:00:00+00', '2024-11-15 00:00:00+00', '{"name":"Melissa Goh","role":"agent"}'::jsonb),
('00000000-0000-0000-0000-000000000020', 'kevin.ong@era.com.sg', '', NOW(), '2021-08-20 00:00:00+00', '2024-12-01 00:00:00+00', '{"name":"Kevin Ong","role":"agent"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Synthetic agent profiles (agent-004 to agent-012)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
('00000000-0000-0000-0001-000000000004', 'tan.boonkiat@era.com.sg', '', NOW(), '2022-05-10 00:00:00+00', NOW(), '{"name":"Tan Boon Kiat","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000005', 'lim.xiuying@orangetee.com', '', NOW(), '2020-08-15 00:00:00+00', NOW(), '{"name":"Lim Xiu Ying","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000006', 'haziq@orangetee.com', '', NOW(), '2021-04-20 00:00:00+00', NOW(), '{"name":"Mohamed Haziq","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000007', 'jessica.yeo@huttons.com', '', NOW(), '2022-02-28 00:00:00+00', NOW(), '{"name":"Jessica Yeo","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000008', 'rajesh.krishnan@huttons.com', '', NOW(), '2023-01-10 00:00:00+00', NOW(), '{"name":"Rajesh Krishnan","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000009', 'christine.lau@knightfrank.com', '', NOW(), '2019-06-15 00:00:00+00', NOW(), '{"name":"Christine Lau","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000010', 'alexander.tan@knightfrank.com', '', NOW(), '2018-03-20 00:00:00+00', NOW(), '{"name":"Alexander Tan","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000011', 'priscilla.wee@sri.com.sg', '', NOW(), '2020-11-30 00:00:00+00', NOW(), '{"name":"Priscilla Wee","role":"agent"}'::jsonb),
('00000000-0000-0000-0001-000000000012', 'daniel.koh@sri.com.sg', '', NOW(), '2023-05-15 00:00:00+00', NOW(), '{"name":"Daniel Koh","role":"agent"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Service provider profiles (sp-001 to sp-026, excluding AI agents)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
('00000000-0000-0000-0002-000000000001', 'property@rajahtann.com', '', NOW(), '2022-01-10 00:00:00+00', NOW(), '{"name":"Rajah and Tann Conveyancing","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000002', 'property@wongpartnership.com', '', NOW(), '2021-08-20 00:00:00+00', NOW(), '{"name":"WongPartnership Property Desk","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000003', 'property@allenandgledhill.com', '', NOW(), '2022-03-15 00:00:00+00', NOW(), '{"name":"Allen and Gledhill Residential","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000004', 'property@dentonsrodyk.com', '', NOW(), '2021-11-05 00:00:00+00', NOW(), '{"name":"Dentons Rodyk Conveyancing","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000005', 'hello@redbrick.sg', '', NOW(), '2022-06-01 00:00:00+00', NOW(), '{"name":"Redbrick Mortgage Advisory","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000006', 'enquiry@mortgagemaster.sg', '', NOW(), '2023-01-15 00:00:00+00', NOW(), '{"name":"MortgageMaster SG","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000007', 'finance@propertygenie.sg', '', NOW(), '2023-04-10 00:00:00+00', NOW(), '{"name":"PropertyGenie Finance","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000008', 'help@homeloanexperts.sg', '', NOW(), '2022-09-20 00:00:00+00', NOW(), '{"name":"HomeLoan Experts SG","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000009', 'jobs@fixitsg.com', '', NOW(), '2023-02-10 00:00:00+00', NOW(), '{"name":"FixIt SG","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000010', 'contact@drillhammer.sg', '', NOW(), '2023-05-15 00:00:00+00', NOW(), '{"name":"Drill and Hammer Works","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000011', 'urgent@quickfix.sg', '', NOW(), '2023-08-01 00:00:00+00', NOW(), '{"name":"QuickFix Contractors","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000012', 'hello@prohandyman.sg', '', NOW(), '2022-11-20 00:00:00+00', NOW(), '{"name":"ProHandyman SG","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000013', 'hello@scandic-studio.sg', '', NOW(), '2022-04-10 00:00:00+00', NOW(), '{"name":"Scandic Studio SG","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000014', 'projects@luxurylofts.sg', '', NOW(), '2021-09-01 00:00:00+00', NOW(), '{"name":"Luxury Lofts ID","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000015', 'enquiry@hdbmakeover.sg', '', NOW(), '2023-03-10 00:00:00+00', NOW(), '{"name":"HDB Makeover Specialists","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000016', 'design@minimalistspace.sg', '', NOW(), '2022-07-15 00:00:00+00', NOW(), '{"name":"The Minimalist Space","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000017', 'projects@wetworkssg.com', '', NOW(), '2023-01-20 00:00:00+00', NOW(), '{"name":"Wet Works SG","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000018', 'jobs@powerelectrical.sg', '', NOW(), '2022-08-05 00:00:00+00', NOW(), '{"name":"PowerElectrical Contractors","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000021', 'sarah.lim@propnex.mock', '', NOW(), '2021-05-15 00:00:00+00', NOW(), '{"name":"Sarah Lim","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000022', 'david.chen@era.mock', '', NOW(), '2022-02-10 00:00:00+00', NOW(), '{"name":"David Chen","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000023', 'sales@extraspace.sg', '', NOW(), '2021-10-01 00:00:00+00', NOW(), '{"name":"ExtraSpace Self Storage","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000024', 'hello@spaceship.sg', '', NOW(), '2022-11-15 00:00:00+00', NOW(), '{"name":"Spaceship Door-to-Door Storage","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000025', 'admin@shalom.sg', '', NOW(), '2021-08-20 00:00:00+00', NOW(), '{"name":"Shalom Movers","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0002-000000000026', 'info@lalamove.sg', '', NOW(), '2023-01-10 00:00:00+00', NOW(), '{"name":"Lalamove Large Vehicles","role":"service_provider"}'::jsonb)
ON CONFLICT DO NOTHING;

-- AI agent profiles (agent-aria, agent-rex, agent-vera, agent-feng)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
('00000000-0000-0000-0003-000000000001', 'aria@spacerealty.sg', '', NOW(), '2024-01-01 00:00:00+00', NOW(), '{"name":"Aria","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0003-000000000002', 'rex@spacerealty.sg', '', NOW(), '2024-01-01 00:00:00+00', NOW(), '{"name":"Rex","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0003-000000000003', 'vera@spacerealty.sg', '', NOW(), '2024-01-01 00:00:00+00', NOW(), '{"name":"Vera","role":"service_provider"}'::jsonb),
('00000000-0000-0000-0003-000000000004', 'feng@spacerealty.sg', '', NOW(), '2024-01-01 00:00:00+00', NOW(), '{"name":"Feng","role":"service_provider"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding profiles
-- ============================================================
INSERT INTO profiles (id, email, phone, role, residency_status, preferences, verification_badges, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'tan.weiming@gmail.com', '+6591234567', 'buyer', 'singapore_citizen',
 '{"mbti":"INTJ","baZiReading":{"dateOfBirth":"1985-04-12","timeOfBirth":"08:30","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["near MRT","good schools","quiet neighbourhood"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["mrt","school"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-03-15"}]'::jsonb,
 '2023-03-15 00:00:00+00', '2024-01-10 00:00:00+00'),
('00000000-0000-0000-0000-000000000002', 'chen.meiling@gmail.com', '+6592345678', 'buyer', 'singapore_citizen',
 '{"mbti":"ISFJ","baZiReading":{"dateOfBirth":"1987-08-22","timeOfBirth":"14:15","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["near MRT","good schools"],"likesHighFloor":false,"petFriendlyRequired":true,"proximityPriorities":["school","mall","clinic"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-03-16"}]'::jsonb,
 '2023-03-16 00:00:00+00', '2024-01-11 00:00:00+00'),
('00000000-0000-0000-0000-000000000003', 'lim.jiahui@gmail.com', '+6593456789', 'buyer', 'singapore_citizen',
 '{"mbti":"ENFP","baZiReading":{"dateOfBirth":"1990-11-05","timeOfBirth":"06:00","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["near MRT","pet-friendly"],"likesHighFloor":true,"petFriendlyRequired":true,"proximityPriorities":["mrt","park"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-04-20"}]'::jsonb,
 '2023-04-20 00:00:00+00', '2024-02-05 00:00:00+00'),
('00000000-0000-0000-0000-000000000004', 'wong.zixuan@gmail.com', '+6594567890', 'buyer', 'singapore_citizen',
 '{"mbti":"ESTJ","baZiReading":{"dateOfBirth":"1988-03-17","timeOfBirth":"20:45","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["large living area","good investment"],"likesHighFloor":false,"petFriendlyRequired":true,"proximityPriorities":["mrt","supermarket"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-04-21"}]'::jsonb,
 '2023-04-21 00:00:00+00', '2024-02-06 00:00:00+00'),
('00000000-0000-0000-0000-000000000005', 'ng.kaiwen@gmail.com', '+6595678901', 'buyer', 'singapore_citizen',
 '{"mbti":"INTP","baZiReading":{"dateOfBirth":"1982-07-30","timeOfBirth":"11:00","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["investment property","high rental yield"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["mrt","mall","school"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-05-10"}]'::jsonb,
 '2023-05-10 00:00:00+00', '2024-03-01 00:00:00+00'),
('00000000-0000-0000-0000-000000000006', 'ahmad.rizwan@gmail.com', '+6596789012', 'buyer', 'singapore_citizen',
 '{"mbti":"ENTJ","baZiReading":{"dateOfBirth":"1979-12-03","timeOfBirth":"07:30","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["near MRT","good schools","multi-gen friendly"],"likesHighFloor":false,"petFriendlyRequired":false,"proximityPriorities":["school","mrt","mosque"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-06-01"}]'::jsonb,
 '2023-06-01 00:00:00+00', '2024-04-15 00:00:00+00'),
('00000000-0000-0000-0000-000000000007', 'siti.rahimah@gmail.com', '+6597890123', 'buyer', 'singapore_citizen',
 '{"mbti":"ESFJ","baZiReading":{"dateOfBirth":"1981-09-14","timeOfBirth":"16:00","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["spacious kitchen","near school"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["school","supermarket"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-06-02"}]'::jsonb,
 '2023-06-02 00:00:00+00', '2024-04-16 00:00:00+00'),
('00000000-0000-0000-0000-000000000008', 'muhammad.farid@gmail.com', '+6598901234', 'buyer', 'singapore_citizen',
 '{"mbti":"ISTP","baZiReading":{"dateOfBirth":"2000-02-28","timeOfBirth":"22:15","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["affordable","near MRT"],"likesHighFloor":false,"petFriendlyRequired":false,"proximityPriorities":["mrt","hawker centre"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-06-03"}]'::jsonb,
 '2023-06-03 00:00:00+00', '2024-04-17 00:00:00+00'),
('00000000-0000-0000-0000-000000000009', 'nurul.ain@gmail.com', '+6581234567', 'seller', 'singapore_citizen',
 '{"mbti":"INFJ","baZiReading":{"dateOfBirth":"1983-05-20","timeOfBirth":"09:45","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["good resale value","central location"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["mrt","hospital"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-07-10"}]'::jsonb,
 '2023-07-10 00:00:00+00', '2024-05-20 00:00:00+00'),
('00000000-0000-0000-0000-000000000010', 'priya.nair@gmail.com', '+6582345678', 'seller', 'singapore_citizen',
 '{"mbti":"INFP","baZiReading":{"dateOfBirth":"1978-11-30","timeOfBirth":"03:30","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["good schools nearby","spacious"],"likesHighFloor":false,"petFriendlyRequired":true,"proximityPriorities":["school","park","clinic"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-08-05"}]'::jsonb,
 '2023-08-05 00:00:00+00', '2024-06-01 00:00:00+00'),
('00000000-0000-0000-0000-000000000011', 'raj.kumar@gmail.com', '+6583456789', 'seller', 'singapore_citizen',
 '{"mbti":"ENTP","baZiReading":{"dateOfBirth":"1975-06-08","timeOfBirth":"12:00","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["investment grade","near expressway"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["mrt","mall"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-09-12"}]'::jsonb,
 '2023-09-12 00:00:00+00', '2024-07-08 00:00:00+00'),
('00000000-0000-0000-0000-000000000012', 'deepa.krishna@gmail.com', '+6584567890', 'seller', 'singapore_citizen',
 '{"mbti":"ENFJ","baZiReading":{"dateOfBirth":"1980-02-14","timeOfBirth":"18:20","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["near MRT","good schools","East side"],"likesHighFloor":false,"petFriendlyRequired":true,"proximityPriorities":["school","mrt","park"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-10-01"}]'::jsonb,
 '2023-10-01 00:00:00+00', '2024-08-05 00:00:00+00'),
('00000000-0000-0000-0000-000000000013', 'arjun.subram@gmail.com', '+6585678901', 'renter', 'permanent_resident',
 '{"mbti":"ENTJ","baZiReading":{"dateOfBirth":"1992-09-25","timeOfBirth":"10:30","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["furnished","near MRT","modern kitchen"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["mrt","mall","gym"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-11-05"}]'::jsonb,
 '2023-11-05 00:00:00+00', '2024-09-01 00:00:00+00'),
('00000000-0000-0000-0000-000000000014', 'james.mitchell@outlook.com', '+6586789012', 'renter', 'permanent_resident',
 '{"mbti":"ISTJ","baZiReading":{"dateOfBirth":"1986-04-11","timeOfBirth":"07:00","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["expat-friendly","near international school","pool and gym"],"likesHighFloor":false,"petFriendlyRequired":true,"proximityPriorities":["school","mall","park"]}'::jsonb,
 '[{"type":"singpass","label":"Singpass Verified","issuedAt":"2023-11-20"}]'::jsonb,
 '2023-11-20 00:00:00+00', '2024-09-15 00:00:00+00'),
('00000000-0000-0000-0000-000000000015', 'emma.wilson@gmail.com', '+6587890123', 'renter', 'permanent_resident',
 '{"mbti":"ESFP","baZiReading":{"dateOfBirth":"1991-07-19","timeOfBirth":"13:45","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["bright and airy","near park","pet-friendly"],"likesHighFloor":true,"petFriendlyRequired":true,"proximityPriorities":["park","mrt","supermarket"]}'::jsonb,
 '[]'::jsonb,
 '2023-12-01 00:00:00+00', '2024-10-01 00:00:00+00'),
('00000000-0000-0000-0000-000000000016', 'hans.mueller@gmail.com', '+6588901234', 'owner', 'permanent_resident',
 '{"mbti":"INTJ","baZiReading":{"dateOfBirth":"1974-10-05","timeOfBirth":"05:15","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["freehold","high capital appreciation"],"likesHighFloor":false,"petFriendlyRequired":false,"proximityPriorities":["expressway","mall"]}'::jsonb,
 '[]'::jsonb,
 '2023-05-22 00:00:00+00', '2024-02-28 00:00:00+00'),
('00000000-0000-0000-0000-000000000017', 'sarah.chenokafor@gmail.com', '+6589012345', 'owner', 'permanent_resident',
 '{"mbti":"ISFP","baZiReading":{"dateOfBirth":"1989-01-26","timeOfBirth":"19:00","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["garden","landed","quiet estate"],"likesHighFloor":false,"petFriendlyRequired":true,"proximityPriorities":["school","park"]}'::jsonb,
 '[]'::jsonb,
 '2023-06-15 00:00:00+00', '2024-03-10 00:00:00+00'),
('00000000-0000-0000-0000-000000000018', 'david.teo@propnex.com', '+6590123456', 'agent', 'foreigner',
 '{"mbti":"ESTP","baZiReading":{"dateOfBirth":"1984-06-30","timeOfBirth":"08:00","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["high transaction volume areas","new launches"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["mrt","mall"]}'::jsonb,
 '[]'::jsonb,
 '2022-01-10 00:00:00+00', '2024-11-01 00:00:00+00'),
('00000000-0000-0000-0000-000000000019', 'melissa.goh@propnex.com', '+6591234568', 'agent', 'foreigner',
 '{"mbti":"ESFJ","baZiReading":{"dateOfBirth":"1987-03-18","timeOfBirth":"14:00","locationOfBirth":"Singapore","gender":"female"},"propertyPreferences":["HDB resale","East Singapore"],"likesHighFloor":false,"petFriendlyRequired":false,"proximityPriorities":["school","mrt"]}'::jsonb,
 '[]'::jsonb,
 '2022-03-15 00:00:00+00', '2024-11-15 00:00:00+00'),
('00000000-0000-0000-0000-000000000020', 'kevin.ong@era.com.sg', '+6592345679', 'agent', 'foreigner',
 '{"mbti":"ENTP","baZiReading":{"dateOfBirth":"1980-12-07","timeOfBirth":"11:30","locationOfBirth":"Singapore","gender":"male"},"propertyPreferences":["luxury condos","D09 D10 D11","investment"],"likesHighFloor":true,"petFriendlyRequired":false,"proximityPriorities":["mrt","expressway","mall"]}'::jsonb,
 '[]'::jsonb,
 '2021-08-20 00:00:00+00', '2024-12-01 00:00:00+00')
ON CONFLICT DO NOTHING;

-- Synthetic agent profiles in profiles table
INSERT INTO profiles (id, email, phone, role, residency_status, preferences, verification_badges, created_at, updated_at) VALUES
('00000000-0000-0000-0001-000000000004', 'tan.boonkiat@era.com.sg', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2022-05-10 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000005', 'lim.xiuying@orangetee.com', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2020-08-15 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000006', 'haziq@orangetee.com', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2021-04-20 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000007', 'jessica.yeo@huttons.com', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2022-02-28 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000008', 'rajesh.krishnan@huttons.com', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2023-01-10 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000009', 'christine.lau@knightfrank.com', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2019-06-15 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000010', 'alexander.tan@knightfrank.com', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2018-03-20 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000011', 'priscilla.wee@sri.com.sg', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2020-11-30 00:00:00+00', NOW()),
('00000000-0000-0000-0001-000000000012', 'daniel.koh@sri.com.sg', NULL, 'agent', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2023-05-15 00:00:00+00', NOW())
ON CONFLICT DO NOTHING;

-- Service provider profiles
INSERT INTO profiles (id, email, phone, role, residency_status, preferences, verification_badges, created_at, updated_at) VALUES
('00000000-0000-0000-0002-000000000001', 'property@rajahtann.com', '+65 6535 3600', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-01-10 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000002', 'property@wongpartnership.com', '+65 6416 8000', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2021-08-20 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000003', 'property@allenandgledhill.com', '+65 6890 7188', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-03-15 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000004', 'property@dentonsrodyk.com', '+65 6225 2626', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2021-11-05 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000005', 'hello@redbrick.sg', '+65 6221 7788', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-06-01 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000006', 'enquiry@mortgagemaster.sg', '+65 8288 5566', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-01-15 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000007', 'finance@propertygenie.sg', '+65 6100 3344', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-04-10 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000008', 'help@homeloanexperts.sg', '+65 9111 2233', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-09-20 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000009', 'jobs@fixitsg.com', '+65 9234 5678', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-02-10 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000010', 'contact@drillhammer.sg', '+65 9345 6789', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-05-15 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000011', 'urgent@quickfix.sg', '+65 9456 7890', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-08-01 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000012', 'hello@prohandyman.sg', '+65 9567 8901', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-11-20 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000013', 'hello@scandic-studio.sg', '+65 6100 1234', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-04-10 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000014', 'projects@luxurylofts.sg', '+65 6223 4455', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2021-09-01 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000015', 'enquiry@hdbmakeover.sg', '+65 8122 3344', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-03-10 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000016', 'design@minimalistspace.sg', '+65 6100 5566', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-07-15 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000017', 'projects@wetworkssg.com', '+65 9678 9012', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-01-20 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000018', 'jobs@powerelectrical.sg', '+65 9789 0123', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-08-05 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000021', 'sarah.lim@propnex.mock', '+65 9111 2222', 'service_provider', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2021-05-15 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000022', 'david.chen@era.mock', '+65 9333 4444', 'service_provider', 'singapore_citizen', '{}'::jsonb, '[]'::jsonb, '2022-02-10 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000023', 'sales@extraspace.sg', '+65 6777 8888', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2021-10-01 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000024', 'hello@spaceship.sg', '+65 6555 6666', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2022-11-15 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000025', 'admin@shalom.sg', '+65 6111 2222', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2021-08-20 00:00:00+00', NOW()),
('00000000-0000-0000-0002-000000000026', 'info@lalamove.sg', '+65 6222 3333', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2023-01-10 00:00:00+00', NOW())
ON CONFLICT DO NOTHING;

-- AI agent profiles
INSERT INTO profiles (id, email, phone, role, residency_status, preferences, verification_badges, created_at, updated_at) VALUES
('00000000-0000-0000-0003-000000000001', 'aria@spacerealty.sg', 'N/A', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2024-01-01 00:00:00+00', NOW()),
('00000000-0000-0000-0003-000000000002', 'rex@spacerealty.sg', 'N/A', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2024-01-01 00:00:00+00', NOW()),
('00000000-0000-0000-0003-000000000003', 'vera@spacerealty.sg', 'N/A', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2024-01-01 00:00:00+00', NOW()),
('00000000-0000-0000-0003-000000000004', 'feng@spacerealty.sg', 'N/A', 'service_provider', 'company', '{}'::jsonb, '[]'::jsonb, '2024-01-01 00:00:00+00', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding singpass_verifications
-- ============================================================
INSERT INTO singpass_verifications (user_id, verified, verified_at, verification_method, name, nationality, date_of_birth, home_address) VALUES
('00000000-0000-0000-0000-000000000001', true, '2023-03-15 00:00:00+00', 'singpass', 'Tan Wei Ming', 'Singaporean', '1985-04-12', '123 Tampines Street 11, #08-45, Singapore 521123'),
('00000000-0000-0000-0000-000000000002', true, '2023-03-16 00:00:00+00', 'singpass', 'Chen Mei Ling', 'Singaporean', '1987-08-22', '123 Tampines Street 11, #08-45, Singapore 521123'),
('00000000-0000-0000-0000-000000000003', true, '2023-04-20 00:00:00+00', 'singpass', 'Lim Jia Hui', 'Singaporean', '1990-11-05', '78 Clementi Avenue 3, #04-12, Singapore 120078'),
('00000000-0000-0000-0000-000000000004', true, '2023-04-21 00:00:00+00', 'singpass', 'Wong Zi Xuan', 'Singaporean', '1988-03-17', '78 Clementi Avenue 3, #04-12, Singapore 120078'),
('00000000-0000-0000-0000-000000000005', true, '2023-05-10 00:00:00+00', 'singpass', 'Ng Kai Wen', 'Singaporean', '1982-07-30', '12 Bedok North Avenue 2, #03-88, Singapore 460012'),
('00000000-0000-0000-0000-000000000006', true, '2023-06-01 00:00:00+00', 'singpass', 'Ahmad Rizwan Bin Ismail', 'Singaporean', '1979-12-03', '205 Bishan Street 22, #11-05, Singapore 570205'),
('00000000-0000-0000-0000-000000000007', true, '2023-06-02 00:00:00+00', 'singpass', 'Siti Rahimah Binte Aziz', 'Singaporean', '1981-09-14', '205 Bishan Street 22, #11-05, Singapore 570205'),
('00000000-0000-0000-0000-000000000008', true, '2023-06-03 00:00:00+00', 'singpass', 'Muhammad Farid Bin Hassan', 'Singaporean', '2000-02-28', '205 Bishan Street 22, #11-06, Singapore 570205'),
('00000000-0000-0000-0000-000000000009', true, '2023-07-10 00:00:00+00', 'singpass', 'Nurul Ain Binte Omar', 'Singaporean', '1983-05-20', '88 Hougang Avenue 10, #06-23, Singapore 538088'),
('00000000-0000-0000-0000-000000000010', true, '2023-08-05 00:00:00+00', 'singpass', 'Priya Nair', 'Singaporean', '1978-11-30', '55 Jurong West Street 61, #12-34, Singapore 640055'),
('00000000-0000-0000-0000-000000000011', true, '2023-09-12 00:00:00+00', 'singpass', 'Raj Kumar Pillai', 'Singaporean', '1975-06-08', '301 Ang Mo Kio Avenue 1, #07-56, Singapore 560301'),
('00000000-0000-0000-0000-000000000012', true, '2023-10-01 00:00:00+00', 'singpass', 'Deepa Krishnamurthy', 'Singaporean', '1980-02-14', '12 Bedok North Avenue 2, #05-77, Singapore 460012'),
('00000000-0000-0000-0000-000000000013', true, '2023-11-05 00:00:00+00', 'singpass', 'Arjun Subramaniam', 'Indian', '1992-09-25', '15 Serangoon Garden Way, Singapore 555888'),
('00000000-0000-0000-0000-000000000014', true, '2023-11-20 00:00:00+00', 'singpass', 'James Mitchell', 'British', '1986-04-11', '8 Nassim Hill, Singapore 258465'),
('00000000-0000-0000-0000-000000000015', false, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0000-000000000016', false, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0000-000000000017', false, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0000-000000000018', false, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0000-000000000019', false, NULL, NULL, NULL, NULL, NULL, NULL),
('00000000-0000-0000-0000-000000000020', false, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding agents
-- ============================================================
INSERT INTO agents (id, profile_id, cea_number, cea_status, agency_name, agency_license_number, specializations, years_experience, total_transactions, active_listings, ratings, tier, created_at, updated_at) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000018', 'R012345', 'active', 'PropNex Realty Pte Ltd', 'L3008899J', '["HDB","Condo"]'::jsonb, 8, 145, 12, '{"average":4.7,"count":89,"breakdown":{"1":1,"2":2,"3":5,"4":18,"5":63}}'::jsonb, 'free', '2022-01-10 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000019', 'R234567', 'active', 'PropNex Realty Pte Ltd', 'L3008899J', '["HDB","Condo","Landed"]'::jsonb, 11, 198, 15, '{"average":4.8,"count":132,"breakdown":{"1":1,"2":1,"3":6,"4":24,"5":100}}'::jsonb, 'free', '2022-03-15 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000020', 'R345678', 'active', 'ERA Realty Network', 'L3002382K', '["Condo","Landed"]'::jsonb, 15, 280, 18, '{"average":4.9,"count":150,"breakdown":{"1":0,"2":1,"3":4,"4":20,"5":125}}'::jsonb, 'free', '2021-08-20 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0001-000000000004', 'R456789', 'active', 'ERA Realty Network', 'L3002382K', '["HDB","EC"]'::jsonb, 6, 87, 9, '{"average":4.4,"count":52,"breakdown":{"1":1,"2":3,"3":7,"4":15,"5":26}}'::jsonb, 'free', '2022-05-10 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0001-000000000005', 'R567890', 'active', 'OrangeTee & Tie', 'L3009250K', '["Condo","Landed","Commercial"]'::jsonb, 18, 320, 16, '{"average":4.9,"count":145,"breakdown":{"1":0,"2":0,"3":3,"4":22,"5":120}}'::jsonb, 'premium', '2020-08-15 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0001-000000000006', 'R678901', 'active', 'OrangeTee & Tie', 'L3009250K', '["HDB","Condo"]'::jsonb, 9, 167, 11, '{"average":4.5,"count":78,"breakdown":{"1":1,"2":2,"3":8,"4":22,"5":45}}'::jsonb, 'premium', '2021-04-20 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0001-000000000007', 'R789012', 'active', 'Huttons Asia Pte Ltd', 'L3008899J', '["Condo","EC"]'::jsonb, 7, 112, 13, '{"average":4.6,"count":67,"breakdown":{"1":0,"2":2,"3":5,"4":18,"5":42}}'::jsonb, 'premium', '2022-02-28 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0001-000000000008', 'R890123', 'active', 'Huttons Asia Pte Ltd', 'L3008899J', '["HDB","Condo"]'::jsonb, 3, 28, 5, '{"average":4.2,"count":18,"breakdown":{"1":0,"2":1,"3":3,"4":8,"5":6}}'::jsonb, 'premium', '2023-01-10 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0001-000000000009', 'R901234', 'active', 'Knight Frank', 'L3010568A', '["Condo","Landed","Commercial"]'::jsonb, 17, 245, 14, '{"average":4.8,"count":112,"breakdown":{"1":0,"2":1,"3":4,"4":17,"5":90}}'::jsonb, 'premium', '2019-06-15 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0001-000000000010', 'R012346', 'active', 'Knight Frank', 'L3010568A', '["Landed","Condo","Commercial"]'::jsonb, 22, 310, 10, '{"average":4.6,"count":138,"breakdown":{"1":1,"2":2,"3":8,"4":30,"5":97}}'::jsonb, 'enterprise', '2018-03-20 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000011', '00000000-0000-0000-0001-000000000011', 'R123456', 'active', 'SRI (Singapore Realtors Inc)', 'L3011318D', '["HDB","Condo","EC"]'::jsonb, 12, 185, 8, '{"average":4.7,"count":95,"breakdown":{"1":0,"2":1,"3":6,"4":20,"5":68}}'::jsonb, 'enterprise', '2020-11-30 00:00:00+00', NOW()),
('20000000-0000-0000-0000-000000000012', '00000000-0000-0000-0001-000000000012', 'R234568', 'active', 'SRI (Singapore Realtors Inc)', 'L3011318D', '["Condo","Landed"]'::jsonb, 1, 5, 2, '{"average":3.8,"count":5,"breakdown":{"1":0,"2":1,"3":1,"4":2,"5":1}}'::jsonb, 'enterprise', '2023-05-15 00:00:00+00', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding service_providers
-- ============================================================
INSERT INTO service_providers (id, profile_id, type, company_name, display_name, description, singpass_verified, ratings, pricing, service_areas, licence_number, portfolio_urls, contact_email, contact_phone, created_at, updated_at) VALUES
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0002-000000000001', 'Lawyer', 'Rajah and Tann Conveyancing', 'Rajah and Tann Conveyancing', 'Leading Singapore law firm offering comprehensive residential and commercial property conveyancing services.', true, '{"average":4.8,"count":245,"breakdown":{"1":1,"2":2,"3":10,"4":42,"5":190}}'::jsonb, '{"model":"Fixed fee","minFee":2800,"maxFee":4500,"currency":"SGD"}'::jsonb, '["All Singapore Districts"]'::jsonb, 'L-2023-0001', '["/portfolio/rajah-tann-1.jpg"]'::jsonb, 'property@rajahtann.com', '+65 6535 3600', '2022-01-10 00:00:00+00', '2024-06-01 00:00:00+00'),
('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0002-000000000002', 'Lawyer', 'WongPartnership Property Desk', 'WongPartnership Property Desk', 'Top-tier Singapore law firm with a dedicated property desk handling HDB, private residential and commercial transactions.', true, '{"average":4.7,"count":188,"breakdown":{"1":1,"2":3,"3":12,"4":38,"5":134}}'::jsonb, '{"model":"Fixed fee","minFee":3000,"maxFee":4800,"currency":"SGD"}'::jsonb, '["All Singapore Districts"]'::jsonb, 'L-2023-0002', '["/portfolio/wongpartnership-1.jpg"]'::jsonb, 'property@wongpartnership.com', '+65 6416 8000', '2021-08-20 00:00:00+00', '2024-05-15 00:00:00+00'),
('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0002-000000000003', 'Lawyer', 'Allen and Gledhill Residential', 'Allen and Gledhill Residential', 'Established Singapore law firm specializing in residential property transactions with Singpass-integrated document processing.', true, '{"average":4.6,"count":122,"breakdown":{"1":0,"2":2,"3":10,"4":30,"5":80}}'::jsonb, '{"model":"Fixed fee","minFee":2500,"maxFee":4200,"currency":"SGD"}'::jsonb, '["All Singapore Districts"]'::jsonb, 'L-2023-0003', '[]'::jsonb, 'property@allenandgledhill.com', '+65 6890 7188', '2022-03-15 00:00:00+00', '2024-04-10 00:00:00+00'),
('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0002-000000000004', 'Lawyer', 'Dentons Rodyk Conveyancing', 'Dentons Rodyk Conveyancing', 'Full-service conveyancing from one of Singapores oldest law firms, handling residential, commercial and industrial properties.', true, '{"average":4.5,"count":97,"breakdown":{"1":1,"2":2,"3":8,"4":22,"5":64}}'::jsonb, '{"model":"Fixed fee","minFee":2800,"maxFee":5000,"currency":"SGD"}'::jsonb, '["All Singapore Districts"]'::jsonb, 'L-2023-0004', '[]'::jsonb, 'property@dentonsrodyk.com', '+65 6225 2626', '2021-11-05 00:00:00+00', '2024-03-20 00:00:00+00'),
('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0002-000000000005', 'MortgageBroker', 'Redbrick Mortgage Advisory', 'Redbrick Mortgage Advisory', 'Singapore award-winning mortgage broker comparing 16+ banks to find you the best home loan rates.', true, '{"average":4.9,"count":312,"breakdown":{"1":0,"2":1,"3":5,"4":46,"5":260}}'::jsonb, '{"model":"Free - paid by bank","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'hello@redbrick.sg', '+65 6221 7788', '2022-06-01 00:00:00+00', '2024-07-01 00:00:00+00'),
('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0002-000000000006', 'MortgageBroker', 'MortgageMaster SG', 'MortgageMaster SG', 'Expert mortgage brokers helping Singapore homebuyers navigate HDB loans, bank loans and refinancing options.', true, '{"average":4.7,"count":185,"breakdown":{"1":0,"2":2,"3":8,"4":35,"5":140}}'::jsonb, '{"model":"Free - paid by bank","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'enquiry@mortgagemaster.sg', '+65 8288 5566', '2023-01-15 00:00:00+00', '2024-06-15 00:00:00+00'),
('40000000-0000-0000-0000-000000000007', '00000000-0000-0000-0002-000000000007', 'MortgageBroker', 'PropertyGenie Finance', 'PropertyGenie Finance', 'Digital mortgage advisory platform offering instant loan comparisons across major Singapore banks and financial institutions.', false, '{"average":4.5,"count":94,"breakdown":{"1":1,"2":2,"3":8,"4":22,"5":61}}'::jsonb, '{"model":"Free - paid by bank","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'finance@propertygenie.sg', '+65 6100 3344', '2023-04-10 00:00:00+00', '2024-05-20 00:00:00+00'),
('40000000-0000-0000-0000-000000000008', '00000000-0000-0000-0002-000000000008', 'MortgageBroker', 'HomeLoan Experts SG', 'HomeLoan Experts SG', 'Specialist mortgage consultants for first-time buyers, HDB upgraders and investment property purchasers.', true, '{"average":4.6,"count":148,"breakdown":{"1":0,"2":2,"3":10,"4":36,"5":100}}'::jsonb, '{"model":"Free - paid by bank","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'help@homeloanexperts.sg', '+65 9111 2233', '2022-09-20 00:00:00+00', '2024-06-30 00:00:00+00'),
('40000000-0000-0000-0000-000000000009', '00000000-0000-0000-0002-000000000009', 'Handyman', 'FixIt SG', 'FixIt SG', 'Reliable handyman services for HDB and condo owners: plumbing, electrical, carpentry and general repairs.', false, '{"average":4.4,"count":78,"breakdown":{"1":1,"2":2,"3":8,"4":20,"5":47}}'::jsonb, '{"model":"Hourly","minFee":80,"maxFee":200,"currency":"SGD"}'::jsonb, '["D01","D02","D03","D08","D12","D13","D14","D15"]'::jsonb, NULL, '[]'::jsonb, 'jobs@fixitsg.com', '+65 9234 5678', '2023-02-10 00:00:00+00', '2024-05-10 00:00:00+00'),
('40000000-0000-0000-0000-000000000010', '00000000-0000-0000-0002-000000000010', 'Handyman', 'Drill and Hammer Works', 'Drill and Hammer Works', 'Experienced handyman and minor renovation specialists serving HDB estates in the west and central Singapore.', false, '{"average":4.2,"count":54,"breakdown":{"1":1,"2":3,"3":8,"4":15,"5":27}}'::jsonb, '{"model":"Hourly","minFee":80,"maxFee":180,"currency":"SGD"}'::jsonb, '["D05","D22","D23","D20","D21","D10"]'::jsonb, NULL, '[]'::jsonb, 'contact@drillhammer.sg', '+65 9345 6789', '2023-05-15 00:00:00+00', '2024-04-20 00:00:00+00'),
('40000000-0000-0000-0000-000000000011', '00000000-0000-0000-0002-000000000011', 'Handyman', 'QuickFix Contractors', 'QuickFix Contractors', 'On-demand handyman services with guaranteed same-day or next-day response for urgent repair jobs.', false, '{"average":4.5,"count":92,"breakdown":{"1":0,"2":2,"3":10,"4":25,"5":55}}'::jsonb, '{"model":"Hourly","minFee":90,"maxFee":200,"currency":"SGD"}'::jsonb, '["D16","D17","D18","D19","D27","D28"]'::jsonb, NULL, '[]'::jsonb, 'urgent@quickfix.sg', '+65 9456 7890', '2023-08-01 00:00:00+00', '2024-06-10 00:00:00+00'),
('40000000-0000-0000-0000-000000000012', '00000000-0000-0000-0002-000000000012', 'Handyman', 'ProHandyman SG', 'ProHandyman SG', 'Professional handyman services with transparent pricing, covering plumbing, painting, tiling and electrical works.', false, '{"average":4.6,"count":115,"breakdown":{"1":0,"2":1,"3":8,"4":28,"5":78}}'::jsonb, '{"model":"Hourly","minFee":85,"maxFee":200,"currency":"SGD"}'::jsonb, '["D09","D10","D11","D12","D15","D20","D25"]'::jsonb, NULL, '["/portfolio/prohandyman-1.jpg"]'::jsonb, 'hello@prohandyman.sg', '+65 9567 8901', '2022-11-20 00:00:00+00', '2024-07-05 00:00:00+00'),
('40000000-0000-0000-0000-000000000013', '00000000-0000-0000-0002-000000000013', 'InteriorDesign', 'Scandic Studio SG', 'Scandic Studio SG', 'Award-winning Scandinavian-inspired interior design studio crafting minimalist, functional homes across Singapore.', false, '{"average":4.8,"count":62,"breakdown":{"1":0,"2":0,"3":4,"4":12,"5":46}}'::jsonb, '{"model":"Project-based","minFee":35000,"maxFee":180000,"currency":"SGD"}'::jsonb, '["D09","D10","D11","D15","D03","D04"]'::jsonb, NULL, '["/portfolio/scandic-1.jpg","/portfolio/scandic-2.jpg"]'::jsonb, 'hello@scandic-studio.sg', '+65 6100 1234', '2022-04-10 00:00:00+00', '2024-06-20 00:00:00+00'),
('40000000-0000-0000-0000-000000000014', '00000000-0000-0000-0002-000000000014', 'InteriorDesign', 'Luxury Lofts ID', 'Luxury Lofts ID', 'High-end interior design for landed properties, penthouses and luxury condos with bespoke furniture procurement.', true, '{"average":4.9,"count":38,"breakdown":{"1":0,"2":0,"3":1,"4":5,"5":32}}'::jsonb, '{"model":"Project-based","minFee":80000,"maxFee":200000,"currency":"SGD"}'::jsonb, '["D09","D10","D11","D19","D04","D15","D21"]'::jsonb, NULL, '["/portfolio/luxurylofts-1.jpg","/portfolio/luxurylofts-2.jpg","/portfolio/luxurylofts-3.jpg"]'::jsonb, 'projects@luxurylofts.sg', '+65 6223 4455', '2021-09-01 00:00:00+00', '2024-05-30 00:00:00+00'),
('40000000-0000-0000-0000-000000000015', '00000000-0000-0000-0002-000000000015', 'InteriorDesign', 'HDB Makeover Specialists', 'HDB Makeover Specialists', 'Specialist HDB interior designers offering practical, value-for-money makeovers for BTO and resale flats.', false, '{"average":4.5,"count":148,"breakdown":{"1":1,"2":2,"3":15,"4":45,"5":85}}'::jsonb, '{"model":"Project-based","minFee":30000,"maxFee":80000,"currency":"SGD"}'::jsonb, '["D18","D19","D20","D22","D23","D25","D27","D28"]'::jsonb, NULL, '["/portfolio/hdbmakeover-1.jpg","/portfolio/hdbmakeover-2.jpg"]'::jsonb, 'enquiry@hdbmakeover.sg', '+65 8122 3344', '2023-03-10 00:00:00+00', '2024-07-10 00:00:00+00'),
('40000000-0000-0000-0000-000000000016', '00000000-0000-0000-0002-000000000016', 'InteriorDesign', 'The Minimalist Space', 'The Minimalist Space', 'Curated minimalist interior design for discerning homeowners seeking clean lines, clever storage and timeless aesthetics.', false, '{"average":4.7,"count":55,"breakdown":{"1":0,"2":1,"3":4,"4":12,"5":38}}'::jsonb, '{"model":"Project-based","minFee":40000,"maxFee":150000,"currency":"SGD"}'::jsonb, '["D01","D02","D03","D05","D09","D10","D11","D12","D15"]'::jsonb, NULL, '["/portfolio/minimalist-1.jpg","/portfolio/minimalist-2.jpg"]'::jsonb, 'design@minimalistspace.sg', '+65 6100 5566', '2022-07-15 00:00:00+00', '2024-06-05 00:00:00+00'),
('40000000-0000-0000-0000-000000000017', '00000000-0000-0000-0002-000000000017', 'Renovation', 'Wet Works SG', 'Wet Works SG', 'Specialist wet works contractor for bathrooms, kitchens, waterproofing and tiling across Singapore.', false, '{"average":4.3,"count":72,"breakdown":{"1":1,"2":3,"3":10,"4":22,"5":36}}'::jsonb, '{"model":"Project-based","minFee":5000,"maxFee":50000,"currency":"SGD"}'::jsonb, '["All Singapore Districts"]'::jsonb, NULL, '["/portfolio/wetworks-1.jpg"]'::jsonb, 'projects@wetworkssg.com', '+65 9678 9012', '2023-01-20 00:00:00+00', '2024-05-25 00:00:00+00'),
('40000000-0000-0000-0000-000000000018', '00000000-0000-0000-0002-000000000018', 'Renovation', 'PowerElectrical Contractors', 'PowerElectrical Contractors', 'Licensed electrical renovation contractor for new homes, rewiring, DB upgrades and smart home installations.', false, '{"average":4.5,"count":88,"breakdown":{"1":0,"2":2,"3":8,"4":22,"5":56}}'::jsonb, '{"model":"Project-based","minFee":3000,"maxFee":80000,"currency":"SGD"}'::jsonb, '["All Singapore Districts"]'::jsonb, NULL, '["/portfolio/powerelec-1.jpg"]'::jsonb, 'jobs@powerelectrical.sg', '+65 9789 0123', '2022-08-05 00:00:00+00', '2024-06-25 00:00:00+00'),
('40000000-0000-0000-0000-000000000021', '00000000-0000-0000-0002-000000000021', 'Agent', 'PropNex Realty Pte Ltd', 'Sarah Lim (PropNex)', 'Top-producing agent specializing in District 9/10 luxury condos and new launches. 10+ years of experience.', true, '{"average":4.9,"count":185,"breakdown":{"1":0,"2":1,"3":5,"4":25,"5":154}}'::jsonb, '{"model":"Commission","commissionPct":2,"currency":"SGD"}'::jsonb, '["D09","D10","D11"]'::jsonb, 'R012345A', '["/portfolio/agent-sarah-1.jpg"]'::jsonb, 'sarah.lim@propnex.mock', '+65 9111 2222', '2021-05-15 00:00:00+00', '2024-08-01 00:00:00+00'),
('40000000-0000-0000-0000-000000000022', '00000000-0000-0000-0002-000000000022', 'Agent', 'ERA Realty Network', 'David Chen (ERA)', 'HDB upgrade specialist. I help families seamlessly transition from public to private housing with zero timeline gaps.', true, '{"average":4.8,"count":142,"breakdown":{"1":1,"2":2,"3":8,"4":31,"5":100}}'::jsonb, '{"model":"Commission","commissionPct":2,"currency":"SGD"}'::jsonb, '["D19","D20","D22","D23"]'::jsonb, 'R054321B', '[]'::jsonb, 'david.chen@era.mock', '+65 9333 4444', '2022-02-10 00:00:00+00', '2024-07-20 00:00:00+00'),
('40000000-0000-0000-0000-000000000023', '00000000-0000-0000-0002-000000000023', 'Storage', 'ExtraSpace Self Storage', 'ExtraSpace Self Storage', 'Secure, climate-controlled storage units from 15 sqft to 200 sqft. Flexible monthly terms.', false, '{"average":4.6,"count":210,"breakdown":{"1":2,"2":5,"3":15,"4":48,"5":140}}'::jsonb, '{"model":"Monthly","minFee":80,"maxFee":600,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'sales@extraspace.sg', '+65 6777 8888', '2021-10-01 00:00:00+00', '2024-08-05 00:00:00+00'),
('40000000-0000-0000-0000-000000000024', '00000000-0000-0000-0002-000000000024', 'Storage', 'Spaceship Door-to-Door Storage', 'Spaceship Door-to-Door Storage', 'We pick up, store, and return your items. No need to visit a self-storage facility. Perfect for moving transitions.', false, '{"average":4.8,"count":156,"breakdown":{"1":1,"2":1,"3":8,"4":36,"5":110}}'::jsonb, '{"model":"Monthly","minFee":50,"maxFee":400,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'hello@spaceship.sg', '+65 6555 6666', '2022-11-15 00:00:00+00', '2024-07-10 00:00:00+00'),
('40000000-0000-0000-0000-000000000025', '00000000-0000-0000-0002-000000000025', 'Logistics', 'Shalom Movers', 'Shalom Movers', 'Award-winning professional movers. Comprehensive packing, moving, and unpacking services for HDB and private properties.', false, '{"average":4.7,"count":345,"breakdown":{"1":5,"2":8,"3":20,"4":82,"5":230}}'::jsonb, '{"model":"Project-based","minFee":300,"maxFee":2500,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'admin@shalom.sg', '+65 6111 2222', '2021-08-20 00:00:00+00', '2024-06-15 00:00:00+00'),
('40000000-0000-0000-0000-000000000026', '00000000-0000-0000-0002-000000000026', 'Logistics', 'Lalamove Large Vehicles', 'Lalamove Large Vehicles', 'On-demand van and lorry bookings for DIY movers or delivering bulky furniture purchases.', false, '{"average":4.4,"count":850,"breakdown":{"1":40,"2":60,"3":100,"4":250,"5":400}}'::jsonb, '{"model":"Trip-based","minFee":30,"maxFee":150,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'info@lalamove.sg', '+65 6222 3333', '2023-01-10 00:00:00+00', '2024-08-10 00:00:00+00'),
('40000000-0000-0000-0000-000000000027', '00000000-0000-0000-0003-000000000001', 'AIAgent', 'Your AI Property Advisor', 'Aria', 'Finds properties matching your exact requirements, lifestyle, and budget with AI-powered precision.', false, '{"average":5.0,"count":3240,"breakdown":{"1":0,"2":0,"3":0,"4":140,"5":3100}}'::jsonb, '{"model":"Free","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'ai@spacerealty.sg', 'N/A', '2024-01-01 00:00:00+00', '2024-08-01 00:00:00+00'),
('40000000-0000-0000-0000-000000000029', '00000000-0000-0000-0003-000000000002', 'AIAgent', 'Research & Analytics AI', 'Rex', 'Deep dives into market trends, price history, district analysis and investment potential.', false, '{"average":4.8,"count":1950,"breakdown":{"1":5,"2":15,"3":30,"4":300,"5":1600}}'::jsonb, '{"model":"Free","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'ai@spacerealty.sg', 'N/A', '2024-01-01 00:00:00+00', '2024-08-01 00:00:00+00'),
('40000000-0000-0000-0000-000000000030', '00000000-0000-0000-0003-000000000003', 'AIAgent', 'Legal & Compliance AI', 'Vera', 'Reviews OTP documents, calculates stamp duty, and checks legal compliance so you transact safely.', false, '{"average":4.9,"count":4100,"breakdown":{"1":2,"2":8,"3":40,"4":350,"5":3700}}'::jsonb, '{"model":"Free","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'ai@spacerealty.sg', 'N/A', '2024-01-01 00:00:00+00', '2024-08-01 00:00:00+00'),
('40000000-0000-0000-0000-000000000031', '00000000-0000-0000-0003-000000000004', 'AIAgent', 'Feng Shui & Astrology AI', 'Feng', 'Ba Zi compatibility readings, property orientation analysis, and lucky unit number guidance.', false, '{"average":4.7,"count":1200,"breakdown":{"1":10,"2":20,"3":70,"4":200,"5":900}}'::jsonb, '{"model":"Free","minFee":0,"currency":"SGD"}'::jsonb, '["All Singapore"]'::jsonb, NULL, '[]'::jsonb, 'ai@spacerealty.sg', 'N/A', '2024-01-01 00:00:00+00', '2024-08-01 00:00:00+00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding family_groups
-- ============================================================
INSERT INTO family_groups (id, name, eligibility_summary, head_user_id, created_at, updated_at) VALUES
('30000000-0000-0000-0000-000000000001', 'The Tan Family',
 '{"totalPropertiesOwned":1,"absdLiability":[{"applicableRate":0.20,"amount":136000,"rationale":"Singapore Citizen buying 2nd property: 20% ABSD on 680,000 SGD"}],"combinedTDSRCapacity":4785000,"combinedCPFAvailable":180000,"canBuyHDB":false,"hdbEligibilityNotes":["Already own one HDB flat — must dispose before buying another"]}'::jsonb,
 '00000000-0000-0000-0000-000000000001', NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', 'The Lim-Rashid Family',
 '{"totalPropertiesOwned":0,"absdLiability":[{"applicableRate":0,"amount":0,"rationale":"First-time buyers: 0% ABSD"}],"combinedTDSRCapacity":2970000,"combinedCPFAvailable":65000,"canBuyHDB":true,"hdbEligibilityNotes":["Eligible under Fiance/Fiancee Scheme","Must register marriage within 3 months of key collection"]}'::jsonb,
 '00000000-0000-0000-0000-000000000003', NOW(), NOW()),
('30000000-0000-0000-0000-000000000003', 'The Mehta Family',
 '{"totalPropertiesOwned":3,"absdLiability":[{"applicableRate":0.30,"amount":450000,"rationale":"Singapore PR buying 3rd+ property: 30% ABSD"}],"combinedTDSRCapacity":14850000,"combinedCPFAvailable":420000,"canBuyHDB":false,"hdbEligibilityNotes":["HDB not eligible — multiple private properties owned"]}'::jsonb,
 '00000000-0000-0000-0000-000000000005', NOW(), NOW()),
('30000000-0000-0000-0000-000000000004', 'The Wong Multi-Gen Family',
 '{"totalPropertiesOwned":1,"absdLiability":[{"applicableRate":0.20,"amount":240000,"rationale":"SC buying 2nd property: 20% ABSD on 1.2M condo"}],"combinedTDSRCapacity":7260000,"combinedCPFAvailable":310000,"canBuyHDB":true,"hdbEligibilityNotes":["Eligible for 3Gen HDB flat if seniors are direct family","Must include at least one child aged 21+ with parent/grandparent"]}'::jsonb,
 '00000000-0000-0000-0000-000000000006', NOW(), NOW()),
('30000000-0000-0000-0000-000000000005', 'The Mitchell Family',
 '{"totalPropertiesOwned":0,"absdLiability":[{"applicableRate":0.60,"amount":0,"rationale":"Foreigner: 60% ABSD applies if purchasing residential property in Singapore"}],"combinedTDSRCapacity":5940000,"combinedCPFAvailable":0,"canBuyHDB":false,"hdbEligibilityNotes":["Foreigners are not eligible to purchase HDB flats","EP holders may rent HDB rooms with owner approval"]}'::jsonb,
 '00000000-0000-0000-0000-000000000009', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding family_members
-- ============================================================
INSERT INTO family_members (id, family_group_id, user_id, role, relationship, added_at) VALUES
-- fam-001: The Tan Family
('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'head', 'Husband', '2023-03-15 00:00:00+00'),
('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'spouse', 'Wife', '2023-03-16 00:00:00+00'),
-- fam-002: The Lim-Rashid Family
('60000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'head', 'Fiancee', '2023-04-20 00:00:00+00'),
('60000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'spouse', 'Fiance', '2023-04-21 00:00:00+00'),
-- fam-003: The Mehta Family
('60000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'head', 'Father', '2023-05-10 00:00:00+00'),
('60000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'spouse', 'Mother', '2023-05-10 00:00:00+00'),
('60000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000013', 'child', 'Son', '2023-05-11 00:00:00+00'),
-- fam-004: The Wong Multi-Gen Family
('60000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'head', 'Husband', '2023-06-01 00:00:00+00'),
('60000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'spouse', 'Wife', '2023-06-02 00:00:00+00'),
('60000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000011', 'parent', 'Father-in-law', '2023-06-05 00:00:00+00'),
('60000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'child', 'Son', '2023-06-03 00:00:00+00'),
-- fam-005: The Mitchell Family
('60000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'head', 'Primary applicant', '2023-07-10 00:00:00+00'),
('60000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000014', 'spouse', 'Spouse', '2023-07-10 00:00:00+00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding properties (54 total)
-- ============================================================
INSERT INTO properties (id, listing_type, property_type, district, hdb_town, hdb_room_type, hdb_block, tenure, postal_code, unit_number, floor_level, total_floors, price, psf, price_negotiable, rental_yield, bedrooms, bathrooms, floor_area_sqft, built_up_area_sqft, land_area_sqft, furnishing, completion_year, top_date, verification_level, legal_doc_urls, layout, address, latitude, longitude, nearby_mrt, nearby_amenities, listing_source, agent_id, owner_id, status, featured, views_count, ai_generated_description, listing_quality_score, ai_highlights, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001','sale','HDB','D18','Tampines','4-room','123','leasehold-99','521123','#08-45',8,12,680000,679,true,3.8,3,2,1001,NULL,NULL,'partial-furnished',2001,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'Blk 123 Tampines Street 11, Singapore 521123',1.3537,103.9437,'[{"station":"Tampines","line":"EWL","distanceMeters":450},{"station":"Tampines East","line":"DTL","distanceMeters":620}]'::jsonb,'[{"name":"Tampines Mall","type":"mall","distanceMeters":500,"walkingMinutes":7},{"name":"Tampines Primary School","type":"school","distanceMeters":350,"walkingMinutes":5}]'::jsonb,'agent','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','active',true,1240,'Spacious 4-room HDB in mature Tampines estate, walking distance to Tampines MRT and major amenities.',92,'["Corner unit with extra windows","Walking distance to 3 MRT lines","Top primary school catchment"]'::jsonb,'2024-01-15 00:00:00+00','2024-02-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000002','sale','HDB','D19','Punggol','5-room','456A','leasehold-99','821456','#12-34',12,16,750000,611,false,NULL,4,3,1227,NULL,NULL,'unfurnished',2015,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 456A Punggol Field Walk, Singapore 821456',1.4044,103.9022,'[{"station":"Punggol","line":"NEL","distanceMeters":380}]'::jsonb,'[{"name":"Waterway Point","type":"mall","distanceMeters":600,"walkingMinutes":8},{"name":"Punggol Waterway Park","type":"park","distanceMeters":400,"walkingMinutes":6}]'::jsonb,'agent','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','active',false,890,'Well-maintained 5-room flat in waterfront Punggol town, minutes from Punggol MRT.',88,'["Waterfront town with cycling paths","Young estate with modern facilities","Spacious 1227sqft layout"]'::jsonb,'2024-02-01 00:00:00+00','2024-02-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000003','sale','HDB','D05','Clementi','4-room','78C','leasehold-99','120078','#07-22',7,10,620000,626,true,NULL,3,2,990,NULL,NULL,'partial-furnished',1998,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 78C Clementi Avenue 3, Singapore 120078',1.3162,103.7649,'[{"station":"Clementi","line":"EWL","distanceMeters":520}]'::jsonb,'[{"name":"Clementi Mall","type":"mall","distanceMeters":600,"walkingMinutes":8},{"name":"Nan Hua Primary School","type":"school","distanceMeters":450,"walkingMinutes":6}]'::jsonb,'agent','20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','active',false,645,'Affordable 4-room HDB near Clementi MRT, close to top schools and shopping.',76,'["Near NUS campus","Quiet mature estate","Minutes to Clementi MRT"]'::jsonb,'2024-01-20 00:00:00+00','2024-02-10 00:00:00+00'),
('10000000-0000-0000-0000-000000000004','rent','HDB','D20','Ang Mo Kio','3-room','301','leasehold-99','560301','#05-67',5,12,2800,3,true,NULL,2,1,721,NULL,NULL,'fully-furnished',1992,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 301 Ang Mo Kio Avenue 1, Singapore 560301',1.3691,103.8454,'[{"station":"Ang Mo Kio","line":"NSL","distanceMeters":350}]'::jsonb,'[{"name":"AMK Hub","type":"mall","distanceMeters":400,"walkingMinutes":6},{"name":"Ang Mo Kio Town Centre","type":"hawker","distanceMeters":200,"walkingMinutes":3}]'::jsonb,'owner-direct',NULL,'00000000-0000-0000-0000-000000000016','active',false,342,'Cozy fully furnished 3-room HDB flat near Ang Mo Kio MRT, ideal for couples.',62,'["Fully furnished","Walking distance to AMK MRT","Near AMK Hub mall"]'::jsonb,'2024-03-01 00:00:00+00','2024-03-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000005','sale','HDB','D16','Bedok','5-room','12','leasehold-99','460012','#11-01',11,12,820000,630,false,NULL,4,3,1302,NULL,NULL,'partial-furnished',2006,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'Blk 12 Bedok North Avenue 2, Singapore 460012',1.3247,103.9300,'[{"station":"Bedok North","line":"DTL","distanceMeters":480}]'::jsonb,'[{"name":"Bedok Mall","type":"mall","distanceMeters":1200,"walkingMinutes":15},{"name":"Bedok Green Primary School","type":"school","distanceMeters":350,"walkingMinutes":5}]'::jsonb,'agent','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','active',true,1580,'Premium 5-room HDB with sea breeze on high floor, walk to Bedok North MRT.',95,'["High floor corner unit","Unblocked east views","Spacious 1302sqft layout"]'::jsonb,'2024-01-05 00:00:00+00','2024-01-20 00:00:00+00'),
('10000000-0000-0000-0000-000000000006','sale','HDB','D20','Bishan','4-room','205','leasehold-99','570205','#09-33',9,12,710000,680,true,NULL,3,2,1044,NULL,NULL,'unfurnished',2000,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 205 Bishan Street 22, Singapore 570205',1.3521,103.8490,'[{"station":"Bishan","line":"CCL","distanceMeters":550}]'::jsonb,'[{"name":"Junction 8","type":"mall","distanceMeters":700,"walkingMinutes":9},{"name":"Bishan-AMK Park","type":"park","distanceMeters":800,"walkingMinutes":10}]'::jsonb,'agent','20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000006','active',false,523,'Central Bishan 4-room flat with easy access to Bishan MRT and Junction 8 mall.',80,'["Central location","Near Bishan-AMK Park","Top school cluster area"]'::jsonb,'2024-02-10 00:00:00+00','2024-03-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000007','rent','HDB','D19','Hougang','4-room','88','leasehold-99','538088','#06-23',6,10,2600,3,false,NULL,3,2,980,NULL,NULL,'fully-furnished',1995,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 88 Hougang Avenue 10, Singapore 538088',1.3721,103.8888,'[{"station":"Hougang","line":"NEL","distanceMeters":620}]'::jsonb,'[{"name":"Hougang Mall","type":"mall","distanceMeters":800,"walkingMinutes":10},{"name":"Hougang Stadium","type":"sports","distanceMeters":500,"walkingMinutes":7}]'::jsonb,'owner-direct',NULL,'00000000-0000-0000-0000-000000000009','active',false,278,'Fully furnished 4-room HDB in Hougang, great for families seeking northeast connectivity.',58,'["Fully furnished move-in ready","Near Hougang MRT","Pet-friendly block"]'::jsonb,'2024-03-10 00:00:00+00','2024-03-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000008','sale','HDB','D22','Jurong West','4-room','55','leasehold-99','640055','#08-11',8,14,590000,562,true,NULL,3,2,1050,NULL,NULL,'unfurnished',2003,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'Blk 55 Jurong West Street 61, Singapore 640055',1.3404,103.7090,'[{"station":"Boon Lay","line":"EWL","distanceMeters":710}]'::jsonb,'[{"name":"Jurong Point","type":"mall","distanceMeters":900,"walkingMinutes":12},{"name":"Jurong West Primary School","type":"school","distanceMeters":400,"walkingMinutes":6}]'::jsonb,'agent','20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000010','active',true,944,'Affordable 4-room HDB in Jurong West, excellent value in the fast-developing west region.',86,'["Value-for-money west region HDB","JLD upcoming development boost","Near Jurong Point mall"]'::jsonb,'2024-01-28 00:00:00+00','2024-02-12 00:00:00+00'),
('10000000-0000-0000-0000-000000000009','sale','HDB','D27','Yishun','3-room','201','leasehold-99','760201','#04-15',4,10,350000,485,true,NULL,2,1,721,NULL,NULL,'unfurnished',1990,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 201 Yishun Avenue 6, Singapore 760201',1.4288,103.8390,'[{"station":"Yishun","line":"NSL","distanceMeters":650}]'::jsonb,'[{"name":"Northpoint City","type":"mall","distanceMeters":800,"walkingMinutes":10},{"name":"Yishun Pond","type":"park","distanceMeters":300,"walkingMinutes":4}]'::jsonb,'agent','20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000011','active',false,412,'Entry-level 3-room HDB in Yishun, ideal for young couples or first-time buyers.',54,'["Affordable entry price","Near Northpoint City","Good investment yield"]'::jsonb,'2024-02-20 00:00:00+00','2024-03-05 00:00:00+00'),
('10000000-0000-0000-0000-000000000010','sale','HDB','D19','Sengkang','4-room','312A','leasehold-99','541312','#10-22',10,14,680000,648,false,NULL,3,2,1049,NULL,NULL,'partial-furnished',2011,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 312A Sengkang East Way, Singapore 541312',1.3915,103.8952,'[{"station":"Sengkang","line":"NEL","distanceMeters":420}]'::jsonb,'[{"name":"Compass One","type":"mall","distanceMeters":500,"walkingMinutes":7},{"name":"Sengkang Riverside Park","type":"park","distanceMeters":600,"walkingMinutes":8}]'::jsonb,'agent','20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000005','active',false,620,'Well-maintained 4-room flat in Sengkang, close to Compass One and Sengkang MRT.',72,'["Amenity-rich Sengkang estate","LRT network access","Near Punggol Park Connector"]'::jsonb,'2024-03-05 00:00:00+00','2024-03-20 00:00:00+00'),
('10000000-0000-0000-0000-000000000011','sale','HDB','D03','Bukit Merah','2-room','10','leasehold-99','150010','#03-05',3,8,260000,434,true,NULL,1,1,599,NULL,NULL,'unfurnished',1985,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 10 Bukit Merah Lane 1, Singapore 150010',1.2789,103.8200,'[{"station":"Redhill","line":"EWL","distanceMeters":350}]'::jsonb,'[{"name":"Tiong Bahru Plaza","type":"mall","distanceMeters":1000,"walkingMinutes":13},{"name":"Bukit Merah Hawker Centre","type":"hawker","distanceMeters":200,"walkingMinutes":3}]'::jsonb,'agent','20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000016','active',false,318,'Compact 2-room starter HDB in central Bukit Merah, excellent location near Redhill MRT.',48,'["Central location below market price","Great for single/young couple","Near Redhill MRT"]'::jsonb,'2024-04-01 00:00:00+00','2024-04-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000012','sale','HDB','D03','Queenstown','5-room','49A','leasehold-99','140049','#14-05',14,16,850000,693,false,NULL,4,3,1227,NULL,NULL,'partial-furnished',2005,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 49A Commonwealth Drive, Singapore 140049',1.3048,103.8060,'[{"station":"Queenstown","line":"EWL","distanceMeters":480}]'::jsonb,'[{"name":"IKEA Alexandra","type":"retail","distanceMeters":1200,"walkingMinutes":15},{"name":"Queenstown Primary School","type":"school","distanceMeters":550,"walkingMinutes":7}]'::jsonb,'agent','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000011','active',false,788,'Coveted high-floor 5-room in Queenstown, one of Singapores most established estates.',84,'["High floor with city fringe views","Heritage Queenstown location","Near IKEA Alexandra"]'::jsonb,'2024-02-25 00:00:00+00','2024-03-10 00:00:00+00'),
('10000000-0000-0000-0000-000000000013','rent','HDB','D12','Toa Payoh','4-room','151','leasehold-99','310151','#07-45',7,12,2900,3,true,NULL,3,2,1001,NULL,NULL,'fully-furnished',1988,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 151 Lorong 1 Toa Payoh, Singapore 310151',1.3324,103.8473,'[{"station":"Toa Payoh","line":"NSL","distanceMeters":300}]'::jsonb,'[{"name":"HDB Hub","type":"office","distanceMeters":400,"walkingMinutes":5},{"name":"Toa Payoh Town Park","type":"park","distanceMeters":600,"walkingMinutes":8}]'::jsonb,'owner-direct',NULL,'00000000-0000-0000-0000-000000000016','active',false,295,'Central Toa Payoh 4-room, just 300m from Toa Payoh MRT, fully furnished.',60,'["Steps to Toa Payoh MRT","Central location","Fully furnished"]'::jsonb,'2024-04-10 00:00:00+00','2024-04-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000014','sale','HDB','D25','Woodlands','4-room','888A','leasehold-99','731888','#06-11',6,12,480000,502,true,NULL,3,2,956,NULL,NULL,'unfurnished',1997,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 888A Woodlands Drive 50, Singapore 731888',1.4389,103.7860,'[{"station":"Woodlands North","line":"TEL","distanceMeters":550}]'::jsonb,'[{"name":"Causeway Point","type":"mall","distanceMeters":1000,"walkingMinutes":13},{"name":"Woodlands Waterfront","type":"park","distanceMeters":700,"walkingMinutes":9}]'::jsonb,'agent','20000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000012','active',false,389,'Affordable Woodlands 4-room, well connected via TEL and near Causeway Point.',55,'["TEL connectivity boost","Near Malaysia border convenience","Affordable north region pricing"]'::jsonb,'2024-03-15 00:00:00+00','2024-03-30 00:00:00+00'),
('10000000-0000-0000-0000-000000000015','sale','HDB','D27','Sembawang','5-room','404','leasehold-99','750404','#08-55',8,14,540000,440,false,NULL,4,3,1227,NULL,NULL,'unfurnished',2004,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 404 Sembawang Drive, Singapore 750404',1.4492,103.8183,'[{"station":"Sembawang","line":"NSL","distanceMeters":750}]'::jsonb,'[{"name":"Sun Plaza","type":"mall","distanceMeters":900,"walkingMinutes":12},{"name":"Sembawang Beach","type":"park","distanceMeters":1200,"walkingMinutes":15}]'::jsonb,'agent','20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000017','active',false,302,'Spacious 5-room HDB in tranquil Sembawang, with upcoming north corridor developments.',66,'["Largest HDB flat type","Quiet residential estate","North region growth potential"]'::jsonb,'2024-04-05 00:00:00+00','2024-04-20 00:00:00+00'),
('10000000-0000-0000-0000-000000000016','sale','HDB','D19','Serangoon','4-room','62','leasehold-99','550062','#09-12',9,12,650000,633,true,NULL,3,2,1027,NULL,NULL,'partial-furnished',1999,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 62 Serangoon North Avenue 4, Singapore 550062',1.3635,103.8660,'[{"station":"Serangoon","line":"CCL","distanceMeters":580}]'::jsonb,'[{"name":"NEX Mall","type":"mall","distanceMeters":700,"walkingMinutes":9},{"name":"Chomp Chomp Food Centre","type":"hawker","distanceMeters":800,"walkingMinutes":10}]'::jsonb,'agent','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000006','active',false,540,'Great-value 4-room in Serangoon, minutes from NEX mall and Serangoon MRT interchange.',70,'["CCL & NEL interchange access","Near NEX shopping mall","Chomp Chomp food paradise nearby"]'::jsonb,'2024-04-15 00:00:00+00','2024-05-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000017','sale','HDB','D23','Bukit Panjang','3gen','515A','leasehold-99','681515','#07-33',7,16,920000,581,false,NULL,5,4,1582,NULL,NULL,'unfurnished',2018,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 515A Bukit Panjang Ring Road, Singapore 681515',1.3788,103.7630,'[{"station":"Bukit Panjang","line":"DTL","distanceMeters":620}]'::jsonb,'[{"name":"Hillion Mall","type":"mall","distanceMeters":700,"walkingMinutes":9},{"name":"Zhenghua Primary School","type":"school","distanceMeters":450,"walkingMinutes":6}]'::jsonb,'agent','20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000006','active',false,630,'Rare 3Gen HDB designed for multi-generational living, spacious 1582sqft with dual kitchens.',78,'["Purpose-built multi-gen flat","Dual living areas","DTL connectivity"]'::jsonb,'2024-05-01 00:00:00+00','2024-05-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000018','sale','HDB','D18','Pasir Ris','executive','722','leasehold-99','510722','#05-22',5,12,860000,580,true,NULL,5,3,1485,NULL,NULL,'partial-furnished',1995,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 722 Pasir Ris Street 71, Singapore 510722',1.3731,103.9488,'[{"station":"Pasir Ris","line":"EWL","distanceMeters":800}]'::jsonb,'[{"name":"White Sands","type":"mall","distanceMeters":1000,"walkingMinutes":13},{"name":"Pasir Ris Beach","type":"park","distanceMeters":600,"walkingMinutes":8}]'::jsonb,'agent','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000012','active',false,455,'Rare Executive HDB in Pasir Ris, extra-large layout great for extended families.',73,'["Largest HDB type at 1485sqft","Near Pasir Ris beach and parks","Upcoming cross-island line"]'::jsonb,'2024-05-10 00:00:00+00','2024-05-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000019','rent','HDB','D22','Jurong East','4-room','241','leasehold-99','600241','#11-08',11,14,2700,3,false,NULL,3,2,1001,NULL,NULL,'fully-furnished',2002,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 241 Jurong East Street 24, Singapore 600241',1.3404,103.7424,'[{"station":"Jurong East","line":"EWL","distanceMeters":420}]'::jsonb,'[{"name":"JCube","type":"mall","distanceMeters":500,"walkingMinutes":7},{"name":"Westgate","type":"mall","distanceMeters":600,"walkingMinutes":8}]'::jsonb,'owner-direct',NULL,'00000000-0000-0000-0000-000000000017','active',false,267,'Fully furnished 4-room HDB in vibrant Jurong East, near JLD development zone.',57,'["Near Jurong Lake District development","JEM and Westgate shopping","Fully furnished"]'::jsonb,'2024-05-20 00:00:00+00','2024-06-05 00:00:00+00'),
('10000000-0000-0000-0000-000000000020','sale','HDB','D12','Kallang / Whampoa','4-room','64','leasehold-99','330064','#10-33',10,12,720000,699,true,NULL,3,2,1030,NULL,NULL,'unfurnished',2003,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'Blk 64 Whampoa Drive, Singapore 330064',1.3199,103.8627,'[{"station":"Boon Keng","line":"NEL","distanceMeters":400}]'::jsonb,'[{"name":"Bendemeer Primary School","type":"school","distanceMeters":500,"walkingMinutes":7},{"name":"Whampoa Market","type":"hawker","distanceMeters":200,"walkingMinutes":3}]'::jsonb,'agent','20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000005','active',false,598,'City-fringe 4-room HDB in Kallang/Whampoa, excellent access to Boon Keng MRT.',77,'["City fringe location","Near Little India and Farrer Park","High rental demand area"]'::jsonb,'2024-06-01 00:00:00+00','2024-06-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000021','sale','Condo','D15',NULL,NULL,NULL,'freehold','428689','#18-05',18,27,1550000,2214,false,3.2,2,2,700,NULL,NULL,'fully-furnished',2022,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":true}'::jsonb,'1 Seafront Walk, Seaside Residences, Singapore 428689',1.3014,103.9081,'[{"station":"Marine Parade","line":"TEL","distanceMeters":550}]'::jsonb,'[{"name":"East Coast Park","type":"park","distanceMeters":200,"walkingMinutes":3},{"name":"Parkway Parade","type":"mall","distanceMeters":1200,"walkingMinutes":15}]'::jsonb,'agent','20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000010','active',true,2340,'Stunning sea-facing condo at East Coast, steps from the beach with full resort facilities.',96,'["Unblocked sea views","Steps to East Coast Park","Freehold tenure"]'::jsonb,'2024-01-10 00:00:00+00','2024-01-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000022','sale','Condo','D12',NULL,NULL,NULL,'freehold','329560','#08-12',8,24,1280000,1888,false,3.5,2,2,678,NULL,NULL,'unfurnished',2026,'2026-06-30','legal-docs-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":false}'::jsonb,'1 Boon Keng Road, The Arcady at Boon Keng, Singapore 329560',1.3199,103.8627,'[{"station":"Boon Keng","line":"NEL","distanceMeters":280}]'::jsonb,'[{"name":"City Square Mall","type":"mall","distanceMeters":1000,"walkingMinutes":13},{"name":"Whampoa Market","type":"hawker","distanceMeters":600,"walkingMinutes":8}]'::jsonb,'agent','20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000011','active',true,1870,'New launch freehold condo at Boon Keng, city-fringe location with NEL MRT at doorstep.',91,'["Freehold new launch","Steps to Boon Keng MRT","City fringe location"]'::jsonb,'2024-01-12 00:00:00+00','2024-02-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000023','sale','Condo','D09',NULL,NULL,NULL,'freehold','229563','#22-08',22,36,4800000,3404,false,2.8,3,3,1410,NULL,NULL,'unfurnished',2023,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":true}'::jsonb,'72 Cairnhill Road, Klimt Cairnhill, Singapore 229563',1.3048,103.8318,'[{"station":"Orchard","line":"NSL","distanceMeters":600}]'::jsonb,'[{"name":"ION Orchard","type":"mall","distanceMeters":700,"walkingMinutes":9},{"name":"Camden Medical Centre","type":"clinic","distanceMeters":400,"walkingMinutes":5}]'::jsonb,'agent','20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000005','active',true,3240,'Prestigious freehold luxury condo in prime Cairnhill enclave, steps from Orchard Road.',98,'["Prime D09 freehold","Orchard Road lifestyle","Panoramic city skyline views"]'::jsonb,'2024-01-05 00:00:00+00','2024-01-20 00:00:00+00'),
('10000000-0000-0000-0000-000000000024','sale','Condo','D13',NULL,NULL,NULL,'leasehold-99','358009','#12-20',12,18,1350000,1901,true,3.4,2,2,710,NULL,NULL,'partial-furnished',2022,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'2 Potong Pasir Avenue 1, The Tre Ver, Singapore 358009',1.3315,103.8689,'[{"station":"Potong Pasir","line":"NEL","distanceMeters":300}]'::jsonb,'[{"name":"Sungei Kallang Riverside","type":"park","distanceMeters":150,"walkingMinutes":2},{"name":"Bendemeer Road Hawker","type":"hawker","distanceMeters":500,"walkingMinutes":7}]'::jsonb,'agent','20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000009','active',true,1450,'Riverside condo at Potong Pasir, tranquil setting with NEL MRT access and city connectivity.',90,'["Riverfront living","Steps to Potong Pasir MRT","Quiet enclave near city"]'::jsonb,'2024-02-05 00:00:00+00','2024-02-20 00:00:00+00'),
('10000000-0000-0000-0000-000000000025','rent','Condo','D14',NULL,NULL,NULL,'leasehold-99','400017','#15-08',15,22,4500,6,false,NULL,2,2,753,NULL,NULL,'fully-furnished',2022,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'12 Sims Avenue, Parc Esta, Singapore 400017',1.3193,103.9001,'[{"station":"Eunos","line":"EWL","distanceMeters":200}]'::jsonb,'[{"name":"Eunos Market and Food Centre","type":"hawker","distanceMeters":300,"walkingMinutes":4},{"name":"Paya Lebar Square","type":"mall","distanceMeters":1000,"walkingMinutes":13}]'::jsonb,'agent','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000010','active',true,2100,'Fully furnished premium rental at Parc Esta, adjacent to Eunos MRT, ideal for professionals.',93,'["Eunos MRT at doorstep","Fully furnished","Brand new 2022 development"]'::jsonb,'2024-02-01 00:00:00+00','2024-02-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000026','sale','Condo','D02',NULL,NULL,NULL,'freehold','089279','#20-01',20,28,1180000,2549,false,3.0,1,1,463,NULL,NULL,'unfurnished',2022,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'1 Everton Park, Sky Everton, Singapore 089279',1.2789,103.8390,'[{"station":"Outram Park","line":"TEL","distanceMeters":350}]'::jsonb,'[{"name":"Tanjong Pagar Plaza","type":"mall","distanceMeters":400,"walkingMinutes":5},{"name":"Outram Park Food Centre","type":"hawker","distanceMeters":300,"walkingMinutes":4}]'::jsonb,'agent','20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000016','active',true,1680,'Freehold investment gem in Outram/Tanjong Pagar enclave, high floor with city views.',94,'["Freehold in prime D02","Outram MRT interchange","CBD fringe rental demand"]'::jsonb,'2024-01-18 00:00:00+00','2024-02-03 00:00:00+00'),
('10000000-0000-0000-0000-000000000027','sale','Condo','D05',NULL,NULL,NULL,'leasehold-99','119003','#14-28',14,24,1820000,1798,true,3.1,3,2,1012,NULL,NULL,'unfurnished',2023,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":false}'::jsonb,'1 Normanton Park, Singapore 119003',1.2966,103.7836,'[{"station":"Kent Ridge","line":"CCL","distanceMeters":850}]'::jsonb,'[{"name":"Rochester Mall","type":"mall","distanceMeters":600,"walkingMinutes":8},{"name":"NUS University Town","type":"education","distanceMeters":1000,"walkingMinutes":13}]'::jsonb,'agent','20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000011','active',true,1950,'Mega development Normanton Park, close to NUS and one-north business park in the west.',89,'["1800+ unit mega development","Near NUS and one-north","Large 3BR layout"]'::jsonb,'2024-01-22 00:00:00+00','2024-02-07 00:00:00+00'),
('10000000-0000-0000-0000-000000000028','sale','Condo','D19',NULL,NULL,NULL,'leasehold-99','534833','#09-15',9,18,1290000,1762,true,3.3,2,2,732,NULL,NULL,'unfurnished',2023,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'2 Hougang Avenue 2, The Florence Residences, Singapore 534833',1.3721,103.8888,'[{"station":"Hougang","line":"NEL","distanceMeters":480}]'::jsonb,'[{"name":"Hougang Mall","type":"mall","distanceMeters":600,"walkingMinutes":8},{"name":"Punggol Park Connector","type":"park","distanceMeters":400,"walkingMinutes":5}]'::jsonb,'agent','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000012','active',true,1330,'Modern condo in northeast Singapore with resort-style facilities and Hougang MRT access.',87,'["Resort-style facilities","Near Hougang MRT","CRL future connectivity boost"]'::jsonb,'2024-02-08 00:00:00+00','2024-02-22 00:00:00+00'),
('10000000-0000-0000-0000-000000000029','sale','Condo','D15',NULL,NULL,NULL,'freehold','430006','#05-10',5,10,2100000,2333,false,3.0,3,3,900,NULL,NULL,'unfurnished',2025,'2025-12-31','legal-docs-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":false}'::jsonb,'6 Thiam Siew Avenue, The Continuum, Singapore 430006',1.3218,103.8267,'[{"station":"Haig Road","line":"TEL","distanceMeters":300}]'::jsonb,'[{"name":"Katong Shopping Centre","type":"mall","distanceMeters":800,"walkingMinutes":10},{"name":"East Coast Park","type":"park","distanceMeters":1500,"walkingMinutes":18}]'::jsonb,'agent','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000009','active',false,1120,'Freehold new launch in the prestigious D15 Katong enclave, rare large 3BR unit.',85,'["Freehold D15 new launch","Near TEL Haig Road MRT","Katong heritage lifestyle"]'::jsonb,'2024-03-01 00:00:00+00','2024-03-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000030','sale','Condo','D11',NULL,NULL,NULL,'freehold','258488','#12-02',12,20,3800000,3524,false,2.5,3,3,1078,NULL,NULL,'fully-furnished',2024,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":true}'::jsonb,'19 Nassim Hill, Singapore 258488',1.3048,103.8200,'[{"station":"Orchard","line":"TEL","distanceMeters":700}]'::jsonb,'[{"name":"Orchard Road Shopping Belt","type":"mall","distanceMeters":800,"walkingMinutes":10},{"name":"Botanic Gardens","type":"park","distanceMeters":900,"walkingMinutes":12}]'::jsonb,'agent','20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000013','active',false,1840,'Ultra-luxury freehold condo in prestigious Nassim Hill, near Orchard and Botanic Gardens.',97,'["Nassim Hill luxury address","Near Botanic Gardens","Full butler and concierge"]'::jsonb,'2024-03-10 00:00:00+00','2024-03-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000031','sale','EC','D22',NULL,NULL,NULL,'leasehold-99','648886','#06-18',6,14,1180000,1417,false,NULL,3,2,833,NULL,NULL,'unfurnished',2025,'2025-06-30','legal-docs-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'2 Tengah Garden Walk, Copen Grand, Singapore 648886',1.3404,103.7090,'[{"station":"Tengah Plantation","line":"JRL","distanceMeters":420}]'::jsonb,'[{"name":"Tengah Town Centre (upcoming)","type":"mall","distanceMeters":800,"walkingMinutes":10},{"name":"Tengah Eco Sanctuary","type":"park","distanceMeters":300,"walkingMinutes":4}]'::jsonb,'agent','20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000010','active',false,890,'EC in eco-friendly Tengah Forest Town, Singapore first car-lite town with JRL connectivity.',82,'["EC pricing advantage","Tengah forest town eco living","JRL new line access"]'::jsonb,'2024-03-20 00:00:00+00','2024-04-05 00:00:00+00'),
('10000000-0000-0000-0000-000000000032','sale','Condo','D18',NULL,NULL,NULL,'leasehold-99','533020','#10-22',10,18,950000,1520,true,3.6,2,2,625,NULL,NULL,'unfurnished',2023,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'5 Sims Drive, The Penrose, Singapore 533020',1.3537,103.9437,'[{"station":"Kembangan","line":"EWL","distanceMeters":580}]'::jsonb,'[{"name":"Tampines Regional Library","type":"education","distanceMeters":1000,"walkingMinutes":13},{"name":"Bedok Town Square","type":"mall","distanceMeters":900,"walkingMinutes":12}]'::jsonb,'agent','20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000011','active',false,710,'Value 2-bedroom in The Penrose, east Singapore connectivity with strong rental demand.',74,'["Good rental yield area","East coast accessibility","New 2023 completion"]'::jsonb,'2024-04-01 00:00:00+00','2024-04-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000033','sale','Condo','D20',NULL,NULL,NULL,'freehold','579837','#08-14',8,12,1250000,1786,false,3.2,2,2,700,NULL,NULL,'partial-furnished',2016,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'8 Marymount Road, Bishan 8, Singapore 579837',1.3521,103.8490,'[{"station":"Bishan","line":"NSL","distanceMeters":400}]'::jsonb,'[{"name":"Junction 8","type":"mall","distanceMeters":500,"walkingMinutes":7},{"name":"Bishan-AMK Park","type":"park","distanceMeters":600,"walkingMinutes":8}]'::jsonb,'agent','20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000012','active',false,650,'Freehold condo at the heart of Bishan, walkable to Bishan MRT and Junction 8.',75,'["Freehold in central Singapore","Walk to Bishan MRT","Junction 8 retail access"]'::jsonb,'2024-04-10 00:00:00+00','2024-04-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000034','rent','Condo','D18',NULL,NULL,NULL,'leasehold-99','521851','#12-05',12,20,3800,5,true,NULL,3,2,818,NULL,NULL,'fully-furnished',2023,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'18 Tampines Lane, Treasure at Tampines, Singapore 521851',1.3537,103.9437,'[{"station":"Tampines West","line":"DTL","distanceMeters":680}]'::jsonb,'[{"name":"Tampines Mall","type":"mall","distanceMeters":900,"walkingMinutes":12},{"name":"Tampines Hub","type":"sports","distanceMeters":1000,"walkingMinutes":13}]'::jsonb,'agent','20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000009','active',false,560,'Fully furnished 3BR condo in Tampines, excellent for families with Tampines Hub nearby.',78,'["Fully furnished family condo","Near Tampines Hub and parks","DTL connectivity"]'::jsonb,'2024-04-20 00:00:00+00','2024-05-05 00:00:00+00'),
('10000000-0000-0000-0000-000000000035','sale','Condo','D05',NULL,NULL,NULL,'leasehold-99','119930','#16-08',16,24,1620000,1800,false,3.0,3,2,900,NULL,NULL,'unfurnished',2018,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'1 Clementi Avenue 5, The Trilinq, Singapore 119930',1.3162,103.7649,'[{"station":"Clementi","line":"EWL","distanceMeters":430}]'::jsonb,'[{"name":"Clementi Mall","type":"mall","distanceMeters":500,"walkingMinutes":7},{"name":"NUS Campus","type":"education","distanceMeters":1200,"walkingMinutes":15}]'::jsonb,'agent','20000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000013','active',false,780,'Spacious 3-bedroom in The Trilinq, ideal for NUS academics and west region professionals.',79,'["Near NUS and one-north","Large 3BR layout","Clementi MRT walkable"]'::jsonb,'2024-05-01 00:00:00+00','2024-05-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000036','rent','Condo','D22',NULL,NULL,NULL,'leasehold-99','648888','#08-30',8,16,3200,4,true,NULL,2,2,764,NULL,NULL,'fully-furnished',2019,NULL,'unverified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'10 Jurong Lake Link, Lake Grande, Singapore 648888',1.3404,103.7090,'[{"station":"Lakeside","line":"EWL","distanceMeters":320}]'::jsonb,'[{"name":"Jurong Lake Gardens","type":"park","distanceMeters":400,"walkingMinutes":5},{"name":"IMM Mall","type":"mall","distanceMeters":900,"walkingMinutes":12}]'::jsonb,'agent','20000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000016','active',false,420,'Lakeside condo rental with beautiful Jurong Lake views and EWL MRT access.',65,'["Jurong Lake Gardens facing","Steps to Lakeside MRT","JLD future appreciation"]'::jsonb,'2024-05-10 00:00:00+00','2024-05-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000037','sale','Condo','D23',NULL,NULL,NULL,'leasehold-99','688756','#11-04',11,16,1090000,1454,true,3.7,2,2,750,NULL,NULL,'unfurnished',2020,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'88 Bukit Panjang Road, Singapore 688756',1.3788,103.7630,'[{"station":"Bukit Panjang","line":"DTL","distanceMeters":500}]'::jsonb,'[{"name":"Hillion Mall","type":"mall","distanceMeters":600,"walkingMinutes":8},{"name":"Dairy Farm Nature Park","type":"park","distanceMeters":800,"walkingMinutes":10}]'::jsonb,'agent','20000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000017','active',false,490,'Affordable condo in Bukit Panjang, near Hillion Mall and Dairy Farm Nature Park.',67,'["Value west Singapore condo","DTL connectivity","Near nature parks"]'::jsonb,'2024-05-15 00:00:00+00','2024-06-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000038','sale','Condo','D13',NULL,NULL,NULL,'leasehold-99','357928','#07-15',7,14,1480000,1900,false,3.1,2,2,779,NULL,NULL,'unfurnished',2022,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'1 Bidadari Park Drive, Woodleigh Residences, Singapore 357928',1.3315,103.8689,'[{"station":"Woodleigh","line":"NEL","distanceMeters":250}]'::jsonb,'[{"name":"Bidadari Park","type":"park","distanceMeters":300,"walkingMinutes":4},{"name":"Woodleigh Village Mall (upcoming)","type":"mall","distanceMeters":300,"walkingMinutes":4}]'::jsonb,'agent','20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000010','under-offer',false,850,'Integrated development at Bidadari, with MRT, mall and park all connected.',83,'["Integrated MRT and mall","Bidadari park living","Strong NEL connectivity"]'::jsonb,'2024-02-12 00:00:00+00','2024-04-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000039','rent','Condo','D19',NULL,NULL,NULL,'leasehold-99','534817','#20-12',20,27,4200,6,true,NULL,3,2,958,NULL,NULL,'fully-furnished',2022,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'110 Hougang Avenue 2, Riverfront Residences, Singapore 534817',1.3721,103.8888,'[{"station":"Hougang","line":"NEL","distanceMeters":620}]'::jsonb,'[{"name":"Serangoon River Park Connector","type":"park","distanceMeters":200,"walkingMinutes":3},{"name":"Hougang Mall","type":"mall","distanceMeters":750,"walkingMinutes":10}]'::jsonb,'agent','20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000011','active',false,620,'High-floor river-facing 3BR rental in Riverfront Residences with panoramic views.',81,'["Panoramic river views","High floor unit","Resort-style facilities"]'::jsonb,'2024-04-25 00:00:00+00','2024-05-10 00:00:00+00'),
('10000000-0000-0000-0000-000000000040','sale','Condo','D23',NULL,NULL,NULL,'freehold','689564','#14-01',14,20,1380000,1918,true,3.4,2,2,720,NULL,NULL,'partial-furnished',2022,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'7 Hillview Rise, Midwood, Singapore 689564',1.3600,103.7630,'[{"station":"Hillview","line":"DTL","distanceMeters":300}]'::jsonb,'[{"name":"HillV2","type":"mall","distanceMeters":350,"walkingMinutes":5},{"name":"Dairy Farm Park","type":"park","distanceMeters":500,"walkingMinutes":7}]'::jsonb,'agent','20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000012','active',false,540,'Freehold condo adjacent to Hillview MRT and HillV2 retail, near Bukit Timah nature.',76,'["Freehold status","Steps to Hillview MRT","Near Bukit Timah nature reserve"]'::jsonb,'2024-05-20 00:00:00+00','2024-06-05 00:00:00+00'),
('10000000-0000-0000-0000-000000000041','sale','Landed','D19',NULL,NULL,NULL,'freehold','556099',NULL,NULL,NULL,5200000,1625,true,NULL,5,5,3200,4800,3200,'unfurnished',2010,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'15 Serangoon Garden Way, Singapore 556099',1.3635,103.8660,'[{"station":"Serangoon","line":"CCL","distanceMeters":900}]'::jsonb,'[{"name":"Chomp Chomp Food Centre","type":"hawker","distanceMeters":400,"walkingMinutes":5},{"name":"Serangoon Gardens Country Club","type":"sports","distanceMeters":600,"walkingMinutes":8}]'::jsonb,'agent','20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000017','active',false,1120,'Freehold detached house in coveted Serangoon Gardens enclave, brand new 2010 rebuilt.',85,'["Exclusive Serangoon Gardens address","Fully detached with private garden","Freehold"]'::jsonb,'2024-01-30 00:00:00+00','2024-02-14 00:00:00+00'),
('10000000-0000-0000-0000-000000000042','sale','Landed','D15',NULL,NULL,NULL,'freehold','458899',NULL,NULL,NULL,3800000,1520,true,NULL,4,3,2500,3200,2500,'partial-furnished',2005,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'22 Frankel Terrace, Singapore 458899',1.3036,103.9080,'[{"station":"Kembangan","line":"EWL","distanceMeters":800}]'::jsonb,'[{"name":"Siglap Market","type":"hawker","distanceMeters":500,"walkingMinutes":7},{"name":"Katong Park","type":"park","distanceMeters":1000,"walkingMinutes":13}]'::jsonb,'agent','20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000011','active',false,890,'Charming semi-D in established Frankel Estate, sought-after D15 freehold landed enclave.',82,'["Prestigious Frankel Estate address","Freehold semi-detached","East Coast lifestyle"]'::jsonb,'2024-02-15 00:00:00+00','2024-03-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000043','sale','Landed','D04',NULL,NULL,NULL,'leasehold-99','098264',NULL,NULL,NULL,12500000,1786,false,NULL,6,6,7000,9500,7000,'fully-furnished',2012,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":true}'::jsonb,'18 Ocean Drive, Sentosa Cove, Singapore 098264',1.2494,103.8303,'[{"station":"HarbourFront","line":"CCL","distanceMeters":2500}]'::jsonb,'[{"name":"ONE Degrees North Marina","type":"sports","distanceMeters":300,"walkingMinutes":4},{"name":"W Singapore Sentosa Cove","type":"hotel","distanceMeters":400,"walkingMinutes":5}]'::jsonb,'agent','20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000013','active',false,2100,'Ultra-luxury waterfront bungalow at Sentosa Cove with private berth and resort-style amenities.',95,'["Private marina berth","Sentosa Cove gated community","Luxury resort lifestyle"]'::jsonb,'2024-01-08 00:00:00+00','2024-01-22 00:00:00+00'),
('10000000-0000-0000-0000-000000000044','sale','Landed','D21',NULL,NULL,NULL,'freehold','588179',NULL,NULL,NULL,28000000,1867,false,NULL,7,6,15000,20000,15000,'unfurnished',2018,NULL,'fully-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":true,"has360Tour":false}'::jsonb,'5 Coronation Road West, Singapore 588179',1.3348,103.7755,'[{"station":"King Albert Park","line":"DTL","distanceMeters":950}]'::jsonb,'[{"name":"Bukit Timah Nature Reserve","type":"park","distanceMeters":500,"walkingMinutes":7},{"name":"Swiss Club Singapore","type":"sports","distanceMeters":800,"walkingMinutes":10}]'::jsonb,'agent','20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000016','active',false,1850,'Exceptional Good Class Bungalow in the prestigious Bukit Timah GCB Area, the pinnacle of luxury living.',98,'["Good Class Bungalow area","Ultra-prime D21 address","Near Bukit Timah Nature Reserve"]'::jsonb,'2024-01-03 00:00:00+00','2024-01-17 00:00:00+00'),
('10000000-0000-0000-0000-000000000045','sale','Landed','D15',NULL,NULL,NULL,'freehold','427644',NULL,NULL,NULL,2900000,1611,true,NULL,3,2,1800,2400,1800,'unfurnished',1960,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'88 Joo Chiat Place, Singapore 427644',1.3073,103.9024,'[{"station":"Paya Lebar","line":"CCL","distanceMeters":900}]'::jsonb,'[{"name":"Joo Chiat Complex","type":"mall","distanceMeters":400,"walkingMinutes":5},{"name":"East Coast Park","type":"park","distanceMeters":1500,"walkingMinutes":18}]'::jsonb,'agent','20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000009','pending',false,730,'Heritage Peranakan terrace in the vibrant Joo Chiat enclave, full of culture and character.',69,'["Peranakan heritage character","Joo Chiat heritage enclave","Freehold terrace"]'::jsonb,'2024-03-05 00:00:00+00','2024-04-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000046','rent','Landed','D16',NULL,NULL,NULL,'freehold','456133',NULL,NULL,NULL,9500,NULL,true,NULL,4,3,2200,3000,2200,'partial-furnished',2008,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'55 Siglap Road, Singapore 456133',1.3153,103.9277,'[{"station":"Marine Parade","line":"TEL","distanceMeters":1000}]'::jsonb,'[{"name":"Siglap Centre","type":"mall","distanceMeters":400,"walkingMinutes":5},{"name":"East Coast Park","type":"park","distanceMeters":800,"walkingMinutes":10}]'::jsonb,'owner-direct',NULL,'00000000-0000-0000-0000-000000000017','active',false,480,'Spacious semi-detached home in peaceful Siglap, ideal for expat families near East Coast.',72,'["Large semi-D with garden","East Coast lifestyle","Expat-popular area"]'::jsonb,'2024-03-20 00:00:00+00','2024-04-05 00:00:00+00'),
('10000000-0000-0000-0000-000000000047','sale','Landed','D19',NULL,NULL,NULL,'freehold','548143',NULL,NULL,NULL,2600000,1625,true,NULL,3,2,1600,2100,1600,'unfurnished',1995,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":false,"has3DModel":false,"has360Tour":false}'::jsonb,'12 Kovan Road, Singapore 548143',1.3601,103.8887,'[{"station":"Kovan","line":"NEL","distanceMeters":450}]'::jsonb,'[{"name":"Heartland Mall Kovan","type":"mall","distanceMeters":500,"walkingMinutes":7},{"name":"Serangoon Nex","type":"mall","distanceMeters":1200,"walkingMinutes":15}]'::jsonb,'agent','20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000015','active',false,595,'Charming freehold terrace in established Kovan estate, steps from Kovan MRT.',68,'["Freehold landed at entry price","Kovan MRT walkable","Good rental potential"]'::jsonb,'2024-04-10 00:00:00+00','2024-04-25 00:00:00+00'),
('10000000-0000-0000-0000-000000000048','sale','Commercial','D02',NULL,NULL,NULL,'freehold','089059',NULL,NULL,NULL,3200000,2667,false,NULL,0,2,1200,NULL,NULL,'unfurnished',1940,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'50 Tanjong Pagar Road, Singapore 089059',1.2789,103.8390,'[{"station":"Tanjong Pagar","line":"EWL","distanceMeters":200}]'::jsonb,'[{"name":"Tanjong Pagar Plaza","type":"mall","distanceMeters":300,"walkingMinutes":4},{"name":"Maxwell Food Centre","type":"hawker","distanceMeters":400,"walkingMinutes":5}]'::jsonb,'agent','20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000016','active',false,650,'Conservation shophouse in Tanjong Pagar CBD fringe, ideal for F&B or retail business.',80,'["Conservation shophouse","CBD fringe location","Freehold commercial asset"]'::jsonb,'2024-02-20 00:00:00+00','2024-03-05 00:00:00+00'),
('10000000-0000-0000-0000-000000000049','rent','Commercial','D09',NULL,NULL,NULL,'leasehold-99','238858','#06-02',6,20,6500,8,true,NULL,0,1,800,NULL,NULL,'partial-furnished',2005,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'101 Orchard Road, Orchard Point, Singapore 238858',1.3048,103.8318,'[{"station":"Orchard","line":"TEL","distanceMeters":250}]'::jsonb,'[{"name":"Orchard Road Retail Belt","type":"mall","distanceMeters":100,"walkingMinutes":2},{"name":"Wheelock Place","type":"mall","distanceMeters":200,"walkingMinutes":3}]'::jsonb,'agent','20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000017','active',false,380,'Premium office space in heart of Orchard Road, steps from Orchard MRT interchange.',77,'["Orchard MRT at doorstep","Prime retail belt office","Prestigious Orchard address"]'::jsonb,'2024-03-15 00:00:00+00','2024-03-30 00:00:00+00'),
('10000000-0000-0000-0000-000000000050','sale','Commercial','D14',NULL,NULL,NULL,'leasehold-99','409014','#02-18',2,5,1800000,3000,true,NULL,0,1,600,NULL,NULL,'unfurnished',2018,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'60 Paya Lebar Road, Paya Lebar Square, Singapore 409014',1.3180,103.8930,'[{"station":"Paya Lebar","line":"EWL","distanceMeters":150}]'::jsonb,'[{"name":"PLQ Mall","type":"mall","distanceMeters":300,"walkingMinutes":4},{"name":"Geylang Serai Market","type":"hawker","distanceMeters":800,"walkingMinutes":10}]'::jsonb,'agent','20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000016','active',false,290,'Retail unit in thriving Paya Lebar commercial hub, excellent footfall and MRT access.',71,'["Paya Lebar MRT direct access","High footfall commercial zone","Part of PLQ development"]'::jsonb,'2024-04-01 00:00:00+00','2024-04-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000051','sale','HDB','D16','Bedok','4-room','22','leasehold-99','460022','#09-12',9,14,650000,590,true,NULL,3,2,1100,NULL,NULL,'partial-furnished',2005,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'Blk 22 Bedok South Avenue 2, Singapore 460022',1.3217,103.9350,'[{"station":"Bedok","line":"EWL","distanceMeters":600}]'::jsonb,'[{"name":"Bedok Mall","type":"mall","distanceMeters":600,"walkingMinutes":8},{"name":"Bedok Point","type":"mall","distanceMeters":500,"walkingMinutes":7}]'::jsonb,'agent','20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','active',true,1100,'Well-maintained 4-room flat in Bedok South, close to MRT and amenities.',85,'["Close to MRT","Mature estate","Spacious layout"]'::jsonb,'2024-05-01 00:00:00+00','2024-05-15 00:00:00+00'),
('10000000-0000-0000-0000-000000000052','sale','HDB','D18','Pasir Ris','5-room','101','leasehold-99','510101','#12-34',12,16,780000,630,true,NULL,4,3,1250,NULL,NULL,'fully-furnished',2010,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":true}'::jsonb,'Blk 101 Pasir Ris Street 12, Singapore 510101',1.3737,103.9537,'[{"station":"Pasir Ris","line":"EWL","distanceMeters":800}]'::jsonb,'[{"name":"White Sands","type":"mall","distanceMeters":800,"walkingMinutes":10},{"name":"Downtown East","type":"mall","distanceMeters":1000,"walkingMinutes":12}]'::jsonb,'agent','20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000005','active',true,1250,'Spacious 5-room flat in Pasir Ris, perfect for large families.',88,'["Large layout","Near MRT and amenities","Quiet neighborhood"]'::jsonb,'2024-05-10 00:00:00+00','2024-05-20 00:00:00+00'),
('10000000-0000-0000-0000-000000000053','sale','Condo','D18',NULL,NULL,NULL,'leasehold-99','520123','#15-01',15,20,1250000,1100,false,3.5,3,2,1150,NULL,NULL,'partial-furnished',2018,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'123 Tampines Avenue 10, Singapore 520123',1.3550,103.9350,'[{"station":"Tampines","line":"EWL","distanceMeters":1000}]'::jsonb,'[{"name":"Tampines Mall","type":"mall","distanceMeters":1000,"walkingMinutes":12},{"name":"Tampines Hub","type":"sports","distanceMeters":1200,"walkingMinutes":15}]'::jsonb,'agent','20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000005','active',false,950,'Modern Executive Condo in Tampines, offering great facilities and connectivity.',82,'["Modern facilities","High floor","Good rental yield"]'::jsonb,'2024-05-15 00:00:00+00','2024-06-01 00:00:00+00'),
('10000000-0000-0000-0000-000000000054','sale','Condo','D19',NULL,NULL,NULL,'leasehold-99','820456','#10-22',10,15,1150000,1050,true,3.2,3,2,1100,NULL,NULL,'unfurnished',2020,NULL,'ownership-verified','[]'::jsonb,'{"has2DFloorplan":true,"has3DModel":false,"has360Tour":false}'::jsonb,'456 Punggol Field, Singapore 820456',1.4000,103.9000,'[{"station":"Punggol","line":"NEL","distanceMeters":800}]'::jsonb,'[{"name":"Waterway Point","type":"mall","distanceMeters":800,"walkingMinutes":10},{"name":"Punggol Waterway Park","type":"park","distanceMeters":500,"walkingMinutes":7}]'::jsonb,'agent','20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000005','active',false,880,'Newly completed Executive Condo in Punggol, near parks and amenities.',80,'["Near parks","New development","Good connectivity"]'::jsonb,'2024-06-01 00:00:00+00','2024-06-10 00:00:00+00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding property_images (54 properties, 1 image each)
-- ============================================================
INSERT INTO property_images (id, property_id, url, order_index, caption, created_at) VALUES
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'https://placehold.co/800x600/E8F5E9/2E7D32?text=Prop+001', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'https://placehold.co/800x600/E3F2FD/1565C0?text=Prop+002', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'https://placehold.co/800x600/FFF8E1/F57F17?text=Prop+003', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'https://placehold.co/800x600/FCE4EC/AD1457?text=Prop+004', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'https://placehold.co/800x600/F3E5F5/6A1B9A?text=Prop+005', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'https://placehold.co/800x600/E0F7FA/006064?text=Prop+006', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'https://placehold.co/800x600/E8EAF6/1A237E?text=Prop+007', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'https://placehold.co/800x600/F9FBE7/827717?text=Prop+008', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'https://placehold.co/800x600/FBE9E7/BF360C?text=Prop+009', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'https://placehold.co/800x600/E8F5E9/1B5E20?text=Prop+010', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'https://placehold.co/800x600/E3F2FD/0D47A1?text=Prop+011', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'https://placehold.co/800x600/FFF3E0/E65100?text=Prop+012', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 'https://placehold.co/800x600/FCE4EC/880E4F?text=Prop+013', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000014', 'https://placehold.co/800x600/F3E5F5/4A148C?text=Prop+014', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 'https://placehold.co/800x600/E0F7FA/004D40?text=Prop+015', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'https://placehold.co/800x600/E8EAF6/0D47A1?text=Prop+016', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'https://placehold.co/800x600/F9FBE7/33691E?text=Prop+017', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'https://placehold.co/800x600/FBE9E7/870000?text=Prop+018', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000019', 'https://placehold.co/800x600/E8F5E9/2E7D32?text=Prop+019', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000020', 'https://placehold.co/800x600/E3F2FD/1565C0?text=Prop+020', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000021', 'https://placehold.co/800x600/FFF8E1/F57F17?text=Prop+021', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000022', 'https://placehold.co/800x600/FCE4EC/AD1457?text=Prop+022', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000023', 'https://placehold.co/800x600/F3E5F5/6A1B9A?text=Prop+023', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000024', 'https://placehold.co/800x600/E0F7FA/006064?text=Prop+024', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000025', 'https://placehold.co/800x600/E8EAF6/1A237E?text=Prop+025', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000026', 'https://placehold.co/800x600/F9FBE7/827717?text=Prop+026', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000027', 'https://placehold.co/800x600/FBE9E7/BF360C?text=Prop+027', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000028', 'https://placehold.co/800x600/E8F5E9/1B5E20?text=Prop+028', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000029', 'https://placehold.co/800x600/E3F2FD/0D47A1?text=Prop+029', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000030', 'https://placehold.co/800x600/FFF3E0/E65100?text=Prop+030', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000031', 'https://placehold.co/800x600/FCE4EC/880E4F?text=Prop+031', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000032', '10000000-0000-0000-0000-000000000032', 'https://placehold.co/800x600/F3E5F5/4A148C?text=Prop+032', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000033', '10000000-0000-0000-0000-000000000033', 'https://placehold.co/800x600/E0F7FA/004D40?text=Prop+033', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000034', '10000000-0000-0000-0000-000000000034', 'https://placehold.co/800x600/E8EAF6/0D47A1?text=Prop+034', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000035', '10000000-0000-0000-0000-000000000035', 'https://placehold.co/800x600/F9FBE7/33691E?text=Prop+035', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000036', '10000000-0000-0000-0000-000000000036', 'https://placehold.co/800x600/FBE9E7/870000?text=Prop+036', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000037', '10000000-0000-0000-0000-000000000037', 'https://placehold.co/800x600/E8F5E9/2E7D32?text=Prop+037', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000038', '10000000-0000-0000-0000-000000000038', 'https://placehold.co/800x600/E3F2FD/1565C0?text=Prop+038', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000039', '10000000-0000-0000-0000-000000000039', 'https://placehold.co/800x600/FFF8E1/F57F17?text=Prop+039', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000040', 'https://placehold.co/800x600/FCE4EC/AD1457?text=Prop+040', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000041', 'https://placehold.co/800x600/F3E5F5/6A1B9A?text=Prop+041', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000042', 'https://placehold.co/800x600/E0F7FA/006064?text=Prop+042', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000043', '10000000-0000-0000-0000-000000000043', 'https://placehold.co/800x600/E8EAF6/1A237E?text=Prop+043', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000044', '10000000-0000-0000-0000-000000000044', 'https://placehold.co/800x600/F9FBE7/827717?text=Prop+044', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000045', '10000000-0000-0000-0000-000000000045', 'https://placehold.co/800x600/FBE9E7/BF360C?text=Prop+045', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000046', '10000000-0000-0000-0000-000000000046', 'https://placehold.co/800x600/E8F5E9/1B5E20?text=Prop+046', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000047', '10000000-0000-0000-0000-000000000047', 'https://placehold.co/800x600/E3F2FD/0D47A1?text=Prop+047', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000048', '10000000-0000-0000-0000-000000000048', 'https://placehold.co/800x600/FFF3E0/E65100?text=Prop+048', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000049', '10000000-0000-0000-0000-000000000049', 'https://placehold.co/800x600/FCE4EC/880E4F?text=Prop+049', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000050', 'https://placehold.co/800x600/F3E5F5/4A148C?text=Prop+050', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000051', 'https://placehold.co/800x600/E0F7FA/004D40?text=Prop+051', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000052', '10000000-0000-0000-0000-000000000052', 'https://placehold.co/800x600/E8EAF6/0D47A1?text=Prop+052', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000053', '10000000-0000-0000-0000-000000000053', 'https://placehold.co/800x600/F9FBE7/33691E?text=Prop+053', 0, 'Main view', NOW()),
('50000000-0000-0000-0000-000000000054', '10000000-0000-0000-0000-000000000054', 'https://placehold.co/800x600/FBE9E7/870000?text=Prop+054', 0, 'Main view', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding learning_modules (15 total)
-- ============================================================
INSERT INTO learning_modules (id, title, category, difficulty, duration_minutes, slug, content_url, published_at, prerequisites, created_at, updated_at) VALUES
('70000000-0000-0000-0000-000000000001', 'Understanding ABSD - And How to Minimise It', 'LegalTax', 'Intermediate', 25, 'understanding-absd', NULL, '2023-01-15 00:00:00+00', '[]'::jsonb, '2023-01-15 00:00:00+00', '2024-03-10 00:00:00+00'),
('70000000-0000-0000-0000-000000000002', 'HDB vs Bank Loan: Calculator and Comparison', 'Financing', 'Beginner', 15, 'hdb-vs-bank-loan', NULL, '2023-02-01 00:00:00+00', '[]'::jsonb, '2023-02-01 00:00:00+00', '2024-02-20 00:00:00+00'),
('70000000-0000-0000-0000-000000000003', 'Step-by-Step HDB Resale Process', 'Buying', 'Beginner', 30, 'hdb-resale-process', NULL, '2023-02-15 00:00:00+00', '[]'::jsonb, '2023-02-15 00:00:00+00', '2024-01-30 00:00:00+00'),
('70000000-0000-0000-0000-000000000004', 'Decoupling for Your 2nd Property', 'LegalTax', 'Advanced', 40, 'decoupling-second-property', NULL, '2023-03-10 00:00:00+00', '["70000000-0000-0000-0000-000000000001"]'::jsonb, '2023-03-10 00:00:00+00', '2024-04-05 00:00:00+00'),
('70000000-0000-0000-0000-000000000005', 'Reading Your CPF OA Statement', 'Financing', 'Beginner', 12, 'reading-cpf-oa-statement', NULL, '2023-03-25 00:00:00+00', '[]'::jsonb, '2023-03-25 00:00:00+00', '2024-01-15 00:00:00+00'),
('70000000-0000-0000-0000-000000000006', 'Understanding TDSR and MSR Limits', 'Financing', 'Intermediate', 20, 'tdsr-msr-limits', NULL, '2023-04-05 00:00:00+00', '[]'::jsonb, '2023-04-05 00:00:00+00', '2024-02-10 00:00:00+00'),
('70000000-0000-0000-0000-000000000007', 'First-Timer Grant Guide (AHG, SHG, EHG)', 'Buying', 'Beginner', 18, 'first-timer-grant-guide', NULL, '2023-04-20 00:00:00+00', '[]'::jsonb, '2023-04-20 00:00:00+00', '2024-03-01 00:00:00+00'),
('70000000-0000-0000-0000-000000000008', 'Renting Out Your HDB Room Legally', 'Renting', 'Intermediate', 22, 'renting-out-hdb-room', NULL, '2023-05-10 00:00:00+00', '[]'::jsonb, '2023-05-10 00:00:00+00', '2024-04-20 00:00:00+00'),
('70000000-0000-0000-0000-000000000009', 'En Bloc - Opportunities and Risks', 'Insights', 'Advanced', 35, 'en-bloc-opportunities-risks', NULL, '2023-05-25 00:00:00+00', '["70000000-0000-0000-0000-000000000001","70000000-0000-0000-0000-000000000006"]'::jsonb, '2023-05-25 00:00:00+00', '2024-05-10 00:00:00+00'),
('70000000-0000-0000-0000-000000000010', 'Feng Shui Fundamentals for Your New Home', 'FengShui', 'Beginner', 20, 'feng-shui-fundamentals', NULL, '2023-06-10 00:00:00+00', '[]'::jsonb, '2023-06-10 00:00:00+00', '2024-02-28 00:00:00+00'),
('70000000-0000-0000-0000-000000000011', 'DIY Minor Repairs Every Homeowner Should Know', 'DIY', 'Beginner', 25, 'diy-minor-repairs', NULL, '2023-06-25 00:00:00+00', '[]'::jsonb, '2023-06-25 00:00:00+00', '2024-01-20 00:00:00+00'),
('70000000-0000-0000-0000-000000000012', 'Planning a Home Renovation in Singapore', 'HomeImprovements', 'Intermediate', 30, 'planning-home-renovation', NULL, '2023-07-10 00:00:00+00', '[]'::jsonb, '2023-07-10 00:00:00+00', '2024-03-15 00:00:00+00'),
('70000000-0000-0000-0000-000000000013', 'Your Property Ownership Journey - Timeline and Milestones', 'HomeJourney', 'Beginner', 15, 'property-ownership-journey', NULL, '2023-07-25 00:00:00+00', '[]'::jsonb, '2023-07-25 00:00:00+00', '2024-04-01 00:00:00+00'),
('70000000-0000-0000-0000-000000000014', 'How to Price and Sell Your Home Fast', 'Selling', 'Intermediate', 28, 'how-to-sell-home-fast', NULL, '2023-08-10 00:00:00+00', '[]'::jsonb, '2023-08-10 00:00:00+00', '2024-05-20 00:00:00+00'),
('70000000-0000-0000-0000-000000000015', 'Property Market Insights: Reading URA Data', 'Insights', 'Advanced', 45, 'reading-ura-data', NULL, '2023-09-01 00:00:00+00', '["70000000-0000-0000-0000-000000000009"]'::jsonb, '2023-09-01 00:00:00+00', '2024-06-15 00:00:00+00')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding property_transactions (60 total)
-- ============================================================
INSERT INTO property_transactions (id, property_id, buyer_id, seller_id, transaction_date, price, psf) VALUES
('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '2023-01-15 00:00:00+00', 668000, 667),
('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', '2023-03-22 00:00:00+00', 680000, 679),
('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000012', '2023-06-10 00:00:00+00', 695000, 694),
('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000009', '2023-09-05 00:00:00+00', 710000, 709),
('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000011', '2024-01-20 00:00:00+00', 728000, 727),
('80000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', '2023-02-08 00:00:00+00', 565000, 538),
('80000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000012', '2023-05-18 00:00:00+00', 580000, 552),
('80000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', '2023-08-25 00:00:00+00', 595000, 567),
('80000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', '2024-02-14 00:00:00+00', 610000, 581),
('80000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '2024-05-30 00:00:00+00', 618000, 589),
('80000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000009', '2023-01-28 00:00:00+00', 1420000, 2029),
('80000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000010', '2023-04-15 00:00:00+00', 1480000, 2114),
('80000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', '2023-07-22 00:00:00+00', 1520000, 2171),
('80000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000012', '2023-10-10 00:00:00+00', 1550000, 2214),
('80000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', '2024-01-08 00:00:00+00', 1575000, 2250),
('80000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010', '2024-03-19 00:00:00+00', 1590000, 2271),
('80000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', '2024-06-05 00:00:00+00', 1610000, 2300),
('80000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000009', '2023-02-20 00:00:00+00', 4520000, 3206),
('80000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000010', '2023-05-08 00:00:00+00', 4680000, 3319),
('80000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000011', '2023-09-14 00:00:00+00', 4800000, 3404),
('80000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000012', '2024-01-30 00:00:00+00', 5000000, 3546),
('80000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000009', '2024-04-22 00:00:00+00', 5180000, 3674),
('80000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000010', '2023-03-05 00:00:00+00', 5050000, 1578),
('80000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000011', '2023-06-20 00:00:00+00', 5200000, 1625),
('80000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000012', '2023-10-15 00:00:00+00', 3750000, 1500),
('80000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000009', '2024-02-28 00:00:00+00', 3800000, 1520),
('80000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000047', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000010', '2024-05-10 00:00:00+00', 2580000, 1613),
('80000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000011', '2023-07-28 00:00:00+00', 12200000, 1743),
('80000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000012', '2024-03-12 00:00:00+00', 27500000, 1833),
('80000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', '2023-01-10 00:00:00+00', 620000, 626),
('80000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', '2023-04-05 00:00:00+00', 680000, 648),
('80000000-0000-0000-0000-000000000032', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000011', '2023-07-15 00:00:00+00', 750000, 611),
('80000000-0000-0000-0000-000000000033', '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000012', '2023-08-20 00:00:00+00', 710000, 680),
('80000000-0000-0000-0000-000000000034', '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', '2023-11-01 00:00:00+00', 820000, 630),
('80000000-0000-0000-0000-000000000035', '10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', '2024-01-12 00:00:00+00', 480000, 502),
('80000000-0000-0000-0000-000000000036', '10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011', '2024-02-28 00:00:00+00', 850000, 693),
('80000000-0000-0000-0000-000000000037', '10000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', '2024-04-10 00:00:00+00', 650000, 633),
('80000000-0000-0000-0000-000000000038', '10000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', '2024-05-20 00:00:00+00', 920000, 581),
('80000000-0000-0000-0000-000000000039', '10000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', '2024-07-05 00:00:00+00', 720000, 699),
('80000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000011', '2023-02-14 00:00:00+00', 1280000, 1888),
('80000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000012', '2023-05-25 00:00:00+00', 1350000, 1901),
('80000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000009', '2023-08-08 00:00:00+00', 1180000, 2549),
('80000000-0000-0000-0000-000000000043', '10000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000010', '2023-10-22 00:00:00+00', 1820000, 1798),
('80000000-0000-0000-0000-000000000044', '10000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000011', '2024-01-18 00:00:00+00', 1290000, 1762),
('80000000-0000-0000-0000-000000000045', '10000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000012', '2024-03-05 00:00:00+00', 950000, 1520),
('80000000-0000-0000-0000-000000000046', '10000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000009', '2024-04-28 00:00:00+00', 1250000, 1786),
('80000000-0000-0000-0000-000000000047', '10000000-0000-0000-0000-000000000035', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '2024-06-15 00:00:00+00', 1620000, 1800),
('80000000-0000-0000-0000-000000000048', '10000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', '2023-03-18 00:00:00+00', 3800000, 3524),
('80000000-0000-0000-0000-000000000049', '10000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000012', '2023-06-30 00:00:00+00', 1180000, 1417),
('80000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000037', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', '2023-09-20 00:00:00+00', 1090000, 1454),
('80000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000038', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', '2024-02-10 00:00:00+00', 1480000, 1900),
('80000000-0000-0000-0000-000000000052', '10000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000011', '2024-04-18 00:00:00+00', 1380000, 1918),
('80000000-0000-0000-0000-000000000053', '10000000-0000-0000-0000-000000000048', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000012', '2023-04-25 00:00:00+00', 3100000, 2583),
('80000000-0000-0000-0000-000000000054', '10000000-0000-0000-0000-000000000048', '00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', '2023-08-12 00:00:00+00', 3200000, 2667),
('80000000-0000-0000-0000-000000000055', '10000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000010', '2024-01-05 00:00:00+00', 1750000, 2917),
('80000000-0000-0000-0000-000000000056', '10000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000011', '2024-03-28 00:00:00+00', 1800000, 3000),
('80000000-0000-0000-0000-000000000057', '10000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000012', '2023-01-25 00:00:00+00', 2850000, 1694),
('80000000-0000-0000-0000-000000000058', '10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000009', '2023-07-02 00:00:00+00', 350000, 485),
('80000000-0000-0000-0000-000000000059', '10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000010', '2024-05-08 00:00:00+00', 260000, 434),
('80000000-0000-0000-0000-000000000060', '10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', '2023-11-15 00:00:00+00', 540000, 440)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding price_history (60 total)
-- ============================================================
INSERT INTO price_history (id, property_id, price, recorded_at, source) VALUES
('90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000021', 1420000, '2023-01-28 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000021', 1480000, '2023-04-15 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000029', 1520000, '2023-07-22 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000021', 1550000, '2023-10-10 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000042', 1575000, '2024-01-08 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000029', 1590000, '2024-03-19 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000021', 1610000, '2024-06-05 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000023', 4520000, '2023-02-20 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000023', 4680000, '2023-05-08 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000023', 4800000, '2023-09-14 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000023', 5000000, '2024-01-30 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000023', 5180000, '2024-04-22 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000041', 5050000, '2023-03-05 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000041', 5200000, '2023-06-20 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000042', 3750000, '2023-10-15 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000042', 3800000, '2024-02-28 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000047', 2580000, '2024-05-10 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000043', 12200000, '2023-07-28 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000044', 27500000, '2024-03-12 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000022', 1280000, '2023-02-14 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000024', 1350000, '2023-05-25 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000026', 1180000, '2023-08-08 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000027', 1820000, '2023-10-22 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000028', 1290000, '2024-01-18 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000032', 950000, '2024-03-05 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000033', 1250000, '2024-04-28 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000027', '10000000-0000-0000-0000-000000000035', 1620000, '2024-06-15 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000028', '10000000-0000-0000-0000-000000000030', 3800000, '2023-03-18 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000029', '10000000-0000-0000-0000-000000000048', 3100000, '2023-04-25 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000030', '10000000-0000-0000-0000-000000000048', 3200000, '2023-08-12 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000031', '10000000-0000-0000-0000-000000000001', 668000, '2023-01-15 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000032', '10000000-0000-0000-0000-000000000001', 680000, '2023-03-22 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000033', '10000000-0000-0000-0000-000000000018', 695000, '2023-06-10 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000034', '10000000-0000-0000-0000-000000000018', 710000, '2023-09-05 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000035', '10000000-0000-0000-0000-000000000001', 728000, '2024-01-20 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000036', '10000000-0000-0000-0000-000000000008', 565000, '2023-02-08 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000037', '10000000-0000-0000-0000-000000000008', 580000, '2023-05-18 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000038', '10000000-0000-0000-0000-000000000019', 595000, '2023-08-25 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000039', '10000000-0000-0000-0000-000000000008', 610000, '2024-02-14 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000040', '10000000-0000-0000-0000-000000000019', 618000, '2024-05-30 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000041', '10000000-0000-0000-0000-000000000003', 620000, '2023-01-10 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000042', '10000000-0000-0000-0000-000000000010', 680000, '2023-04-05 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000043', '10000000-0000-0000-0000-000000000002', 750000, '2023-07-15 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000044', '10000000-0000-0000-0000-000000000006', 710000, '2023-08-20 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000045', '10000000-0000-0000-0000-000000000005', 820000, '2023-11-01 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000046', '10000000-0000-0000-0000-000000000014', 480000, '2024-01-12 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000047', '10000000-0000-0000-0000-000000000012', 850000, '2024-02-28 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000048', '10000000-0000-0000-0000-000000000016', 650000, '2024-04-10 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000049', '10000000-0000-0000-0000-000000000017', 920000, '2024-05-20 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000050', '10000000-0000-0000-0000-000000000020', 720000, '2024-07-05 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000051', '10000000-0000-0000-0000-000000000009', 350000, '2023-07-02 00:00:00+00', 'manual'),
('90000000-0000-0000-0000-000000000052', '10000000-0000-0000-0000-000000000011', 260000, '2024-05-08 00:00:00+00', 'manual'),
('90000000-0000-0000-0000-000000000053', '10000000-0000-0000-0000-000000000015', 540000, '2023-11-15 00:00:00+00', 'HDB'),
('90000000-0000-0000-0000-000000000054', '10000000-0000-0000-0000-000000000045', 2850000, '2023-01-25 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000055', '10000000-0000-0000-0000-000000000031', 1180000, '2023-06-30 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000056', '10000000-0000-0000-0000-000000000037', 1090000, '2023-09-20 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000057', '10000000-0000-0000-0000-000000000038', 1480000, '2024-02-10 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000058', '10000000-0000-0000-0000-000000000040', 1380000, '2024-04-18 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000059', '10000000-0000-0000-0000-000000000050', 1750000, '2024-01-05 00:00:00+00', 'URA'),
('90000000-0000-0000-0000-000000000060', '10000000-0000-0000-0000-000000000050', 1800000, '2024-03-28 00:00:00+00', 'URA')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seeding regulatory_config (14 sections)
-- ============================================================
INSERT INTO regulatory_config (section_key, config_data, updated_at) VALUES

('metadata', '{"version": "2024.1", "effectiveDate": "2024-01-01", "lastUpdated": "2024-02-15"}'::jsonb, '2024-02-15 00:00:00+00'),

('stampDuty.bsd', '{
  "tiers": [
    {"minValue": 0,       "maxValue": 180000,  "rate": 0.01, "label": "First $180,000"},
    {"minValue": 180000,  "maxValue": 360000,  "rate": 0.02, "label": "$180,000 to $360,000"},
    {"minValue": 360000,  "maxValue": 1000000, "rate": 0.03, "label": "$360,000 to $1,000,000"},
    {"minValue": 1000000, "maxValue": 1500000, "rate": 0.04, "label": "$1,000,000 to $1,500,000"},
    {"minValue": 1500000, "maxValue": 3000000, "rate": 0.05, "label": "$1,500,000 to $3,000,000"},
    {"minValue": 3000000, "maxValue": null,    "rate": 0.06, "label": "Above $3,000,000"}
  ],
  "description": "Buyer''s Stamp Duty (BSD) applies to all property purchases in Singapore. Progressive tier structure based on purchase price."
}'::jsonb, '2024-02-15 00:00:00+00'),

('stampDuty.absd', '{
  "rates": [
    {"residencyStatus": "singapore_citizen",  "propertyType": "hdb",    "existingProperties": 0, "rate": 0,    "rationale": "First HDB flat for Singaporean Citizens"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "condo",  "existingProperties": 0, "rate": 0,    "rationale": "First residential property for Singaporean Citizens"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "ec",     "existingProperties": 0, "rate": 0,    "rationale": "First EC for Singaporean Citizens"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "landed", "existingProperties": 0, "rate": 0,    "rationale": "First landed property for Singaporean Citizens"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "condo",  "existingProperties": 1, "rate": 0.20, "rationale": "Second residential property for Singaporean Citizens (20% ABSD)"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "landed", "existingProperties": 1, "rate": 0.20, "rationale": "Second residential property for Singaporean Citizens (20% ABSD)"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "ec",     "existingProperties": 1, "rate": 0.20, "rationale": "Second residential property for Singaporean Citizens (20% ABSD)"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "condo",  "existingProperties": 2, "rate": 0.30, "rationale": "Third and subsequent properties for Singaporean Citizens (30% ABSD)"},
    {"residencyStatus": "singapore_citizen",  "propertyType": "landed", "existingProperties": 2, "rate": 0.30, "rationale": "Third and subsequent properties for Singaporean Citizens (30% ABSD)"},
    {"residencyStatus": "permanent_resident", "propertyType": "hdb",    "existingProperties": 0, "rate": 0.05, "rationale": "First HDB flat for PRs (5% ABSD)"},
    {"residencyStatus": "permanent_resident", "propertyType": "condo",  "existingProperties": 0, "rate": 0.05, "rationale": "First residential property for PRs (5% ABSD)"},
    {"residencyStatus": "permanent_resident", "propertyType": "ec",     "existingProperties": 0, "rate": 0.05, "rationale": "First EC for PRs (5% ABSD)"},
    {"residencyStatus": "permanent_resident", "propertyType": "landed", "existingProperties": 0, "rate": 0.05, "rationale": "First residential property for PRs (5% ABSD)"},
    {"residencyStatus": "permanent_resident", "propertyType": "condo",  "existingProperties": 1, "rate": 0.30, "rationale": "Second and subsequent properties for PRs (30% ABSD)"},
    {"residencyStatus": "permanent_resident", "propertyType": "landed", "existingProperties": 1, "rate": 0.30, "rationale": "Second and subsequent properties for PRs (30% ABSD)"},
    {"residencyStatus": "foreigner",          "propertyType": "condo",  "existingProperties": 0, "rate": 0.60, "rationale": "Any residential property purchase by Foreigners (60% ABSD)"},
    {"residencyStatus": "foreigner",          "propertyType": "landed", "existingProperties": 0, "rate": 0.60, "rationale": "Any residential property purchase by Foreigners (60% ABSD)"},
    {"residencyStatus": "foreigner",          "propertyType": "ec",     "existingProperties": 0, "rate": 0.60, "rationale": "Any residential property purchase by Foreigners (60% ABSD)"}
  ],
  "description": "Additional Buyer''s Stamp Duty (ABSD) rates by residency status and property count. Entity purchases face 65% ABSD (handled separately in calculation logic)."
}'::jsonb, '2024-02-15 00:00:00+00'),

('stampDuty.ssd', '{
  "tiers": [
    {"minMonths": 0,  "maxMonths": 12, "rate": 0.12, "label": "Sold within 1 year"},
    {"minMonths": 12, "maxMonths": 24, "rate": 0.08, "label": "Sold within 1 to 2 years"},
    {"minMonths": 24, "maxMonths": 36, "rate": 0.04, "label": "Sold within 2 to 3 years"}
  ],
  "exemptionThresholdMonths": 36,
  "description": "Seller''s Stamp Duty (SSD) applies when selling residential property within 3 years of purchase. No SSD if held for 3+ years."
}'::jsonb, '2024-02-15 00:00:00+00'),

('borrowing.tdsr', '{
  "limit": 0.55,
  "variableIncomeHaircutPct": 30,
  "description": "Total Debt Servicing Ratio (TDSR) cap set by MAS at 55% of gross monthly income. Variable income (bonuses, commissions) is subject to a 30% haircut."
}'::jsonb, '2024-02-15 00:00:00+00'),

('borrowing.msr', '{
  "limit": 0.30,
  "applicablePropertyTypes": ["hdb", "ec"],
  "description": "Mortgage Servicing Ratio (MSR) cap at 30% applies only to HDB loans and Executive Condominiums (EC)."
}'::jsonb, '2024-02-15 00:00:00+00'),

('borrowing.ltv', '{
  "rules": [
    {"loanType": "HDB",  "propertyType": "hdb",    "loanTenureYears": 25, "existingLoans": 0, "maxLTVPct": 85, "minCashDownPaymentPct": 5},
    {"loanType": "HDB",  "propertyType": "hdb",    "loanTenureYears": 30, "existingLoans": 0, "maxLTVPct": 80, "minCashDownPaymentPct": 5},
    {"loanType": "HDB",  "propertyType": "hdb",    "loanTenureYears": 25, "existingLoans": 1, "maxLTVPct": 45, "minCashDownPaymentPct": 25},
    {"loanType": "bank", "propertyType": "condo",  "loanTenureYears": 30, "existingLoans": 0, "maxLTVPct": 75, "minCashDownPaymentPct": 5},
    {"loanType": "bank", "propertyType": "landed", "loanTenureYears": 30, "existingLoans": 0, "maxLTVPct": 75, "minCashDownPaymentPct": 5},
    {"loanType": "bank", "propertyType": "condo",  "loanTenureYears": 35, "existingLoans": 0, "maxLTVPct": 55, "minCashDownPaymentPct": 10},
    {"loanType": "bank", "propertyType": "landed", "loanTenureYears": 35, "existingLoans": 0, "maxLTVPct": 55, "minCashDownPaymentPct": 10},
    {"loanType": "bank", "propertyType": "ec",     "loanTenureYears": 30, "existingLoans": 0, "maxLTVPct": 75, "minCashDownPaymentPct": 5},
    {"loanType": "bank", "propertyType": "condo",  "loanTenureYears": 30, "existingLoans": 1, "maxLTVPct": 45, "minCashDownPaymentPct": 25},
    {"loanType": "bank", "propertyType": "landed", "loanTenureYears": 30, "existingLoans": 1, "maxLTVPct": 45, "minCashDownPaymentPct": 25},
    {"loanType": "bank", "propertyType": "condo",  "loanTenureYears": 30, "existingLoans": 2, "maxLTVPct": 35, "minCashDownPaymentPct": 25},
    {"loanType": "bank", "propertyType": "landed", "loanTenureYears": 30, "existingLoans": 2, "maxLTVPct": 35, "minCashDownPaymentPct": 25}
  ],
  "description": "Loan-to-Value (LTV) ratio limits by loan type, property type, tenure, and number of existing outstanding loans."
}'::jsonb, '2024-02-15 00:00:00+00'),

('mortgage.hdbLoan', '{
  "baseInterestRatePct": 2.6,
  "description": "HDB concessionary loan base interest rate (reviewed quarterly by HDB). Rate as of Jan 2024."
}'::jsonb, '2024-02-15 00:00:00+00'),

('mortgage.bankLoan', '{
  "typicalInterestRangePct": {"min": 3.5, "max": 5.0},
  "description": "Typical bank loan interest rate range for residential property mortgages. Actual rates vary by bank, loan quantum, and borrower profile."
}'::jsonb, '2024-02-15 00:00:00+00'),

('cpf', '{
  "ordinaryAccount": {
    "annualInterestRatePct": 2.5,
    "usageCap": {
      "propertyPurchase": "Valuation Limit (VL) or purchase price, whichever is lower",
      "monthlyInstallment": "Subject to MSR/TDSR limits and available CPF OA balance"
    },
    "accrualInterestRatePct": 2.5
  },
  "specialAccount": {
    "annualInterestRatePct": 4.0
  }
}'::jsonb, '2024-02-15 00:00:00+00'),

('propertyTax', '{
  "ownerOccupied": [
    {"annualValueMin": 0,      "annualValueMax": 8000,   "ownerOccupiedRate": 0,    "nonOwnerOccupiedRate": 0.10, "label": "First $8,000"},
    {"annualValueMin": 8000,   "annualValueMax": 30000,  "ownerOccupiedRate": 0.04, "nonOwnerOccupiedRate": 0.10, "label": "$8,000 to $30,000"},
    {"annualValueMin": 30000,  "annualValueMax": 40000,  "ownerOccupiedRate": 0.05, "nonOwnerOccupiedRate": 0.10, "label": "$30,000 to $40,000"},
    {"annualValueMin": 40000,  "annualValueMax": 55000,  "ownerOccupiedRate": 0.07, "nonOwnerOccupiedRate": 0.10, "label": "$40,000 to $55,000"},
    {"annualValueMin": 55000,  "annualValueMax": 70000,  "ownerOccupiedRate": 0.10, "nonOwnerOccupiedRate": 0.14, "label": "$55,000 to $70,000"},
    {"annualValueMin": 70000,  "annualValueMax": 85000,  "ownerOccupiedRate": 0.14, "nonOwnerOccupiedRate": 0.18, "label": "$70,000 to $85,000"},
    {"annualValueMin": 85000,  "annualValueMax": 100000, "ownerOccupiedRate": 0.18, "nonOwnerOccupiedRate": 0.22, "label": "$85,000 to $100,000"},
    {"annualValueMin": 100000, "annualValueMax": null,   "ownerOccupiedRate": 0.23, "nonOwnerOccupiedRate": 0.27, "label": "Above $100,000"}
  ],
  "nonOwnerOccupied": [
    {"annualValueMin": 0,     "annualValueMax": 30000, "ownerOccupiedRate": 0, "nonOwnerOccupiedRate": 0.10, "label": "First $30,000"},
    {"annualValueMin": 30000, "annualValueMax": 40000, "ownerOccupiedRate": 0, "nonOwnerOccupiedRate": 0.12, "label": "$30,000 to $40,000"},
    {"annualValueMin": 40000, "annualValueMax": 55000, "ownerOccupiedRate": 0, "nonOwnerOccupiedRate": 0.14, "label": "$40,000 to $55,000"},
    {"annualValueMin": 55000, "annualValueMax": 70000, "ownerOccupiedRate": 0, "nonOwnerOccupiedRate": 0.16, "label": "$55,000 to $70,000"},
    {"annualValueMin": 70000, "annualValueMax": 90000, "ownerOccupiedRate": 0, "nonOwnerOccupiedRate": 0.18, "label": "$70,000 to $90,000"},
    {"annualValueMin": 90000, "annualValueMax": null,  "ownerOccupiedRate": 0, "nonOwnerOccupiedRate": 0.20, "label": "Above $90,000"}
  ],
  "annualValueProxyPct": 0.035,
  "effectiveDateOverride": "2024-01-01",
  "sourceUrl": "https://www.iras.gov.sg/taxes/property-tax/property-owners/property-tax-rates",
  "description": "Progressive property tax rates for owner-occupied and non-owner-occupied residential properties in Singapore (IRAS 2024). Annual Value (AV) is IRAS-assessed; 3.5% of property value is used here as a proxy for estimation only."
}'::jsonb, '2024-02-15 00:00:00+00'),

('maintenanceFees', '{
  "hdbMonthlyRange": {"min": 20, "max": 90},
  "condoMonthlyPerSqft": {"min": 0.30, "max": 0.60},
  "landedMonthlyEstimate": 200,
  "note": "Estimated market ranges only — not regulatory figures. Actual fees vary by development, size, and facility tier."
}'::jsonb, '2024-02-15 00:00:00+00'),

('misc', '{
  "legalConveyancingFeesPct": 0.004,
  "legalFeesEstimateRange": {"min": 2500, "max": 4000},
  "valuationFeeSGD": 500,
  "insuranceAnnualRange": {"min": 500, "max": 1000}
}'::jsonb, '2024-02-15 00:00:00+00'),

('cpfRates', '{
  "oaInterestRate": 0.025,
  "saInterestRate": 0.04,
  "effectiveDate": "2024-01-01",
  "sourceUrl": "https://www.cpf.gov.sg"
}'::jsonb, '2024-02-15 00:00:00+00')

ON CONFLICT DO NOTHING;

-- ============================================================
-- Reset session replication role
-- ============================================================
SET session_replication_role = DEFAULT;
