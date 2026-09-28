import { review, nextBatch, merge, groupOf, DAY } from './srs.js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const KEY = 'fds.v1';
let state = {}; // card id -> srs state (see srs.js), plus '_settings' and '_day'
try { state = JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch {}
const cards = await (await fetch('cards.json')).json();
const view = document.getElementById('view');
const sheet = document.getElementById('sheet');
const count = document.getElementById('count');
const meter = document.querySelector('#meter i');
let tab = 'today', touched = false; // touched: rated something since the deck was built

// position of each card inside its chapter, e.g. 12/65
const chapterSize = {};
for (const c of cards) c.pos = chapterSize[groupOf(c)] = (chapterSize[groupOf(c)] ?? 0) + 1;

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(id, s) { state[id] = s; persist(); scheduleSync(); }

// Settings and the daily tally live in state so they sync and merge like card state.
const settings = () => ({ order: 'book', off: [], perDay: 15, ...state._settings });
const setSettings = patch => set('_settings', { ...settings(), ...patch, u: Date.now() });
const dateOf = ms => new Date(ms).toLocaleDateString('en-CA'); // YYYY-MM-DD, local time
function day() {
  const d = state._day ?? {};
  return d.date === dateOf(Date.now()) ? d : { streak: d.streak ?? 0, last: d.last, date: dateOf(Date.now()), newCount: 0, reviewCount: 0 };
}
const setDay = patch => set('_day', { ...day(), ...patch, u: Date.now() });
const streak = () => ([dateOf(Date.now()), dateOf(Date.now() - DAY)].includes(day().last) ? day().streak : 0);

function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

const ICONS = {
  again: '<path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5"/>',
  good: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  deep: '<path d="M4 5h16v11H10l-6 4.5z"/>',
  save: '<path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/>',
};
function actionBtn(kind, label) {
  const b = h('button', kind);
  b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[kind]}</svg>`;
  b.append(label);
  b.setAttribute('aria-label', label);
  return b;
}

sheet.onclick = e => e.target === sheet && sheet.close(); // tap the backdrop to close
sheet.querySelector('.close').onclick = () => sheet.close();
function openDeeper(card) {
  sheet.querySelector('h3').textContent = card.title;
  sheet.querySelector('.text').textContent = card.deeper;
  sheet.showModal();
  sheet.querySelector('.text').scrollTop = 0;
}

// onRate(grade, first) is called after a rating is saved; first = the first rating of this card view.
function cardEl({ card, mode }, onRate = () => {}) {
  const before = state[card.id] ?? {}; // ratings apply to the state at render, so switching Again<->Got it doesn't stack
  const el = h('article');
  el.dataset.id = card.id;
  const top = h('div', 'top');
  const avatar = h('div', 'avatar', card.chapter);
  avatar.style.background = `hsl(${(card.chapter * 47) % 360} 65% 42%)`;
  const meta = h('div', 'meta');
  meta.append(h('b', null, card.chapterTitle), h('span', null, `Ch ${card.chapter} · ${card.pos}/${chapterSize[groupOf(card)]} · ${card.section}`));
  top.append(avatar, meta);
  const content = h('div', 'content');

  const actions = h('div', 'actions');
  const [again, good, deep, save] = [
    actionBtn('again', 'Again'), actionBtn('good', 'Got it'), actionBtn('deep', 'Deeper'), actionBtn('save', 'Save'),
  ];
  actions.append(again, good, deep, save);
  save.classList.toggle('on', !!before.saved);

  let rated = false;
  const rate = grade => {
    set(card.id, { ...review(before, grade), saved: state[card.id]?.saved ?? 0 });
    again.classList.toggle('on', grade === 'again');
    good.classList.toggle('on', grade === 'good');
    onRate(grade, !rated);
    rated = true;
  };
  again.onclick = () => rate('again');
  good.onclick = () => rate('good');
  deep.onclick = () => openDeeper(card);
  save.onclick = () => {
    const s = state[card.id] ?? {};
    set(card.id, { ...s, saved: s.saved ? 0 : Date.now(), u: Date.now() });
    save.classList.toggle('on', !!state[card.id].saved);
  };

  if (mode === 'review') {
    content.append(h('span', 'pill', 'Review'), h('h2', null, card.quiz.q));
    const reveal = h('button', 'reveal', 'Show answer');
    actions.classList.add('locked'); // rate only after trying to recall
    reveal.onclick = () => {
      reveal.replaceWith(h('div', 'answer', card.quiz.a), h('div', 'body muted', `${card.title}\n\n${card.body}`));
      actions.classList.remove('locked');
    };
    content.append(reveal);
  } else {
    content.append(h('h2', null, card.title), h('div', 'body', card.body));
  }
  el.append(top, content, actions);
  return el;
}

// Today: one card per screen (CSS scroll-snap), today's due reviews + up to perDay new cards, then a finish line.
const slideObserver = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) onSlide(e.target);
}, { root: view, threshold: 0.6 });

function addSlide(item) { // returns the slide; the caller places it
  const el = cardEl(item, (grade, first) => {
    touched = true;
    if (first) {
      if (item.mode === 'new') setDay({ newCount: day().newCount + 1 });
      else setDay({ reviewCount: day().reviewCount + 1 });
      // Again: see it once more later today, as a quiz, a few cards from now
      if (grade === 'again') {
        let ref = el;
        for (let i = 0; i < 4 && !ref.nextElementSibling.classList.contains('done'); i++) ref = ref.nextElementSibling;
        ref.after(addSlide({ card: item.card, mode: 'review' }));
      }
    }
    setTimeout(() => el.nextElementSibling?.scrollIntoView({ behavior: 'smooth' }), 350);
  });
  el.classList.add('slide');
  slideObserver.observe(el);
  return el;
}

function onSlide(el) {
  const slides = [...view.querySelectorAll('article.slide:not(.done)')];
  const i = slides.indexOf(el);
  const done = el.classList.contains('done');
  count.textContent = slides.length ? `${done ? slides.length : i + 1} / ${slides.length}` : '';
  meter.style.width = `${slides.length ? (100 * (done ? slides.length : i)) / slides.length : 100}%`;
  if (done) finish(el);
}

function finish(el) {
  const d = day(), learned = d.newCount + d.reviewCount;
  if (learned && d.last !== d.date) setDay({ streak: streak() + 1, last: d.date });
  const tomorrow = cards.filter(c => state[c.id]?.due <= Date.now() + DAY).length;
  el.replaceChildren();
  const box = h('div', 'finish');
  box.append(
    h('div', 'flame', `🔥 ${streak()}`),
    h('strong', null, learned ? 'Done for today.' : view.querySelector('article.slide:not(.done)') ? 'Swipe back up and rate a card.' : 'Nothing due right now.'),
    h('p', null, `${d.newCount} new · ${d.reviewCount} reviewed today`),
    h('p', 'muted', `${tomorrow} review${tomorrow === 1 ? '' : 's'} lined up for tomorrow. Close the app, you earned it.`),
  );
  const more = h('button', 'more', '5 more cards');
  more.onclick = () => {
    const shown = new Map([...view.querySelectorAll('article.slide:not(.done)')].map(s => [s.dataset.id, Date.now()]));
    const { order, off } = settings();
    const extra = nextBatch(cards, state, { order, off, maxNew: 5, n: 5, recent: shown });
    if (!extra.length) return more.replaceWith(h('p', 'muted', 'You’ve seen every card in your chapters. Impressive.'));
    const first = extra.map(item => view.insertBefore(addSlide(item), el))[0];
    first.scrollIntoView({ behavior: 'smooth' });
  };
  box.append(more);
  el.append(box);
}

function renderToday() {
  view.classList.add('deck');
  const { order, off, perDay } = settings();
  const items = nextBatch(cards, state, { order, off, maxNew: Math.max(0, perDay - day().newCount) });
  for (const item of items) view.append(addSlide(item));
  const done = h('article', 'slide done');
  view.append(done);
  slideObserver.observe(done);
}

function empty(title, text) {
  const d = h('div', 'empty', text);
  d.prepend(h('strong', null, title));
  return d;
}

function renderSaved() {
  const saved = cards.filter(c => state[c.id]?.saved).sort((a, b) => state[b.id].saved - state[a.id].saved);
  if (!saved.length) return view.append(empty('Save cards for later', 'Tap the bookmark on any card and it lands here.'));
  for (const card of saved) view.append(cardEl({ card, mode: 'new' }));
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
  const now = Date.now();
  const st = c => state[c.id] ?? {};
  const seen = c => !!st(c).due, mastered = c => st(c).ivl >= 21;
  const stats = h('div', 'stats');
  for (const [n, label] of [
    [`${cards.filter(seen).length}/${cards.length}`, 'Learned'],
    [cards.filter(c => st(c).due <= now).length, 'Due now'],
    [cards.filter(mastered).length, 'Mastered'],
    [`🔥 ${streak()}`, 'Day streak'],
  ]) { const d = h('div', null, label); d.prepend(h('b', null, n)); stats.append(d); }
  view.append(stats, syncBox());

  const { order, off, perDay } = settings();
  view.append(
    segmented('New cards a day', [5, 10, 15, 20, 30].map(n => [n, n]), perDay, v => setSettings({ perDay: v })),
    segmented('Order', [['book', 'Book'], ['mix', 'Mix chapters']], order, v => setSettings({ order: v })),
    h('div', 'hint', 'Untick a chapter to drop it (and its reviews) from your sessions.'),
  );

  const groups = Map.groupBy(cards, groupOf);
  for (const [key, list] of groups) {
    const c0 = list[0], s = list.filter(seen).length, m = list.filter(mastered).length;
    const row = h('label', 'chapter');
    row.classList.toggle('off', off.includes(key));
    const top = h('div', 'row');
    const box = h('input');
    box.type = 'checkbox';
    box.checked = !off.includes(key);
    box.onchange = () => {
      setSettings({ off: box.checked ? off.filter(k => k !== key) : [...off, key] });
      render();
    };
    const name = h('div', 'name', `${c0.chapter}. ${c0.chapterTitle}`);
    name.prepend(box);
    top.append(name, h('span', null, `${s}/${list.length} · ${m} mastered`));
    const bar = h('div', 'bar');
    bar.innerHTML = `<i style="width:${(100 * s) / list.length}%"></i><i style="width:${(100 * m) / list.length}%"></i>`;
    row.append(top, bar);
    view.append(row);
  }
}

function render() {
  slideObserver.disconnect();
  view.replaceChildren();
  view.classList.remove('deck');
  view.scrollTop = 0;
  touched = false;
  count.textContent = '';
  meter.parentElement.hidden = tab !== 'today';
  if (tab === 'today') renderToday();
  else if (tab === 'saved') renderSaved();
  else renderProgress();
}

document.querySelectorAll('nav button').forEach(b => (b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.setAttribute('aria-selected', x === b));
  tab = b.dataset.tab;
  render();
}));

// Cloud sync (optional): whole state as one JSON row per user in Supabase, merged per card by last change.
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
  if (tab === 'today' && !touched) render(); // rebuild today's deck with cloud progress (e.g. a new device)
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

// Loaded after the first render so a slow or offline CDN never blocks the feed.
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
