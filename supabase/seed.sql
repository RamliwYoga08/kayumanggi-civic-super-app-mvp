-- Optional public demo content derived from the original HTML prototype.
-- Safe to run after migrations. It does not create auth users or private user data.

insert into public.posts (id, author_id, body, kind, visibility, created_at) values
('10000000-0000-0000-0000-000000000001', null, 'Quezon City opens a new public consultation window for community solar and renewable energy grants. Residents can review the project scope and file questions through the Governance module.', 'government', 'public', now() - interval '2 hours'),
('10000000-0000-0000-0000-000000000002', null, 'Barangay assembly reminder: bring your questions on waste management, local road repairs, and the Q3 community budget. Civic participation works best when evidence and proposals are specific.', 'civic', 'public', now() - interval '5 hours'),
('10000000-0000-0000-0000-000000000003', null, 'Volunteer call: weekend cleanup and watershed monitoring teams are accepting new participants. Check the Volunteers and Environment modules for details.', 'community', 'public', now() - interval '1 day')
on conflict do nothing;

insert into public.groups (id, owner_id, name, description, visibility, cover_url) values
('20000000-0000-0000-0000-000000000001', null, 'Barangay Holy Spirit Community', 'Public neighborhood group for assemblies, announcements, local projects, and citizen concerns.', 'public', null),
('20000000-0000-0000-0000-000000000002', null, 'IT Philippines', 'Filipino technology professionals discussing jobs, civic tech, networking, and digital skills.', 'public', null),
('20000000-0000-0000-0000-000000000003', null, 'Programming Philippines', 'Community discussion for Filipino developers, students, and technology workers.', 'public', null)
on conflict do nothing;

insert into public.marketplace_listings (id, seller_id, title, description, price, category, location, status) values
('30000000-0000-0000-0000-000000000001', null, 'Wireless Noise Cancelling Headphones', 'Community marketplace demo listing. Inspect condition and seller details before transacting.', 1899, 'Electronics', 'Quezon City', 'active'),
('30000000-0000-0000-0000-000000000002', null, 'Men''s Running Shoes', 'Breathable mesh running shoes from a local merchant demo profile.', 1299, 'Fashion', 'Manila', 'active'),
('30000000-0000-0000-0000-000000000003', null, 'Farm Fresh Strawberry Batch', 'Direct produce batch inspired by the Agri-Civic marketplace concept.', 180, 'Agriculture', 'La Trinidad, Benguet', 'active')
on conflict do nothing;

insert into public.civic_projects (id, title, description, sector, status, progress, budget, spent, location, audited, started_at, target_end_at) values
('40000000-0000-0000-0000-000000000001', 'QC Community Hospital Expansion', 'Expansion of community hospital capacity, diagnostics, and public-service access.', 'Healthcare', 'active', 68, 850000000, 557000000, 'Quezon City', true, current_date - 240, current_date + 120),
('40000000-0000-0000-0000-000000000002', 'Community Solar & Renewable Energy Grants', 'Local solar street-grid and renewable-energy support program with public progress tracking.', 'Environment', 'active', 42, 120000000, 44000000, 'Quezon City', true, current_date - 100, current_date + 180),
('40000000-0000-0000-0000-000000000003', 'Tomas Morato Smart Mobility Loop', 'Pilot smart mobility, pedestrian, and local transit improvements.', 'Transport', 'planned', 18, 210000000, 18000000, 'Tomas Morato, Quezon City', false, current_date - 30, current_date + 300)
on conflict do nothing;

insert into public.elections (id, name, election_date, scope, status) values
('50000000-0000-0000-0000-000000000001', 'Kayumanggi Community Mock Election 2027', current_date + 328, 'local', 'mock')
on conflict do nothing;

insert into public.candidates (id, election_id, full_name, position, party, bio, civic_score, verified, platform) values
('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Sarah Jenkins', 'City Councilor', 'Independent Civic Alliance', 'Community organizer focused on participatory budgeting, local environmental health, and transparent project monitoring.', 88, true, '["Participatory budgeting","Solar street grids","Barangay health access"]'::jsonb),
('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Atty. Ramon Valenzuela', 'Representative', 'Reform Movement', 'Legal-aid advocate focused on anti-red tape systems, public procurement integrity, and SME support.', 91, true, '["Barangay legal assistance","Anti-red tape integration","SME microfinance"]'::jsonb),
('51000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Dr. Jaime Espina', 'City Councilor', 'Green Coalition', 'Public-health consultant and urban greening advocate focused on diagnostics, watershed protection, and drainage audits.', 85, true, '["Diagnostic center expansion","Watershed conservation","Anti-dengue drainage audits"]'::jsonb)
on conflict do nothing;

