// node test.mjs
import assert from 'node:assert/strict';
import { review, nextBatch, merge, MIN } from './srs.js';

const now = 1e12;
let s = review({}, 'good', now);
assert.equal(s.ivl, 1);
s = review(s, 'good', now); assert.equal(s.ivl, 3);
s = review(s, 'good', now); assert.equal(s.ivl, 8); // 3 * 2.5 rounded
s = review(s, 'again', now);
assert.equal(s.due, now + 10 * MIN); assert.equal(s.reps, 0); assert.equal(s.ease, 2.3);

const cards = [];
for (const ch of [1, 2, 3]) for (let i = 0; i < 5; i++) cards.push({ id: `ch${ch}-${i}`, topic: 'storage', chapter: ch });

// book order (default): straight through chapter 1, then 2
assert.deepEqual(nextBatch(cards, {}, { now, n: 6 }).map(x => x.card.id), ['ch1-0', 'ch1-1', 'ch1-2', 'ch1-3', 'ch1-4', 'ch2-0']);
// chapters turned off are skipped, reviews too
const offSt = { 'ch1-4': { due: now - 1, u: 1 } };
assert.ok(nextBatch(cards, offSt, { now, n: 20, off: ['storage:1'] }).every(x => x.card.chapter !== 1));

// mix: chapters rotate, book order kept within a chapter
const b = nextBatch(cards, {}, { now, n: 6, order: 'mix' });
assert.deepEqual(b.map(x => x.card.id), ['ch1-0', 'ch2-0', 'ch3-0', 'ch1-1', 'ch2-1', 'ch3-1']);
for (let i = 1; i < b.length; i++) assert.notEqual(b[i].card.chapter, b[i - 1].card.chapter);

// due cards get every 3rd slot, as reviews
const st = { 'ch3-4': { due: now - 1, u: 1 } };
const b2 = nextBatch(cards, st, { now, n: 6, order: 'mix' });
assert.equal(b2[2].mode, 'review'); assert.equal(b2[2].card.id, 'ch3-4');
assert.equal(b2.filter(x => x.card.id === 'ch3-4').length, 1);

// daily session: all due reviews + at most maxNew new cards
const day = nextBatch(cards, { 'ch3-4': { due: now - 1, u: 1 }, 'ch3-3': { due: now - 1, u: 1 } }, { now, maxNew: 4 });
assert.equal(day.filter(x => x.mode === 'new').length, 4);
assert.equal(day.filter(x => x.mode === 'review').length, 2);

// recently shown cards are skipped; everything exhausted -> short batch
const recent = new Map(cards.map(c => [c.id, now]));
assert.equal(nextBatch(cards, {}, { now, recent }).length, 0);

assert.deepEqual(merge({ a: { u: 2 }, b: { u: 1 } }, { a: { u: 1 }, b: { u: 5 }, c: { u: 1 } }), { a: { u: 2 }, b: { u: 5 }, c: { u: 1 } });
console.log('ok');
