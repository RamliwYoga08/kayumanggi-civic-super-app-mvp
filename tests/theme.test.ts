import assert from 'node:assert/strict';
import test from 'node:test';
import { darkTheme, lightTheme } from '../constants/theme';

test('theme retains supplied Kayumanggi colors', () => {
  assert.equal(darkTheme.background, '#09090b');
  assert.equal(darkTheme.border, '#27272a');
  assert.equal(darkTheme.mutedFg, '#a1a1aa');
  assert.equal(darkTheme.text, '#fafafa');
  assert.equal(darkTheme.active, '#10B981');
  assert.equal(darkTheme.danger, '#EF4444');
  assert.equal(darkTheme.warning, '#F59E0B');
  assert.equal(darkTheme.info, '#2D88FF');
  assert.equal(lightTheme.background, '#f0f2f5');
});
