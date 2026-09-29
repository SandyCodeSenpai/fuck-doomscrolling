import { review, buildSession, streakOf, merge, groupOf, dayNum, DAY } from './srs.js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const KEY = 'fds.v1';
let state = {}; // card id -> srs state (see srs.js), plus '_settings', '_day', '_stats'
try { state = JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch {}
const cards = await (await fetch('cards.json')).json();
const byId = Object.fromEntries(cards.map(c => [c.id, c]));
const view = document.getElementById('view');
const segs = document.getElementById('segs');
const main = document.querySelector('main');
let tab = 'today', touched = false, combo = 0;

// position of each card inside its chapter, e.g. 12/65
const chapterSize = {};
for (const c of cards) c.pos = chapterSize[groupOf(c)] = (chapterSize[groupOf(c)] ?? 0) + 1;
const COLORS = ['#1d9bf0', '#a78bfa', '#22c55e', '#f59e0b', '#f472b6', '#2dd4bf', '#818cf8',
  '#ff7a45', '#38bdf8', '#f43f5e', '#14b8a6', '#eab308', '#e7e9ea', '#c084fc'];
const colorOf = c => COLORS[(c.chapter - 1) % COLORS.length];

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(id, s) { state[id] = s; persist(); scheduleSync(); }

// Settings, today's tally and the streak live in state so they sync and merge like card state.
const settings = () => ({ order: 'book', off: [], episodes: 2, sound: true, ...state._settings });
const setSettings = patch => set('_settings', { ...settings(), ...patch, u: Date.now() });
const today = () => dayNum();
const day = () => (state._day?.day === today() ? state._day : { day: today(), log: [], bonus: 0 });
const setDay = patch => set('_day', { ...day(), ...patch, u: Date.now() });
const days = () => state._stats?.days ?? [];
const streak = () => streakOf(days(), today());

function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

// Text with **bold terms**, `code`, and numbers-with-units tinted. Built from nodes, never innerHTML.
const TOKEN = /(\*\*[^*]+\*\*)|(`[^`]+`)|([~≈]?\d[\d,.]*\s?(?:×|%|x\b|nines\b|[KMGTPE]i?B\b|ms\b|µs\b|ns\b|s\b|seconds?\b|minutes?\b|hours?\b|days?\b|years?\b|months?\b|weeks?\b))/g;
function inline(str, parent) {
  let i = 0;
  for (const m of str.matchAll(TOKEN)) {
    parent.append(str.slice(i, m.index));
    if (m[1]) parent.append(h('b', null, m[1].slice(2, -2)));
    else if (m[2]) parent.append(h('code', null, m[2].slice(1, -1)));
    else parent.append(h('span', 'num', m[3]));
    i = m.index + m[0].length;
  }
  parent.append(str.slice(i));
}
function rich(text, cls, lede = false) {
  const box = h('div', cls);
  text.split(/\n\n+/).forEach((para, k) => {
    const p = h('p');
    const first = lede && k === 0 && para.match(/^.+?[.!?](?=\s|$)/);
    if (first && first[0].split('**').length % 2) { // don't split inside **bold**
      const l = h('span', 'lede');
      inline(first[0], l);
      p.append(l);
      para = para.slice(first[0].length);
    }
    inline(para, p);
    box.append(p);
  });
  return box;
}

// Sound: tiny WebAudio blips, no files. Correct answers in a row climb in pitch.
let ac;
function tone(freq, dur = 0.12, vol = 0.07, delay = 0, type = 'sine') {
  if (!settings().sound) return;
  try {
    ac ??= new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + delay;
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur);
  } catch {}
}
const chime = n => { const f = 523.25 * 2 ** (Math.min(n, 12) / 12); tone(f); tone(f * 1.5, 0.18, 0.05, 0.08); };
const thud = () => tone(160, 0.16, 0.06, 0, 'triangle');
const tick = () => tone(1200, 0.03, 0.02);
const buzz = ms => navigator.vibrate?.(ms);

function kicker(card, override) {
  const k = h('div', 'kicker');
  if (override) k.textContent = override;
  else if (card.kind === 'mistake') { k.textContent = '✕ Common mistake'; k.classList.add('k-mistake'); }
  else if (card.kind === 'lens') { k.textContent = '◆ Senior staff lens'; k.classList.add('k-lens'); }
  else if (card.kind === 'story') k.textContent = card.company ? `${card.company}${card.year ? ' · ' + card.year : ''}` : 'War story';
  else if (card.kind === 'recap') k.textContent = 'Key idea';
  else k.textContent = card.section;
  return k;
}

function topRow(card) {
  const top = h('div', 'top');
  top.append(h('span', 'dot', card.chapter), h('b', null, card.chapterTitle), h('span', 'muted', ` · ${card.pos}/${chapterSize[groupOf(card)]}`));
  return top;
}

// The explanation block: title, stat, body, flow, takeaway.
function explanation(card) {
  const box = h('div', 'explain');
  box.append(h('h3', 'title', card.title));
  if (card.stat) {
    const s = h('div', 'stat');
    s.append(h('span', 'value', card.stat.value), h('span', 'stat-label', card.stat.label));
    box.append(s);
  }
  box.append(rich(card.body, 'body', true));
  if (card.flow) {
    const f = h('div', 'flow');
    card.flow.forEach((step, i) => { if (i) f.append(h('span', 'arrow', '→')); f.append(h('span', 'step', step)); });
    box.append(f);
  }
  if (card.takeaway) box.append(h('div', 'takeaway', card.takeaway));
  return box;
}

// "Go deeper" (expands inline) and Save.
function actionRow(card) {
  const row = h('div', 'actions');
  const deeper = rich(card.deeper, 'deeper');
  deeper.hidden = true;
  const more = h('button', 'more-btn', 'Go deeper ↓');
  more.onclick = e => {
    e.stopPropagation();
    deeper.hidden = !deeper.hidden;
    more.textContent = deeper.hidden ? 'Go deeper ↓' : 'Less ↑';
    if (!deeper.hidden) { tick(); deeper.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  };
  const save = h('button', 'save-btn');
  const paint = () => { save.textContent = state[card.id]?.saved ? '★ Saved' : '☆ Save'; save.classList.toggle('on', !!state[card.id]?.saved); };
  save.onclick = e => {
    e.stopPropagation();
    const s = state[card.id] ?? {};
    set(card.id, { ...s, saved: s.saved ? 0 : Date.now(), u: Date.now() });
    paint();
    tick();
  };
  paint();
  row.append(more, save);
  return [row, deeper];
}

function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// A new card: hook (or a guess) first, tap to reveal the explanation. Reading never schedules; the check does.
function newCard(item) {
  const { card } = item;
  const el = h('article', 'slide card-new');
  const content = h('div', 'content');
  content.append(kicker(card), h('h2', 'hook', card.predict?.q ?? card.hook ?? card.title));
  const explain = explanation(card);
  const [actions, deeper] = actionRow(card);
  explain.append(deeper);
  const hint = h('div', 'hint', card.predict ? 'Take a guess' : 'Tap to reveal');
  const reveal = () => {
    if (el.classList.contains('revealed')) return;
    el.classList.add('revealed');
    tick();
  };
  if (card.predict) {
    const opts = h('div', 'options');
    const correct = card.predict.options[0];
    for (const o of shuffled(card.predict.options)) {
      const b = h('button', 'option', o);
      b.onclick = e => {
        e.stopPropagation();
        if (el.classList.contains('revealed')) return;
        for (const x of opts.children) x.classList.add(x.textContent === correct ? 'right' : x === b ? 'wrong' : 'dim');
        if (o === correct) chime(0); else thud();
        hint.textContent = o === correct ? 'Nice call.' : 'Most people miss this one. Here’s why:';
        hint.classList.add('said');
        reveal();
      };
      opts.append(b);
    }
    content.append(opts);
  } else {
    el.onclick = e => { if (!e.target.closest('button')) reveal(); };
  }
  content.append(hint, explain);
  el.append(topRow(card), content, h('div', 'peek'), actions);
  return el;
}

// A question slide. Checks and young cards: multiple choice, graded by the app.
// Mature cards (interval >= 7 days): free recall, graded by you.
function questionCard(item, label) {
  const { card } = item;
  const mcq = card.mcq && (item.mode === 'check' || (state[card.id]?.ivl ?? 0) < 7);
  const el = h('article', 'slide card-q');
  const content = h('div', 'content');
  content.append(kicker(card, label));
  const started = Date.now();
  const next = h('button', 'next', 'Next ↓');
  next.onclick = () => advance(el, 0);
  const seeCard = h('button', 'link', 'Show the card');
  seeCard.onclick = () => seeCard.replaceWith(explanation(card));

  if (mcq) {
    content.append(h('h2', 'q', card.mcq.q));
    const opts = h('div', 'options');
    const correct = card.mcq.options[0];
    for (const o of shuffled(card.mcq.options)) {
      const b = h('button', 'option', o);
      b.onclick = () => {
        if (el.dataset.result) return;
        const ok = o === correct;
        for (const x of opts.children) x.classList.add(x.textContent === correct ? 'right' : x === b ? 'wrong' : 'dim');
        const why = h('div', 'why');
        why.append(h('b', null, ok ? 'Correct. ' : 'Not quite. '), card.mcq.why);
        opts.after(why, seeCard, next);
        grade(item, el, ok ? 'good' : 'again', { kind: 'm', easy: ok && Date.now() - started < 4000 });
        if (ok) advance(el, 1100);
      };
      opts.append(b);
    }
    content.append(opts);
  } else {
    content.append(h('h2', 'q', card.quiz.q));
    const show = h('button', 'primary', 'Show answer');
    const judge = h('div', 'judge');
    const forgot = h('button', 'forgot', 'Forgot'), knew = h('button', 'knew', 'Knew it');
    judge.append(forgot, knew);
    judge.hidden = true;
    show.onclick = () => { show.replaceWith(rich(card.quiz.a, 'answer')); judge.hidden = false; tick(); };
    const pick = g => {
      if (el.dataset.result) return;
      grade(item, el, g, { kind: 'r' });
      judge.replaceWith(seeCard, next);
      advance(el, g === 'good' ? 700 : 1400);
    };
    forgot.onclick = () => pick('again');
    knew.onclick = () => pick('good');
    content.append(show, judge);
  }
  el.append(topRow(card), content);
  return el;
}

// Record an answer: schedule the card, tally the day, feedback, re-ask misses a few cards later.
function grade(item, el, g, opts) {
  touched = true;
  const { card } = item;
  set(card.id, { ...review(state[card.id], g, opts), saved: state[card.id]?.saved ?? 0 });
  el.dataset.result = g;
  el.classList.add(g === 'good' ? 'got' : 'missed');
  const log = [...day().log, [card.id, g === 'good' ? 1 : 0]];
  setDay({ log });
  // the streak counts once you've answered 5 today, not only if you reach the finish line
  if (log.length >= 5 && !days().includes(today())) set('_stats', { days: [...days(), today()].slice(-120), u: Date.now() });
  if (g === 'good') { combo++; chime(combo); buzz(10); } else { combo = 0; thud(); buzz([20, 40, 20]); }
  showCombo();
  if (g === 'again' && !item.again) {
    let ref = el;
    for (let i = 0; i < 3 && !ref.nextElementSibling.classList.contains('done'); i++) ref = ref.nextElementSibling;
    ref.after(slide({ card, mode: 'check', again: true }));
    paintPeeks();
  }
  paintSegs();
}

function advance(el, ms) {
  setTimeout(() => el.nextElementSibling?.scrollIntoView({ behavior: 'smooth' }), ms);
}

function showCombo() {
  const c = document.getElementById('combo');
  c.textContent = combo >= 3 ? `${combo} in a row` : '';
  c.classList.remove('bump');
  void c.offsetWidth; // restart the animation
  c.classList.add('bump');
}

// ---- Today: one card per screen (CSS scroll-snap) ----
const slideObserver = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) onSlide(e.target);
}, { root: view, threshold: 0.6 });

function slide(item) {
  const label = item.again ? 'Try again' : item.mode === 'check' ? `Quick check${item.n ? ' · ' + item.n : ''}` : 'Review';
  const el = item.mode === 'new' ? newCard(item) : questionCard(item, label);
  el.style.setProperty('--c', colorOf(item.card));
  el.item = item;
  slideObserver.observe(el);
  return el;
}

const cardSlides = () => [...view.querySelectorAll('article.slide:not(.done)')];

function paintSegs() {
  const cur = view.querySelector('.slide.current');
  segs.replaceChildren(...cardSlides().map(s => {
    const i = h('i');
    if (s === cur) { i.className = 'cur'; i.style.background = colorOf(s.item.card); }
    else if (s.dataset.result) i.className = s.dataset.result === 'good' ? 'good' : 'bad';
    else if (s.dataset.seen) i.className = 'seen';
    return i;
  }), h('b', null, '🏁'));
}

function paintPeeks() {
  for (const el of view.querySelectorAll('.card-new')) {
    const peek = el.querySelector('.peek'), next = el.nextElementSibling;
    peek.replaceChildren();
    if (!next) continue;
    const text = next.classList.contains('done') ? '🏁 Finish line'
      : next.item.mode === 'new' ? (next.item.card.hook ?? next.item.card.title)
      : next.item.mode === 'check' ? 'Quick check on what you just read' : 'A quick review';
    peek.append(h('span', 'muted', 'Next  '), text);
    peek.onclick = e => { e.stopPropagation(); next.scrollIntoView({ behavior: 'smooth' }); };
  }
}

function onSlide(el) {
  view.querySelector('.slide.current')?.classList.remove('current');
  el.classList.add('current', 'in');
  el.dataset.seen = 1;
  if (el.classList.contains('done')) finish(el);
  paintSegs();
}

function renderToday() {
  main.classList.add('today');
  view.classList.add('deck');
  const { order, off, episodes } = settings();
  const { items, catchUp } = buildSession(cards, state, { order, off, episodes });
  let n = 0;
  for (const item of items) {
    if (item.mode === 'check') item.n = `${(n++ % 5) + 1}/5`;
    view.append(slide(item));
  }
  const done = h('article', 'slide done');
  done.catchUp = catchUp;
  view.append(done);
  slideObserver.observe(done);
  paintPeeks();
  paintSegs();
}

function weekDots() {
  const row = h('div', 'week'), done = new Set(days()), t = today();
  for (let d = t - 6; d <= t; d++) {
    const cell = h('div', done.has(d) ? 'on' : d === t ? 'today' : '');
    cell.append(h('i'), h('span', null, 'SMTWTFS'[new Date(d * DAY + 12 * 3600e3).getUTCDay()]));
    row.append(cell);
  }
  return row;
}

function countUp(el, to) {
  const from = Math.max(0, to - 1), t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / 600);
    el.textContent = `🔥 ${Math.round(from + (to - from) * p)}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function finish(el) {
  const d = day(), right = d.log.filter(x => x[1]).length;
  el.replaceChildren();
  const box = h('div', 'finish');
  const flame = h('div', 'flame', `🔥 ${streak()}`);
  countUp(flame, streak());
  const title = d.log.length ? 'Done for today.' : cardSlides().length ? 'Scroll back up, a few cards are waiting.' : 'All caught up.';
  box.append(flame, h('div', 'muted', 'day streak'), weekDots(), h('strong', null, title));
  if (el.catchUp) box.append(h('p', 'muted', 'Catch-up day: reviews only, so the pile never gets out of hand.'));
  if (d.log.length) {
    box.append(h('p', null, `${right}/${d.log.length} answers right today`));
    const haul = h('div', 'haul');
    for (const [id, g] of d.log) {
      const sq = h('i', g ? '' : 'miss');
      if (byId[id]) sq.style.setProperty('--c', colorOf(byId[id]));
      haul.append(sq);
    }
    box.append(haul);
    const known = [...new Set(d.log.filter(x => x[1]).map(x => x[0]).reverse())].slice(0, 3).map(id => byId[id]).filter(Boolean);
    if (known.length) {
      const list = h('ul', 'known');
      for (const c of known) { const li = h('li', null, c.title); li.style.setProperty('--c', colorOf(c)); list.append(li); }
      box.append(h('div', 'label', 'You now know'), list);
    }
  }
  const { order, off } = settings();
  const tomorrow = buildSession(cards, state, { now: Date.now() + DAY, order, off, episodes: 1 }).items;
  const teaser = tomorrow.find(x => x.mode === 'new');
  const dueTomorrow = tomorrow.filter(x => x.mode === 'review').length;
  const tease = h('div', 'tease');
  tease.append(h('div', 'label', 'Tomorrow'), h('div', null, teaser ? (teaser.card.hook ?? teaser.card.title) : 'Reviews only. You’ve read every card!'));
  if (dueTomorrow) tease.append(h('div', 'muted', `+ ${dueTomorrow} review${dueTomorrow === 1 ? '' : 's'}`));
  box.append(tease);

  // One more episode is fine; the cap is the stopping cue Instagram never gives you.
  if (d.bonus >= 2) box.append(h('p', 'muted', 'That’s plenty. See you tomorrow.'));
  else if (!el.catchUp) {
    const more = h('button', 'bonus', 'Bonus episode · 5 cards');
    more.onclick = () => {
      const skip = new Set(cardSlides().map(s => s.item.card.id));
      const extra = buildSession(cards, state, { order, off, episodes: 1, reviewCap: Infinity, skip }).items.filter(x => x.mode !== 'review');
      if (!extra.length) return more.replaceWith(h('p', 'muted', 'No new cards left in your chapters.'));
      setDay({ bonus: d.bonus + 1 });
      let n = 0;
      const total = extra.length / 2;
      const first = extra.map(item => {
        if (item.mode === 'check') item.n = `${++n}/${total}`;
        return view.insertBefore(slide(item), el);
      })[0];
      paintPeeks();
      paintSegs();
      first.scrollIntoView({ behavior: 'smooth' });
    };
    box.append(more);
  }
  el.append(box);
}

function empty(title, text) {
  const d = h('div', 'empty', text);
  d.prepend(h('strong', null, title));
  return d;
}

function renderSaved() {
  const saved = cards.filter(c => state[c.id]?.saved).sort((a, b) => state[b.id].saved - state[a.id].saved);
  if (!saved.length) return view.append(empty('Nothing saved yet', 'Tap ☆ Save on a card worth rereading.'));
  for (const card of saved) {
    const el = h('article', 'row-card');
    el.style.setProperty('--c', colorOf(card));
    const [actions, deeper] = actionRow(card);
    const ex = explanation(card);
    ex.append(deeper);
    el.append(topRow(card), kicker(card), ex, actions);
    view.append(el);
  }
}

function segmented(label, options, current, onPick) {
  const seg = h('div', 'seg');
  seg.append(h('span', null, label));
  for (const [value, text] of options) {
    const b = h('button', null, text);
    b.setAttribute('aria-pressed', current === value);
    b.onclick = () => { onPick(value); render(); };
    seg.append(b);
  }
  return seg;
}

function renderProgress() {
  const now = Date.now(), t = today();
  const st = c => state[c.id] ?? {};
  const seen = c => !!st(c).due;
  const mastered = c => st(c).ivl >= 21 && (st(c).h ?? []).slice(-2).every(x => x[1]);
  const recent = cards.flatMap(c => (st(c).h ?? []).filter(x => x[0] > t - 7));
  const retention = recent.length ? Math.round((100 * recent.filter(x => x[1]).length) / recent.length) : null;
  const { order, off, episodes, sound } = settings();
  const current = cards.find(c => !seen(c) && !off.includes(groupOf(c))) ?? cards.at(-1);
  const curList = cards.filter(c => c.chapter === current.chapter);

  const hero = h('div', 'hero');
  hero.append(h('div', 'flame', `🔥 ${streak()}`), h('div', 'muted', 'day streak · one missed day a week is forgiven'), weekDots());
  const stats = h('div', 'stats');
  for (const [n, label] of [
    [retention == null ? '–' : `${retention}%`, `Retention · 7d${recent.length ? ` (${recent.length})` : ''}`],
    [cards.filter(c => st(c).due <= now).length, 'Due now'],
    [cards.filter(mastered).length, 'Mastered'],
    [`${curList.filter(seen).length}/${curList.length}`, `Ch ${current.chapter} learned`],
  ]) { const d = h('div', null, label); d.prepend(h('b', null, n)); stats.append(d); }
  view.append(hero, stats);

  view.append(
    segmented('Episodes a day', [1, 2, 3, 4].map(n => [n, n]), episodes, v => setSettings({ episodes: v })),
    h('div', 'phint', `${episodes * 5} new cards a day, each episode ends with a quick check. Reviews are capped at 40 so a missed day never buries you.`),
    segmented('New cards', [['book', 'Book order'], ['mix', 'Mix chapters']], order, v => setSettings({ order: v })),
    segmented('Sound', [[true, 'On'], [false, 'Off']], sound, v => setSettings({ sound: v })),
    h('div', 'phint', 'Untick a chapter to drop it (and its reviews) from your sessions.'),
  );

  for (const [key, list] of Map.groupBy(cards, groupOf)) {
    const c0 = list[0], s = list.filter(seen).length, m = list.filter(mastered).length;
    const row = h('label', 'chapter');
    row.style.setProperty('--c', colorOf(c0));
    row.classList.toggle('off', off.includes(key));
    const top = h('div', 'row');
    const box = h('input');
    box.type = 'checkbox';
    box.checked = !off.includes(key);
    box.onchange = () => { setSettings({ off: box.checked ? off.filter(k => k !== key) : [...off, key] }); render(); };
    const name = h('div', 'name', `${c0.chapter}. ${c0.chapterTitle}`);
    name.prepend(box);
    top.append(name, h('span', null, `${s}/${list.length} · ${m} mastered`));
    const bar = h('div', 'bar');
    const a = h('i'), b = h('i');
    a.style.width = `${(100 * s) / list.length}%`;
    b.style.width = `${(100 * m) / list.length}%`;
    bar.append(a, b);
    row.append(top, bar);
    view.append(row);
  }
  view.append(syncBox());
}

function render() {
  slideObserver.disconnect();
  view.replaceChildren();
  view.classList.remove('deck');
  main.classList.remove('today');
  view.scrollTop = 0;
  touched = false;
  combo = 0;
  showCombo();
  segs.replaceChildren();
  if (tab === 'today') renderToday();
  else if (tab === 'saved') renderSaved();
  else renderProgress();
}

document.querySelectorAll('nav button').forEach(b => (b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.setAttribute('aria-selected', x === b));
  tab = b.dataset.tab;
  render();
}));

