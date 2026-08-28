export type CivicModule = {
  slug: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  route?: string;
  category: 'Social' | 'Civic' | 'Services' | 'Personal';
};

export const civicModules: CivicModule[] = [
  { slug: 'home', title: 'News Feed', subtitle: 'Civic and community updates', emoji: '⌂', color: '#2D88FF', route: '/home', category: 'Social' },
  { slug: 'messages', title: 'Messages', subtitle: 'Private and group conversations', emoji: '✉', color: '#10B981', route: '/messages', category: 'Social' },
  { slug: 'community', title: 'Friends & Groups', subtitle: 'Connections, groups, and pages', emoji: '◎', color: '#2D88FF', route: '/community', category: 'Social' },
  { slug: 'marketplace', title: 'Marketplace', subtitle: 'Local listings and civic commerce', emoji: '▦', color: '#F59E0B', route: '/marketplace', category: 'Social' },
  { slug: 'governance', title: 'Governance', subtitle: 'Projects, budgets, reports', emoji: '▥', color: '#6366F1', route: '/governance', category: 'Civic' },
  { slug: 'profiling', title: 'Civic Directory', subtitle: 'Officials and public profiles', emoji: '◉', color: '#2D88FF', category: 'Civic' },
  { slug: 'elections', title: 'Elections', subtitle: 'Candidates and mock ballot', emoji: '✓', color: '#A855F7', route: '/elections', category: 'Civic' },
  { slug: 'debates', title: 'Debates', subtitle: 'Structured civic discussions', emoji: '⚔', color: '#EF4444', category: 'Civic' },
  { slug: 'polls', title: 'Polls & Surveys', subtitle: 'Community sentiment', emoji: '▤', color: '#2D88FF', route: '/polls', category: 'Civic' },
  { slug: 'charity', title: 'Charity', subtitle: 'Verified civic campaigns', emoji: '♡', color: '#EF4444', category: 'Civic' },
  { slug: 'jobs', title: 'Career Center', subtitle: 'Jobs and applications', emoji: '▣', color: '#10B981', route: '/jobs', category: 'Services' },
  { slug: 'lost-found', title: 'Lost & Found', subtitle: 'Reports and community alerts', emoji: '⌕', color: '#F59E0B', route: '/lost-found', category: 'Services' },
  { slug: 'environment', title: 'Environment', subtitle: 'Eco projects and reports', emoji: '♧', color: '#10B981', route: '/environment', category: 'Services' },
  { slug: 'news', title: 'Publications', subtitle: 'Government and civic news', emoji: '▧', color: '#2D88FF', route: '/news', category: 'Services' },
  { slug: 'events', title: 'Events', subtitle: 'Assemblies and community activities', emoji: '□', color: '#A855F7', route: '/events', category: 'Social' },
  { slug: 'education', title: 'Civic Academy', subtitle: 'Courses, guides, credentials', emoji: '◇', color: '#6366F1', category: 'Services' },
  { slug: 'healthcare', title: 'Healthcare', subtitle: 'Local health access hub', emoji: '+', color: '#EF4444', category: 'Services' },
  { slug: 'tourism', title: 'Tourism', subtitle: 'Places, passes, itineraries', emoji: '⌖', color: '#10B981', category: 'Services' },
  { slug: 'agriculture', title: 'Agri-Civic Hub', subtitle: 'Produce, cooperatives, forum', emoji: '♨', color: '#10B981', category: 'Services' },
  { slug: 'disaster', title: 'Disaster Command', subtitle: 'Bulletins and resource requests', emoji: '!', color: '#EF4444', category: 'Services' },
  { slug: 'volunteer', title: 'Volunteers', subtitle: 'Campaigns and civic rewards', emoji: '✦', color: '#F59E0B', category: 'Services' },
  { slug: 'public-services', title: 'Public Utility', subtitle: 'Bills, waste, transport, outages', emoji: '⚙', color: '#2D88FF', category: 'Services' },
  { slug: 'community-development', title: 'Community Dev', subtitle: 'Proposals and budgets', emoji: '⌘', color: '#A855F7', category: 'Services' },
  { slug: 'economic-development', title: 'Economic Dev', subtitle: 'MSME support and procurement', emoji: '↗', color: '#10B981', category: 'Services' },
  { slug: 'saved', title: 'Saved', subtitle: 'Your saved civic content', emoji: '★', color: '#F59E0B', route: '/saved', category: 'Personal' },
  { slug: 'profile', title: 'Civic Identity', subtitle: 'Profile, credentials, trust', emoji: '●', color: '#2D88FF', route: '/profile', category: 'Personal' },
  { slug: 'mail', title: 'Mailbox', subtitle: 'Official inbox and notices', emoji: '✉', color: '#6366F1', category: 'Personal' },
  { slug: 'reels', title: 'Civic Reels', subtitle: 'Short civic media', emoji: '▶', color: '#A855F7', route: '/reels', category: 'Social' },
];

export function moduleBySlug(slug?: string) {
  return civicModules.find((item) => item.slug === slug);
}