insert into public.polls (id, question, description, status, closes_at) values
('60000000-0000-0000-0000-000000000001', 'Should the city allocate 10% of the annual budget to new green spaces and parks?', 'Community sentiment poll. Results are advisory and not a legally binding government vote.', 'active', now() + interval '30 days'),
('60000000-0000-0000-0000-000000000002', 'How satisfied are you with local road maintenance this quarter?', 'A simple community service-quality survey.', 'active', now() + interval '14 days')
on conflict do nothing;

insert into public.poll_options (id,poll_id,label,sort_order) values
('61000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Yes',1),
('61000000-0000-0000-0000-000000000002','60000000-0000-0000-0000-000000000001','No',2),
('61000000-0000-0000-0000-000000000003','60000000-0000-0000-0000-000000000001','Need more budget details',3),
('61000000-0000-0000-0000-000000000004','60000000-0000-0000-0000-000000000002','Satisfied',1),
('61000000-0000-0000-0000-000000000005','60000000-0000-0000-0000-000000000002','Neutral',2),
('61000000-0000-0000-0000-000000000006','60000000-0000-0000-0000-000000000002','Dissatisfied',3)
on conflict do nothing;

insert into public.events (id,title,description,starts_at,ends_at,location,category,visibility) values
('70000000-0000-0000-0000-000000000001','Barangay Assembly: Q3 Budget Review','Public assembly covering infrastructure, community hospital expansion, waste management, and resident questions.',now()+interval '5 days',now()+interval '5 days 2 hours','Brgy. Holy Spirit Hall, Quezon City','government','public'),
('70000000-0000-0000-0000-000000000002','QC Jobs Fair','Local employment event with government and private-sector opportunities.',now()+interval '10 days',now()+interval '10 days 4 hours','Araneta Center, Cubao','community','public'),
('70000000-0000-0000-0000-000000000003','Quezon Circle Clean Up','Volunteer cleanup and environmental monitoring activity.',now()+interval '14 days',now()+interval '14 days 3 hours','Quezon Memorial Circle','volunteer','public')
on conflict do nothing;

insert into public.news_articles (id,title,excerpt,body,category,source_name,official,published_at) values
('80000000-0000-0000-0000-000000000001','Metro Subway segment reaches new construction milestone','Government infrastructure teams reported another milestone in the Metro Manila Subway program, with updated public advisories for affected communities.','This demo article mirrors the original prototype''s government-publication experience. Replace with verified official sources in production.','Infrastructure','Government Release',true,now()-interval '8 hours'),
('80000000-0000-0000-0000-000000000002','Inflation update and local market monitoring','A civic explainer summarizes current price-monitoring tools and why local market data matters to households and MSMEs.','Community publication demo content.','Economy','Kayumanggi Civic Desk',false,now()-interval '1 day')
on conflict do nothing;

insert into public.jobs (id,title,company,location,employment_type,description,status,posted_at) values
('90000000-0000-0000-0000-000000000001','Senior Web Developer','TechCorp PH','Quezon City','Full-time','Build accessible web applications and civic technology integrations using modern JavaScript tooling.','open',now()-interval '1 day'),
('90000000-0000-0000-0000-000000000002','UX/UI Designer','Civic Design Lab','Hybrid - Metro Manila','Full-time','Design responsive civic service journeys across mobile and web.','open',now()-interval '2 days'),
('90000000-0000-0000-0000-000000000003','Community Operations Coordinator','Local Development Office','Quezon City','Contract','Coordinate citizen consultations, events, volunteer programs, and public information workflows.','open',now()-interval '3 days')
on conflict do nothing;

insert into public.officials (id,full_name,position,branch,jurisdiction,party,bio,civic_score,is_current,verified,metadata) values
('a0000000-0000-0000-0000-000000000001','Juan Dela Cruz','Mayor','Executive','Quezon City','Local Reform Coalition','Demo public-official profile for the civic directory. Production records must be sourced and verified.',84,true,true,'{"trust_label":"Community demo"}'::jsonb),
('a0000000-0000-0000-0000-000000000002','Leonor Domagoso','Former Mayor','Executive','Manila','Aksyon Demokratiko','Historical demo profile illustrating the past-officials archive.',78,false,true,'{"archive":true}'::jsonb)
on conflict do nothing;

insert into public.partylists (id,name,description,platform,verified) values
('a1000000-0000-0000-0000-000000000001','Bayan Muna','Demo party-list directory record from the prototype.','["Public accountability","Social services"]'::jsonb,true),
('a1000000-0000-0000-0000-000000000002','AGHAM','Demo directory record.','["Science and technology","Research support"]'::jsonb,true)
on conflict do nothing;

