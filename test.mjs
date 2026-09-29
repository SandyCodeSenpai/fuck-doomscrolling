// node test.mjs
import assert from 'node:assert/strict';
import { review, buildSession, streakOf, merge, DAY } from './srs.js';

const now = 1e12, rand = () => 0.5; // rand 0.5 -> fuzz factor exactly 1
// intervals grow 1, 3, then x ease
let s = review({}, 'good', { now, rand });
assert.equal(s.ivl, 1);
s = review(s, 'good', { now: now + DAY, rand }); assert.equal(s.ivl, 3);
s = review(s, 'good', { now: now + 4 * DAY, rand }); assert.equal(s.ivl, 8); // 3 * 2.5 rounded
// forgetting keeps 30% of the interval, due tomorrow, ease drops
const f = review(s, 'again', { now: now + 12 * DAY, rand });
assert.equal(f.ivl, 2); assert.equal(f.due, now + 13 * DAY); assert.equal(f.ease, 2.3); assert.equal(f.lapses, 1);
// late but still known: credit the real gap (20 days, not 8)
assert.equal(review(s, 'good', { now: now + 24 * DAY, rand }).ivl, 50);
// fast correct lets ease recover, capped
assert.equal(review({ ease: 2.79, reps: 3, ivl: 10 }, 'good', { now, easy: true, rand }).ease, 2.8);
// history is logged
assert.deepEqual(f.h.map(x => x[1]), [1, 1, 1, 0]);

const cards = [];
for (const ch of [1, 2, 3]) for (let i = 0; i < 7; i++) cards.push({ id: `ch${ch}-${i}`, topic: 'storage', chapter: ch });
const ids = items => items.map(x => `${x.mode[0]}:${x.card.id}`);

// fresh start, book order: episode of 5 new from ch1, then a check of the same 5; next episode continues ch1
const { items } = buildSession(cards, {}, { now, episodes: 2, rand });
assert.deepEqual(items.slice(0, 5).map(x => x.card.id), ['ch1-0', 'ch1-1', 'ch1-2', 'ch1-3', 'ch1-4']);
assert.ok(items.slice(0, 5).every(x => x.mode === 'new'));
assert.deepEqual(items.slice(5, 10).map(x => x.card.id).sort(), ['ch1-0', 'ch1-1', 'ch1-2', 'ch1-3', 'ch1-4']);
assert.ok(items.slice(5, 10).every(x => x.mode === 'check'));
assert.deepEqual(items.slice(10, 12).map(x => x.card.id), ['ch1-5', 'ch1-6']); // episode never crosses a chapter
assert.equal(items.length, 14);

// chapters turned off are skipped, reviews too
const st = { 'ch1-0': { due: now - 1, ivl: 1, u: 1 } };
assert.ok(buildSession(cards, st, { now, off: ['storage:1'], rand }).items.every(x => x.card.chapter !== 1));
// reviews are spread before episodes
assert.deepEqual(ids(buildSession(cards, st, { now, episodes: 1, rand }).items).slice(0, 2), ['r:ch1-0', 'n:ch1-1']);

// mix: episodes come from different chapters
const mix = buildSession(cards, {}, { now, episodes: 3, order: 'mix', rand }).items.filter(x => x.mode === 'new');
assert.deepEqual([...new Set(mix.map(x => x.card.chapter))], [1, 2, 3]);

// over the review cap -> catch-up day: capped reviews, no new cards
const many = Object.fromEntries(cards.slice(0, 10).map((c, i) => [c.id, { due: now - i, ivl: 1, u: 1 }]));
const cu = buildSession(cards, many, { now, reviewCap: 4, rand });
assert.ok(cu.catchUp); assert.equal(cu.items.length, 4); assert.ok(cu.items.every(x => x.mode === 'review'));

// streak: today not done doesn't break it; one missed day per 7 is forgiven, two in a week aren't
const t = 1000;
assert.equal(streakOf([t, t - 1, t - 2], t), 3);
assert.equal(streakOf([t - 1, t - 2], t), 2);
assert.equal(streakOf([t, t - 1, t - 3, t - 4], t), 4);
assert.equal(streakOf([t, t - 2, t - 4], t), 2);
assert.equal(streakOf([t - 2, t - 3], t), 2); // missed yesterday, can still keep it today
assert.equal(streakOf([t - 3], t), 0);

assert.deepEqual(merge({ a: { u: 2 }, b: { u: 1 } }, { a: { u: 1 }, b: { u: 5 }, c: { u: 1 } }), { a: { u: 2 }, b: { u: 5 }, c: { u: 1 } });
console.log('ok');
