# Chapter 9 style rewrite

I rewrote all 76 cards in `cards/ch09.json` to the v2 house style and card contract. Every card keeps its `id`, `chapter` and `section`, and the array order is unchanged. `python3 build.py cards/ch09.json` reports 76 cards and 0 problems.

Optional fields: 9 `stat`, 9 `flow`, 16 `predict`. Kinds: 49 concept, 19 story, 3 mistake, 3 lens, 2 recap. There is one analogy, the engine swapped in a flying plane on ch09-041, which comes from the book.

## Average self-scores (1-10, 76 cards)

| Scroll-stop | Pull | Clarity | Memorability | Accuracy |
|---|---|---|---|---|
| 8.26 | 8.21 | 8.92 | 8.22 | 10.0 |

Every card scored 8 or higher on each criterion and 10 on accuracy. These cards scored lowest (8 on every creative criterion): ch09-001, 030, 039, 064, 068 and 076. They are the intro, the "In industry" box, the comparison table and the key-takeaways recap, and their content is list-shaped by nature. I rewrote their ledes to open on a tension, but they will never hook as hard as a single-mechanism card.

## The 3 cards I'm proudest of

1. **ch09-020**
   - Hook: "Mid-upgrade, half your servers run v2 and half run v1, for days. Then v2 misbehaves. Can you roll back?"
   - Title: "Rolling upgrades: old and new code must read each other"
   - Takeaway: "Storage data outlives the binary that wrote it."
2. **ch09-049**
   - Hook: "Your backfill copies an old snapshot into the new store. How can that erase data newer than the snapshot?"
   - Title: "Step 3: backfill history without clobbering new writes"
   - The deeper section walks through the clobber as a 4-step chain.
3. **ch09-061**
   - Hook: "A query passed CI, then crashed MySQL in production during GitHub's 8.0 upgrade. What kind of query does that?"
   - Title: "GitHub's rollback plan, and the crash CI missed"
   - Takeaway: "A rollback path you haven't exercised is a hope, not a plan."

## Facts I was unsure about, or derived myself

- **Kept the fixes from verify/ch09.md:**
  - 043 says replicas replay changes the primary already committed and ordered. It no longer says "serialized" or "in commit order".
  - 057 gives about seven months from full launch to 90 percent.
  - 059 talks about the p99 tail only.
  - 060 says "offline (non-user-facing)" traffic.
  - 061 says roles arrived in 8.0 and 5.7 has none, and that the WHERE IN queries crashed MySQL in production.
  - 064 gives company-specific rollback examples and notes Uber's one-day switch.
  - 027 no longer claims the config decides which replica is authoritative.
  - 015 no longer calls the study "the standard reference".
- **Year fields chosen from a range the book gives:**
  - GitHub = 2023 (the book says 2022-2023).
  - Dropbox = 2015 (the book says 2013-2015, with full launch in 2015).
  - Meta MyRocks = 2017 (finished).
  - Meta Shard Manager = 2021 (the "In industry" box and SOSP 2021).
  - ch09-030 is a multi-company "In industry" card, so `company` is "AWS, Google, Meta" with no year.
- **Numbers I derived; the book does not state them:**
  - 5 PB of reads to rebuild a 500 TB RS(10,4) server (011; this was also in the original card).
  - About 200 TB of reads for a 20 TB disk (011 quiz).
  - "Roughly tenfold" for 6 days vs 14 hours (010).
  - "A disk every couple of hours" from 13 a day (072 hook).
  - Reed-Solomon needing "10 of 14 fragments" is the standard property of the code; the book only says repair reads 10 fragments.
- **Textbook explanations, not in the book:** These carry over from the original cards and were checked as correct in verify/ch09.md: Ceph marking an OSD down and then out, LRC local parity, how Scientist works, LSM vs B-tree compression, Cassandra GC pauses coming from Java, request coalescing, and derived data meaning something like batch job outputs.
- **Judgment calls that are framing, not facts:**
  - ch09-053 says running reverse writes for weeks "costs money and attention".
  - ch09-059's takeaway says "every week in two systems is exposure".
- **Quiz hypotheticals:** Numbers like 40,000 chunks, 2,000 leaders, db-104 and rack 12 are labelled as scenarios, not presented as real events.
