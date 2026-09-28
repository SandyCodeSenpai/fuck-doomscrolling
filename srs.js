// Spaced repetition + feed picking. Pure functions, no DOM (tested by test.mjs).
export const MIN = 60e3, DAY = 864e5;

// s: per-card state {ease, ivl (days), reps, lapses, due (ms), saved (ms|0), u (ms, last change)}
// grade: 'again' | 'good'. A card only counts as learned once rated; skipping changes nothing.
// ponytail: SM-2-lite with two grades; swap in FSRS if intervals feel off.
export function review(s = {}, grade, now = Date.now()) {
  let { ease = 2.5, ivl = 0, reps = 0, lapses = 0 } = s;
  if (grade === 'again') {
    return { ...s, ease: Math.max(1.3, ease - 0.2), ivl: 0, reps: 0, lapses: lapses + 1, due: now + 10 * MIN, u: now };
  }
  ivl = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(ivl * ease);
  return { ...s, ease, ivl, reps: reps + 1, lapses, due: now + ivl * DAY, u: now };
}

export const groupOf = c => `${c.topic}:${c.chapter}`;

// Next feed items: [{card, mode: 'new' | 'review'}], at most n in total and maxNew new ones.
// order 'book': new cards straight through the book, chapter by chapter.
// order 'mix': from the least-covered chapter, never the same chapter twice in a row.
// Chapters in `off` (group keys) are skipped entirely, reviews included.
// Every 3rd slot is a due review (every 2nd if the backlog is big).
// recent: Map id -> ms shown this session; those are skipped for 5 minutes.
export function nextBatch(cards, state, { now = Date.now(), n = Infinity, maxNew = Infinity, recent = new Map(), lastGroup = null, order = 'book', off = [] } = {}) {
  const skip = new Set(off);
  cards = cards.filter(c => !skip.has(groupOf(c)));
  const fresh = id => !(now - (recent.get(id) ?? -Infinity) < 5 * MIN);
  const due = cards.filter(c => state[c.id]?.due <= now && fresh(c.id)).sort((a, b) => state[a.id].due - state[b.id].due);
  const groups = new Map();
  for (const c of cards) {
    const g = groups.get(groupOf(c)) ?? { key: groupOf(c), total: 0, seen: 0, queue: [] };
    g.total++;
    if (state[c.id]?.due) g.seen++;
    else if (fresh(c.id)) g.queue.push(c);
    groups.set(g.key, g);
  }
  const out = [];
  const reviewEvery = due.length > 30 ? 2 : 3;
  let newTaken = 0;
  while (out.length < n) {
    const open = newTaken < maxNew ? [...groups.values()].filter(g => g.queue.length) : [];
    if (due.length && ((out.length + 1) % reviewEvery === 0 || !open.length)) {
      const card = due.shift();
      out.push({ card, mode: 'review' });
      lastGroup = groupOf(card);
      continue;
    }
    if (!open.length) break;
    const pool = open.length > 1 ? open.filter(g => g.key !== lastGroup) : open;
    const g = order === 'book' ? open[0] : pool.reduce((a, b) => (b.seen / b.total < a.seen / a.total ? b : a));
    out.push({ card: g.queue.shift(), mode: 'new' });
    newTaken++;
    g.seen++;
    lastGroup = g.key;
  }
  return out;
}

// Merge two {id: state} maps (local vs cloud): newest change per card wins.
export function merge(a = {}, b = {}) {
  const out = { ...a };
  for (const [id, s] of Object.entries(b)) if (!out[id] || (s.u ?? 0) > (out[id].u ?? 0)) out[id] = s;
  return out;
}
