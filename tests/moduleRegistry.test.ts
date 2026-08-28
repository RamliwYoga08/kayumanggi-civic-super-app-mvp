import assert from 'node:assert/strict';
import test from 'node:test';
import { civicModules } from '../constants/modules';

test('module registry preserves broad Kayumanggi scope', () => {
  assert.ok(civicModules.length >= 28);
  const slugs = new Set(civicModules.map((m) => m.slug));
  assert.equal(slugs.size, civicModules.length);
  for (const required of ['governance','marketplace','elections','polls','education','healthcare','disaster','economic-development']) {
    assert.ok(slugs.has(required), `missing ${required}`);
  }
});
