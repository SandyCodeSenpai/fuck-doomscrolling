# Fuck Doomscrolling

A Twitter-style feed of 60–100 word technical concept cards, scheduled with spaced repetition. Static PWA, no build step.

- **Again / Got it** rate your recall. **Deeper** expands more detail. **Save** bookmarks it.
- The feed rotates across chapters (least-covered first, never the same chapter twice in a row) and slots in due reviews as quiz cards.

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
