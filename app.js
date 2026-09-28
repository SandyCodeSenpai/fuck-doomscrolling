import { review, nextBatch, merge, groupOf } from './srs.js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const KEY = 'fds.v1';
let state = {}; // card id -> srs state (see srs.js)
try { state = JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch {}
const cards = await (await fetch('cards.json')).json();
const view = document.getElementById('view');
const recent = new Map();
let lastGroup = null, tab = 'feed';

function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function set(id, s) { state[id] = s; persist(); scheduleSync(); }

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

const seenObserver = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const id = e.target.dataset.id;
    if (!state[id]?.due) set(id, review(state[id], 'seen'));
    seenObserver.unobserve(e.target);
  }
}, { threshold: 0.6 });

function cardEl({ card, mode }) {
  const before = state[card.id] ?? {}; // ratings apply to the state at render, so switching Again<->Got it doesn't stack
  const el = h('article');
  el.dataset.id = card.id;
  const avatar = h('div', 'avatar', card.chapter);
  avatar.style.background = `hsl(${(card.chapter * 47) % 360} 65% 42%)`;
  const content = h('div', 'content');
  const meta = h('div', 'meta');
  meta.append(h('b', null, card.topicName), ` · Ch ${card.chapter} · ${card.chapterTitle}`);
  content.append(meta);

  const deeper = h('div', 'deeper', card.deeper);
  deeper.hidden = true;
  const actions = h('div', 'actions');
  const [again, good, deep, save] = [
    actionBtn('again', 'Again'), actionBtn('good', 'Got it'), actionBtn('deep', 'Deeper'), actionBtn('save', 'Save'),
  ];
  actions.append(again, good, deep, save);
  save.classList.toggle('on', !!before.saved);

  const rate = grade => {
    set(card.id, { ...review(before, grade), saved: state[card.id]?.saved ?? 0 });
    again.classList.toggle('on', grade === 'again');
    good.classList.toggle('on', grade === 'good');
  };
  again.onclick = () => rate('again');
  good.onclick = () => rate('good');
  deep.onclick = () => deep.classList.toggle('on', !(deeper.hidden = !deeper.hidden));
  save.onclick = () => {
    const s = state[card.id] ?? {};
    set(card.id, { ...s, saved: s.saved ? 0 : Date.now(), u: Date.now() });
    save.classList.toggle('on', !!state[card.id].saved);
  };

  if (mode === 'review') {
    content.append(h('span', 'pill', 'Review'), h('h2', null, card.quiz.q));
    const reveal = h('button', 'reveal', 'Show answer');
    actions.hidden = true;
    reveal.onclick = () => {
      reveal.replaceWith(h('div', 'answer', card.quiz.a), h('div', 'body', `${card.title}\n\n${card.body}`));
      actions.hidden = false;
    };
    content.append(reveal);
  } else {
    content.append(h('h2', null, card.title), h('div', 'body', card.body));
    seenObserver.observe(el);
  }
  content.append(deeper, h('div', 'section', card.section), actions);
  el.append(avatar, content);
  return el;
}

function empty(title, text) {
  const d = h('div', 'empty', text);
  d.prepend(h('strong', null, title));
  return d;
}

// Feed: infinite scroll, a new batch when the sentinel nears the viewport.
const sentinel = h('div');
const feedObserver = new IntersectionObserver(e => e[0].isIntersecting && appendBatch(), { rootMargin: '1000px' });
function appendBatch() {
  const batch = nextBatch(cards, state, { recent, lastGroup });
  for (const item of batch) {
    recent.set(item.card.id, Date.now());
    view.insertBefore(cardEl(item), sentinel);
  }
  if (batch.length) lastGroup = groupOf(batch.at(-1).card);
  else {
    feedObserver.disconnect();
    sentinel.replaceWith(empty('You’re all caught up.', 'Nothing new or due right now. Go touch grass, reviews will be waiting.'));
  }
}

function renderSaved() {
  const saved = cards.filter(c => state[c.id]?.saved).sort((a, b) => state[b.id].saved - state[a.id].saved);
  if (!saved.length) return view.append(empty('Save cards for later', 'Tap the bookmark on any card and it lands here.'));
  for (const card of saved) view.append(cardEl({ card, mode: 'new' }));
}

function renderProgress() {
  const now = Date.now();
  const st = c => state[c.id] ?? {};
  const seen = c => !!st(c).due, mastered = c => st(c).ivl >= 21;
  const stats = h('div', 'stats');
  for (const [n, label] of [
    [`${cards.filter(seen).length}/${cards.length}`, 'Seen'],
    [cards.filter(c => st(c).due <= now).length, 'Due now'],
    [cards.filter(mastered).length, 'Mastered'],
  ]) { const d = h('div', null, label); d.prepend(h('b', null, n)); stats.append(d); }
  view.append(stats, syncBox());

  const groups = Map.groupBy(cards, groupOf);
  for (const list of groups.values()) {
    const c0 = list[0], s = list.filter(seen).length, m = list.filter(mastered).length;
    const row = h('div', 'chapter');
    const top = h('div', 'row');
    top.append(h('div', null, `${c0.chapter}. ${c0.chapterTitle}`), h('span', null, `${s}/${list.length} · ${m} mastered`));
    const bar = h('div', 'bar');
    bar.innerHTML = `<i style="width:${(100 * s) / list.length}%"></i><i style="width:${(100 * m) / list.length}%"></i>`;
    row.append(top, bar);
    view.append(row);
  }
}

function render() {
  feedObserver.disconnect();
  view.replaceChildren();
  window.scrollTo(0, 0);
  if (tab === 'feed') { view.append(sentinel); feedObserver.observe(sentinel); }
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
if (SUPABASE_URL) {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    sb = createClient(SUPABASE_URL, SUPABASE_KEY);
    sb.auth.onAuthStateChange((event, session) => {
      user = session?.user ?? null;
      // setTimeout: supabase-js deadlocks if its own calls run inside this callback
      if (user && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) setTimeout(pull);
    });
    document.addEventListener('visibilitychange', () => user && (document.hidden ? push() : pull()));
  } catch (e) { console.warn('sync unavailable (offline?)', e); }
}

render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
