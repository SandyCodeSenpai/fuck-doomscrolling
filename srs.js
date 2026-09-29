// Spaced repetition + session building. Pure functions, no DOM (tested by test.mjs).
export const MIN = 60e3, DAY = 864e5;

// Local calendar day number (days since epoch in local time).
export const dayNum = (ms = Date.now()) => Math.floor((ms - new Date(ms).getTimezoneOffset() * MIN) / DAY);

// s: per-card state {ease, ivl (days), reps, lapses, due (ms), last (ms), saved (ms|0), u (ms), h: [[day, 0|1, kind]]}
// grade 'again' | 'good'. easy: a fast correct answer, lets ease recover. kind: 'm' mcq, 'r' recall.
// ponytail: SM-2-lite; the h log is kept so this can move to FSRS once there's enough data.
export function review(s = {}, grade, { now = Date.now(), easy = false, kind = 'r', rand = Math.random } = {}) {
  const { ease = 2.5, ivl = 0, reps = 0, lapses = 0, last } = s;
  const h = [...(s.h ?? []), [dayNum(now), grade === 'good' ? 1 : 0, kind]].slice(-20);
  if (grade === 'again') {
    // forgetting keeps 30% of the interval instead of starting over; the session re-asks it in a few cards
    const kept = ivl ? Math.max(1, Math.round(ivl * 0.3)) : 0;
    return { ...s, ease: Math.max(1.3, ease - 0.2), ivl: kept, reps: kept >= 3 ? 2 : 0, lapses: lapses + 1, due: now + DAY, last: now, u: now, h };
  }
  const elapsed = last ? (now - last) / DAY : 0; // answered late and still knew it -> credit the real gap
  let next = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(Math.max(ivl, elapsed) * ease * (0.95 + 0.1 * rand()));
  if (reps >= 2) next = Math.max(next, ivl + 1);
  const e = easy ? Math.min(2.8, ease + 0.05) : ease;
  return { ...s, ease: e, ivl: next, reps: reps + 1, lapses, due: now + next * DAY, last: now, u: now, h };
}

export const groupOf = c => `${c.topic}:${c.chapter}`;
const isNew = (state, c) => !state[c.id]?.due;

// One day's session: [{card, mode: 'new' | 'check' | 'review'}].
// - Reviews: due cards, most overdue (relative to interval) first, capped at reviewCap.
//   If more than reviewCap are due it's a catch-up day: no new cards.
// - Episodes: epSize new cards from one chapter (book order, or least-covered chapter for 'mix'),
//   followed by a check round on exactly those cards, shuffled. Only the check schedules a new card.
// - Reviews are spread between episodes so the session alternates.
export function buildSession(cards, state, {
  now = Date.now(), episodes = 2, epSize = 5, reviewCap = 40, order = 'book', off = [], skip = new Set(), rand = Math.random,
} = {}) {
  const offSet = new Set(off);
  const on = cards.filter(c => !offSet.has(groupOf(c)) && !skip.has(c.id));
  const overdue = c => (now - state[c.id].due) / Math.max(state[c.id].ivl ?? 1, 1);
  const allDue = on.filter(c => state[c.id]?.due <= now).sort((a, b) => overdue(b) - overdue(a));
  const catchUp = allDue.length > reviewCap;
  const due = allDue.slice(0, reviewCap);

  const groups = new Map();
  for (const c of on) {
    const g = groups.get(groupOf(c)) ?? { key: groupOf(c), total: 0, seen: 0, queue: [] };
    g.total++;
    if (isNew(state, c)) g.queue.push(c); else g.seen++;
    groups.set(g.key, g);
  }
  const eps = [];
  let last = null;
  for (let e = 0; e < (catchUp ? 0 : episodes); e++) {
    const open = [...groups.values()].filter(g => g.queue.length);
    if (!open.length) break;
    const pool = open.length > 1 ? open.filter(g => g.key !== last) : open;
    const g = order === 'book' ? open[0] : pool.reduce((a, b) => (b.seen / b.total < a.seen / a.total ? b : a));
    const ep = g.queue.splice(0, epSize);
    g.seen += ep.length;
    last = g.key;
    eps.push(ep);
  }

  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const per = Math.ceil(due.length / (eps.length + 1));
  const items = [];
  for (const ep of eps) {
    items.push(...due.splice(0, per).map(card => ({ card, mode: 'review' })));
    items.push(...ep.map(card => ({ card, mode: 'new' })));
    items.push(...shuffle(ep).map(card => ({ card, mode: 'check' })));
  }
  items.push(...due.map(card => ({ card, mode: 'review' })));
  return { items, catchUp };
}

// Streak in days, from the list of day numbers with a completed session.
// Today not done yet doesn't break it, and one missed day per 7 is forgiven.
export function streakOf(days, today) {
  const done = new Set(days);
  let d = done.has(today) ? today : today - 1, n = 0, gap = Infinity;
  for (;;) {
    if (done.has(d)) { n++; d--; }
    else if ((n || d === today - 1) && gap - d >= 7 && done.has(d - 1)) { gap = d; d--; }
    else return n;
  }
}

// Merge two {id: state} maps (local vs cloud): newest change per key wins.
export function merge(a = {}, b = {}) {
  const out = { ...a };
  for (const [id, s] of Object.entries(b)) if (!out[id] || (s.u ?? 0) > (out[id].u ?? 0)) out[id] = s;
  return out;
}