// Cloud sync (optional): whole state as one JSON row per user in Supabase, merged per key by last change.
// ponytail: last push wins if two devices push in the same instant; fine for one person.
let sb = null, user = null, syncTimer;
function scheduleSync() { clearTimeout(syncTimer); syncTimer = setTimeout(push, 2000); }
async function push() {
  if (!user) return;
  const { error } = await sb.from('progress').upsert({ user_id: user.id, data: state, updated_at: new Date().toISOString() });
  if (error) console.warn('sync push failed', error);
}
async function pull() {
  const { data, error } = await sb.from('progress').select('data').maybeSingle();
  if (error) return console.warn('sync pull failed', error);
  state = merge(state, data?.data);
  persist();
  if (tab === 'today' && !touched) render(); // rebuild today's session with cloud progress (e.g. a new device)
  await push();
}
function syncBox() {
  const box = h('div', 'sync');
  if (!sb) { box.textContent = 'Progress is saved on this device. Add Supabase keys in config.js to sync across devices.'; return box; }
  if (user) {
    box.append(`Syncing as ${user.email}. `);
    const out = h('button', 'link', 'Sign out');
    out.onclick = async () => { await sb.auth.signOut(); render(); };
    box.append(out);
    return box;
  }
  box.append('Sign in to sync progress across devices.');
  const form = h('form');
  const email = h('input');
  Object.assign(email, { type: 'email', required: true, placeholder: 'you@example.com', autocomplete: 'email' });
  email.setAttribute('aria-label', 'Email');
  form.append(email, h('button', null, 'Send link'));
  form.lastChild.type = 'submit';
  form.onsubmit = async e => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithOtp({ email: email.value, options: { emailRedirectTo: location.origin + location.pathname } });
    form.replaceWith(h('div', null, error ? `Couldn’t send: ${error.message}` : 'Check your email for the sign-in link.'));
  };
  box.append(form);
  return box;
}

render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

// Loaded after the first render so a slow or offline CDN never blocks the session.
if (SUPABASE_URL) {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    sb.auth.onAuthStateChange((event, session) => {
      user = session?.user ?? null;
      // setTimeout: supabase-js deadlocks if its own calls run inside this callback
      if (user && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) setTimeout(pull);
      if (tab === 'progress') render();
    });
    document.addEventListener('visibilitychange', () => user && (document.hidden ? push() : pull()));
  } catch (e) { console.warn('sync unavailable (offline?)', e); }
}
