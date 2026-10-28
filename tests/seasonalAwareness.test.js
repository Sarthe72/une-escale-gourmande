import test from 'node:test';
import assert from 'node:assert/strict';
import { awarenessCampaign } from '../src/lib/seasonalAwareness.js';

for (const year of [2026, 2027, 2028]) {
  for (const [date, expected] of [
    [`${year}-09-30T21:59:59Z`, null],
    [`${year}-09-30T22:00:00Z`, 'octobre-rose'],
    [`${year}-10-31T22:59:59Z`, 'octobre-rose'],
    [`${year}-10-31T23:00:00Z`, 'movember'],
    [`${year}-11-30T22:59:59Z`, 'movember'],
    [`${year}-11-30T23:00:00Z`, null],
    [`${year}-01-15T12:00:00Z`, null],
  ]) {
    test(`${date}: ${expected}`, () => assert.equal(awarenessCampaign(new Date(date)), expected));
  }
}
