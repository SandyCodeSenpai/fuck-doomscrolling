# Fuck Doomscrolling

Daily sessions of 60–100 word technical concept cards, one per screen, scheduled with spaced repetition. Twitter look, static PWA, no build step.

- Each day: all due reviews (as quiz cards) + N new cards (Progress → New cards a day), then a finish line with a streak.
- **Again / Got it** rate your recall (only rated cards count as learned). Again brings the card back a few cards later. **Deeper** opens more detail. **Save** bookmarks it.
- New cards come in book order by default (or Mix chapters); untick chapters in Progress to skip them.

## Files
- `cards/chNN.json` – cards per chapter (written by agents from the book, per `CARD_SPEC.md`)
- `build.py` – validates and merges them into `cards.json`, which the app loads
- `srs.js` – scheduler + feed picker (`node test.mjs` tests it)
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
