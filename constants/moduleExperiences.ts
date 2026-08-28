export type ModuleExperience = {
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  actionLabel: string;
  requestType: string;
  requestPlaceholder: string;
  tabs: string[];
  metrics: { label: string; value: string; tone?: 'info' | 'success' | 'warning' | 'danger' }[];
  notices?: string[];
};

const shared = {
  tabs: ['Overview', 'Programs', 'My requests'],
  metrics: [
    { label: 'Access', value: '24/7', tone: 'success' as const },
    { label: 'Request tracking', value: 'Private', tone: 'info' as const },
    { label: 'Records', value: 'Verified', tone: 'success' as const },
  ],
};

export const moduleExperiences: Record<string, ModuleExperience> = {
  profiling: {
    ...shared, eyebrow: 'PUBLIC ACCOUNTABILITY', heroTitle: 'Know your public servants',
    heroBody: 'Explore verified offices, public records, civic performance, and accountability information.',
    actionLabel: 'Request a public record', requestType: 'public_record', requestPlaceholder: 'Office, official, or record you need…', tabs: ['Directory', 'Offices', 'My requests'],
    metrics: [{ label: 'Source policy', value: 'Evidence-led', tone: 'success' }, { label: 'Public records', value: 'Open', tone: 'info' }, { label: 'Corrections', value: 'Tracked', tone: 'warning' }],
  },
  debates: {
    ...shared, eyebrow: 'CIVIC FORUM', heroTitle: 'Debate policy, not people',
    heroBody: 'Structured community discussions with evidence prompts and clear participation standards.',
    actionLabel: 'Propose a debate', requestType: 'debate_topic', requestPlaceholder: 'What public question should the community discuss?', tabs: ['Trending', 'Local issues', 'My requests'],
    notices: ['Challenge ideas respectfully.', 'Add primary sources when making factual claims.'],
  },
  charity: {
    ...shared, eyebrow: 'VERIFIED GIVING', heroTitle: 'Community help with accountability',
    heroBody: 'Discover reviewed civic campaigns and submit assistance or verification requests. Payments are not collected in this MVP.',
    actionLabel: 'Request assistance', requestType: 'assistance', requestPlaceholder: 'Describe the assistance needed and the responsible organization…', tabs: ['Campaigns', 'Verified groups', 'My requests'],
    metrics: [{ label: 'Payments', value: 'Not collected', tone: 'warning' }, { label: 'Campaigns', value: 'Reviewed', tone: 'success' }, { label: 'Updates', value: 'Tracked', tone: 'info' }],
  },
  education: {
    ...shared, eyebrow: 'CIVIC ACADEMY', heroTitle: 'Learn, qualify, and participate',
    heroBody: 'Courses, study guides, scholarships, and civic credentials in one resident-friendly workspace.',
    actionLabel: 'Ask the academy', requestType: 'education_support', requestPlaceholder: 'Course, scholarship, credential, or learning support…', tabs: ['Dashboard', 'Courses', 'My requests'],
  },
  healthcare: {
    ...shared, eyebrow: 'HEALTH ACCESS', heroTitle: 'Local care without exposing private records',
    heroBody: 'Find public health services, request non-emergency support, and keep requests visible only to you and authorized staff.',
    actionLabel: 'Request health access', requestType: 'health_access', requestPlaceholder: 'Service or appointment support needed (do not include diagnoses or sensitive records)…', tabs: ['Services', 'Telehealth', 'My requests'],
    metrics: [{ label: 'Emergency', value: 'Call 911', tone: 'danger' }, { label: 'Privacy', value: 'Protected', tone: 'success' }, { label: 'Records', value: 'Not stored', tone: 'info' }],
    notices: ['For emergencies, contact 911 or your local emergency service.', 'Do not submit diagnoses, government IDs, or medical files here.'],
  },
  tourism: {
    ...shared, eyebrow: 'EXPLORE LOCAL', heroTitle: 'Culture, places, and community routes',
    heroBody: 'Discover local destinations, heritage experiences, visitor guidance, and responsible tourism programs.',
    actionLabel: 'Ask tourism support', requestType: 'visitor_support', requestPlaceholder: 'Destination, accessibility, permit, or visitor question…', tabs: ['Discover', 'Itineraries', 'My requests'],
  },
  agriculture: {
    ...shared, eyebrow: 'AGRI-CIVIC HUB', heroTitle: 'From growers to communities',
    heroBody: 'Cooperative programs, local produce, market information, and practical agricultural support.',
    actionLabel: 'Request agri support', requestType: 'agri_support', requestPlaceholder: 'Crop, cooperative, market, equipment, or training need…', tabs: ['Marketplace', 'Price watch', 'My requests'],
  },
  disaster: {
    ...shared, eyebrow: 'DISASTER COMMAND', heroTitle: 'Preparedness and verified response',
    heroBody: 'Official bulletins, evacuation information, emergency contacts, and accountable resource requests.',
    actionLabel: 'Request emergency resources', requestType: 'emergency_resource', requestPlaceholder: 'People affected, exact area, resource needed, and urgency…', tabs: ['Live operations', 'Evacuation', 'My requests'],
    metrics: [{ label: 'Life-threatening', value: 'Call 911', tone: 'danger' }, { label: 'Bulletins', value: 'Official', tone: 'success' }, { label: 'Requests', value: 'Tracked', tone: 'info' }],
    notices: ['This form does not replace emergency hotlines. Call 911 for immediate danger.'],
  },
  volunteer: {
    ...shared, eyebrow: 'VOLUNTEER NETWORK', heroTitle: 'Turn civic energy into action',
    heroBody: 'Find community campaigns, request placement, and keep a reliable record of participation.',
    actionLabel: 'Join a campaign', requestType: 'volunteer_signup', requestPlaceholder: 'Campaign, schedule, skills, and accessibility needs…', tabs: ['Campaigns', 'Opportunities', 'My requests'],
  },
  'public-services': {
    ...shared, eyebrow: 'UTILITY HUB', heroTitle: 'Everyday services, one clear path',
    heroBody: 'Waste, water, transport, permits, outages, and other resident services with trackable requests.',
    actionLabel: 'Open a service request', requestType: 'utility_request', requestPlaceholder: 'Service, account area (not account number), location, and concern…', tabs: ['Services', 'Advisories', 'My requests'],
  },
  'community-development': {
    ...shared, eyebrow: 'PARTICIPATORY PLANNING', heroTitle: 'Shape projects in your community',
    heroBody: 'Browse proposals, follow local budgets, and submit community development suggestions.',
    actionLabel: 'Submit a proposal', requestType: 'community_proposal', requestPlaceholder: 'Proposal title, location, beneficiaries, and expected public value…', tabs: ['Proposals', 'Budgets', 'My requests'],
  },
  'economic-development': {
    ...shared, eyebrow: 'LOCAL ECONOMY', heroTitle: 'Support for enterprises and livelihoods',
    heroBody: 'MSME programs, grants, permits, procurement opportunities, and local economic indicators.',
    actionLabel: 'Request business support', requestType: 'business_support', requestPlaceholder: 'Business stage, program, permit, grant, or procurement question…', tabs: ['Programs', 'Opportunities', 'My requests'],
  },
  mail: {
    ...shared, eyebrow: 'OFFICIAL MAILBOX', heroTitle: 'Notices and correspondence',
    heroBody: 'A private hub for official notices and resident correspondence. Requests remain protected by account-level access rules.',
    actionLabel: 'Compose a request', requestType: 'official_correspondence', requestPlaceholder: 'Agency, subject, and message…', tabs: ['Inbox', 'Notices', 'My requests'],
  },
  reels: {
    ...shared, eyebrow: 'CIVIC REELS', heroTitle: 'Short stories with public value',
    heroBody: 'Discover brief civic media and suggest verified community stories. Video upload and transcoding are intentionally deferred.',
    actionLabel: 'Suggest a civic story', requestType: 'reel_submission', requestPlaceholder: 'Story, public value, source, and media availability…', tabs: ['Discover', 'Following', 'My requests'],
  },
};

export function experienceFor(slug: string, title: string, subtitle: string): ModuleExperience {
  return moduleExperiences[slug] || {
    ...shared, eyebrow: 'KAYUMANGGI SERVICE', heroTitle: title, heroBody: subtitle,
    actionLabel: 'Submit a request', requestType: 'general', requestPlaceholder: 'Describe what you need…',
  };
}
