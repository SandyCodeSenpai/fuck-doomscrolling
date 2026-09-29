# Chapter 6 style rewrite (Writing standard v2)

Rewrote all 77 cards in `cards/ch06.json`. Kept `id`, `chapter`, `section` and the array order. Added no cards and deleted none. `python3 build.py cards/ch06.json` reports 77 cards and 0 problems. I also checked the stricter standard limits myself: body 55-95 words (45-80 with stat/flow), deeper 120-200 words, hook ≤110 chars, bold lead-ins, banned phrases, and no meta references.

Mix: 46 concept, 24 story, 4 lens (one per Senior staff lens box), 2 mistake (one per Common mistake box), 1 recap (the failure cascade). Optional fields: 9 `stat`, 6 `flow`, 11 `predict`.

All 11 fixes in verify/ch06.md are kept. Gutter's short expiry has no "no invalidations" claim. mcrouter is not said to route traffic to Gutter. TAO "resembles" the integrated-cache trend. CacheLib's rebuilt features stay generic. Segcache's memory savings have no claimed cause. Negative-cache invalidation is a general staleness caveat. CacheFront's 99% hit rate is framed as a best case ("up to"). The sizing math compares 11 servers in total with 10-15 per zone. The 1.1 TB flash fit is conditional ("if... fits").

## Average self-scores (1-10, 77 cards)

| Criterion | Average |
|---|---|
| Scroll-stop | 8.13 |
| Pull | 8.01 |
| Clarity | 8.97 |
| Memorability | 8.27 |
| Accuracy | 10.00 |

Every card scored at least 8 on every criterion and 10 on accuracy after revision. The weakest cards (8 across the board) are the reference-style ones: ch06-011 (four patterns side by side), ch06-032 (Scaling Memcache overview) and ch06-046 (Zipf alpha). Their subject is a survey, not a single mechanism.

## The 3 cards I'm proudest of

1. **ch06-012**
   - Hook: "Every client followed the rules exactly. The cache still holds old data with no expiry in sight. How?"
   - Title: "The stale set: a paused reader poisons the cache"
   - A 3-step flow shows the race. Takeaway: "A delete can only remove what's already there. The stale set arrives after."
2. **ch06-007**
   - Hook: "Two writers update the same row. The database ends up right. The cache ends up wrong for good. How?"
   - Title: "Delete the cache entry on write. Never update it."
   - Takeaway: "Tell the cache to forget, not what to remember."
3. **ch06-071**
   - Hook: "DynamoDB's routers call the backend even when their cache hits. On purpose. Why waste the work?"
   - Title: "DynamoDB keeps its backend busy even on cache hits"
   - Takeaway: "If the backend never relies on the cache, losing the cache is a non-event."

## Facts I was unsure about

- **ch06-054 stat "50 TB" (50 bytes × 1 trillion items):** my own arithmetic. The chapter only says "many terabytes of RAM for trillions of items".
- **ch06-004 "roughly a twentieth of the compute":** also arithmetic (3,000 / 60,000). The chapter doesn't state the ratio.
- **ch06-039, Cold Cluster Warmup hold-off:** I describe the two-second hold-off as blocking sets for a key briefly after its delete in the cold cluster. The chapter only says deletes "carry a two-second hold-off". My reading matches the memcache paper and the previously verified card.
- **ch06-037, why Gutter entries expire quickly:** the reason given ("to keep stale data short-lived") is an inference. The chapter states the fact, not the reason.
- **ch06-062, minority-partition mechanism:** the step-by-step (the minority primary keeps accepting writes, which are discarded after the majority promotes a replica) is textbook Redis Cluster behavior. The chapter only says writes can be lost "on the minority side of a network partition".
- **ch06-066, ISP benefit of Open Connect:** "the ISP no longer has to carry that traffic in from far away" is a general inference. The chapter says only that appliances sit in ISPs for free.
- **ch06-026, "probabilistic" early refresh:** I explain it as only some requests near expiry triggering the refresh. The chapter just says "Early (probabilistic) refresh".
- **ch06-071, company/year "Amazon", 2022:** taken from the chapter's source list (DynamoDB paper, USENIX ATC 2022), not from the body text.
- **ch06-017 / ch06-059, atomic Lua scripts:** that Lua scripts run atomically on the Redis server is general Redis knowledge, not stated in the chapter. It is needed to explain why CacheFront's timestamp check works.
- **Quiz scenario numbers:** these are labelled hypotheticals, used only inside quiz questions, never presented as facts. Examples: "2,000 web servers", "1 in 1,000 slow reads", "50 servers at 50,000 reads/sec".
