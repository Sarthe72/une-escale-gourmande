import test from 'node:test';
import assert from 'node:assert/strict';
import { isChristmasSeason } from '../src/lib/christmasSeason.js';
for (const year of [2026, 2027, 2028]) {
  for (const [date, expected] of [
    [`${year}-11-30T22:59:59Z`, false], [`${year}-11-30T23:00:00Z`, true],
    [`${year}-12-31T23:00:00Z`, true], [`${year + 1}-01-05T22:59:59Z`, true],
    [`${year + 1}-01-05T23:00:00Z`, false], [`${year}-06-15T12:00:00Z`, false],
  ]) test(`Christmas ${date}`, () => assert.equal(isChristmasSeason(new Date(date)), expected));
}
