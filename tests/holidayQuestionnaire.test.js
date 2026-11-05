import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizedToken, questions, validateAnswers } from '../src/lib/holidayQuestionnaire.js';
test('token secret obligatoire', () => { assert.equal(authorizedToken(null, undefined), false); assert.equal(authorizedToken('', ''), false); assert.equal(authorizedToken('a'.repeat(40), 'a'.repeat(40)), true); assert.equal(authorizedToken('b'.repeat(40), 'a'.repeat(40)), false); });
test('réponses bornées et normalisées', () => { const input = Object.fromEntries(questions.map(q => [q.id, ' Réponse précise '])); assert.equal(validateAnswers(input).minimum, 'Réponse précise'); assert.equal(validateAnswers({}), null); input.minimum = 'x'.repeat(2001); assert.equal(validateAnswers(input), null); });
test('réponse obligatoire, pas de réponse différée', () => {
  const input = Object.fromEntries(questions.map(q => [q.id, 'Réponse précise']));
  input.notes = '';
  assert.equal(validateAnswers(input).notes, '');
  for (const value of ['', '  ', 'À décider', 'a decider.']) {
    input.minimum = value;
    assert.equal(validateAnswers(input), null);
  }
});
