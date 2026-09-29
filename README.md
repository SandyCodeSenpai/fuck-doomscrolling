# Fuck Doomscrolling

Daily learning sessions that feel like a feed: storage-infrastructure concepts from a handbook, one card per screen, with spaced repetition. Twitter look, static PWA, no build step.

- **Episodes:** 5 new cards (hook → tap to reveal; some ask you to guess first), then a quick multiple-choice check on those 5. Only the check schedules a card. Misses come back a few cards later.
- **Reviews:** multiple choice while a card is young, free recall (Forgot / Knew it) once it's mature. Capped at 40/day; more than that = catch-up day with no new cards.
- **Finish line:** streak (one missed day a week forgiven), week dots, today's haul, "you now know", tomorrow's teaser, max 2 bonus episodes.
- Progress: retention % from real answers, per-chapter mastery, episodes/day, book order vs mix, sound, chapter on/off.

## Files
- `cards/chNN.json` – cards per chapter, written by agents from the book per `WRITING_STANDARD.md` (house style + card contract), fact-checked per `VERIFY_SPEC.md` (reports in `verify/`)
- `build.py` – validates and merges them into `cards.json`, which the app loads
- `srs.js` – scheduler, session builder, streak (`node test.mjs` tests it)
- `app.js`, `index.html`, `sw.js`, `manifest.webmanifest` – the PWA

## Run locally
    python3 build.py && python3 -m http.server 8000   # open http://localhost:8000

## Sync across devices (optional)
1. Create a free project at supabase.com. In the SQL editor, run `supabase.sql`.
2. Authentication → URL Configuration: set Site URL to your GitHub Pages URL.
3. Put the Project URL and anon key in `config.js`, then push.
4. In the app: Progress → enter your email → open the magic link.

## Adding a topic
Drop new `cards/*.json` files and give them a `topic`/`topicName` in `build.py`. The feed rotates across every `topic:chapter` group automatically.

After changing any app file, bump `CACHE` in `sw.js` so installed copies update.
