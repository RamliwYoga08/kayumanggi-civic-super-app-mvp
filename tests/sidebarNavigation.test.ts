import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const source = fs.readFileSync(path.join(process.cwd(), 'components/DesktopSidebar.tsx'), 'utf8');

test('desktop sidebar contains the complete social and civic navigation', () => {
  const labels = [
    'Feed', 'Messages', 'Friends', 'Groups', 'Marketplace', 'Pages', 'Civic Reels', 'Events', 'Saved',
    'Profiling', 'Governance', 'Elections', 'Debates', 'Polls & Surveys', 'Charity', 'Jobs', 'Lost & Found',
    'Environment', 'News', 'Education', 'Healthcare', 'Tourism', 'Agriculture', 'Disaster Mgmt', 'Volunteers',
    'Public Utility', 'Community Dev', 'Economic Dev',
  ];
  for (const label of labels) assert.ok(source.includes(`label: '${label}'`), `Missing sidebar item: ${label}`);
});

test('sidebar community destinations use explicit tabs', () => {
  assert.match(source, /community\?tab=suggestions/);
  assert.match(source, /community\?tab=groups/);
  assert.match(source, /community\?tab=pages/);
});