insert into public.departments (id,name,acronym,description,verified) values
('a2000000-0000-0000-0000-000000000001','Department of Health','DOH','National health department directory entry.',true),
('a2000000-0000-0000-0000-000000000002','Department of Education','DepEd','National education department directory entry.',true),
('a2000000-0000-0000-0000-000000000003','Department of Environment and Natural Resources','DENR','National environment department directory entry.',true)
on conflict do nothing;

insert into public.civic_resources (id,module,title,subtitle,description,status,sort_order,metadata) values
('b0000000-0000-0000-0000-000000000001','environment','Pasig River Rehabilitation','City ecological project','Track rehabilitation milestones, cleanup activities, and public environmental indicators.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000002','environment','Ecological & Air Map','Environmental monitoring','Future map layer for air quality, waterways, heat, and community reports.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000003','education','Civic Development 101','Civic Academy','Foundational course on local governance, citizen participation, and responsible public reporting.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000004','education','Digital Literacy for Citizens','Study guide','Practical digital safety, information verification, privacy, and online public-service access.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000005','education','Quezon City Merit Scholarship','Grant & aid','Scholarship directory card. Verify current requirements with the official institution before applying.','active',3,'{}'),
('b0000000-0000-0000-0000-000000000006','healthcare','Barangay Health Dashboard','Health access','Public capacity and service availability indicators without exposing private medical records.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000007','healthcare','Teleconsultation Request','Appointment access','Request or track a teleconsult slot. The MVP intentionally excludes sensitive EHR storage.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000008','tourism','QC Memorial Circle Heritage Walk','Local itinerary','Community tourism and heritage itinerary card.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000009','tourism','La Mesa Eco Park Reserve','Eco destination','Local eco-tourism destination and visitor information.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000010','agriculture','Farm-To-Table Marketplace','Agri-Civic','Direct produce and cooperative discovery.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000011','agriculture','Live Crop Price Index','Market analytics','Reference prices and agricultural market monitoring for future data integrations.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000012','agriculture','Agri-Civic Expert Forum','Expert forum','Discuss crop rotation, soil optimization, weather challenges, and local farming methods.','active',3,'{}'),
('b0000000-0000-0000-0000-000000000013','disaster','Live Operations Dashboard','Disaster Command','Official bulletins, evacuation capacity, dispatch status, and emergency resources.','urgent',1,'{}'),
('b0000000-0000-0000-0000-000000000014','disaster','Emergency Resource Request','Response request','Authenticated citizens can submit structured requests for review and dispatch.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000015','volunteer','Quezon Circle Clean Up','Open campaign','Join a scheduled community cleanup and environmental monitoring activity.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000016','volunteer','Community Kitchen Server','Open campaign','Volunteer shift registration for local food support programs.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000017','public-services','Waste Management Schedule','Utility Hub','Pickup schedules and service advisories by locality.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000018','public-services','Transit & Transport Networks','Utility Hub','Local route information, future live bus feeds, and service reporting.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000019','community-development','Solar Streetlights Installation','Citizen proposal','Community development proposal with participatory discussion and progress tracking.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000020','community-development','Children''s Library & Study Centre','Citizen proposal','Community space proposal for learning, study, and youth programs.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000021','economic-development','Digital Modernization Grant','MSME support','Program card for eligible micro and small businesses.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000022','economic-development','Women Entrepreneurs Fund','MSME support','Program directory card; production eligibility must come from the administering agency.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000023','profiling','Active Officials Directory','Civic Integrity & Scoreboard','Search verified public profiles, track roles, deeds, evidence, and community sentiment.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000024','profiling','Past Officials & Alumni','Historical archive','Browse historical public-service profiles and milestone records.','active',2,'{}'),
('b0000000-0000-0000-0000-000000000025','debates','Arguments & Discussions','Live discussion','Structured civic argument threads with up/down community feedback.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000026','charity','Typhoon Recovery Fund','Verified campaign demo','Donation pledge workflow. Real payments require a licensed payment provider and separate compliance review.','verified',1,'{}'),
('b0000000-0000-0000-0000-000000000027','mail','Official Inbox','Mailbox','Private notices, application updates, and civic service correspondence.','active',1,'{}'),
('b0000000-0000-0000-0000-000000000028','reels','Civic Reels Library','Short civic media','Short-form public-interest media. Production video upload/transcoding is a later enhancement.','active',1,'{}')
on conflict do nothing;
