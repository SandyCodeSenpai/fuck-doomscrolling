# Chapter 13 style rewrite (Writing standard v2)

Rewrote all 85 cards in `cards/ch13.json`. Ids, chapter, section and order are unchanged; no cards were added or removed. `python3 build.py cards/ch13.json` reports 0 problems. Every card also meets the stricter targets in the standard: hook ≤ 110 chars, title ≤ 60, body 55-95 words (45-80 with stat/flow), deeper 120-200, takeaway ≤ 15 words, quiz answer ≤ 40, mcq why ≤ 30.

Mix: 46 story, 16 concept, 13 lens, 7 recap, 3 mistake. 9 cards have a stat, 7 a flow, 7 a predict. Company/year appear only on story cards, and only when the chapter gives them. The fixes in verify/ch13.md are all kept. For example: Spanner/F1 is described as a database-level move, not a "headline" migration (007). Glacier classes are customer-chosen, unlike Colossus's automatic tiering (017). No link is claimed between ElastiCache and DynamoDB (021). The 2020 consistency card has no 2026 request figure (026). Meta open-sources RocksDB rather than "wrote" it (032). Hammerspace is used only for interactive work (040). Venice "ingests" (063). Nothing is said about Microsoft's reasons for acquisitions (046/065). With encryption at rest, the provider's servers can still decrypt (072). No reason is given for Uber's cloud move (053/076).

## Average self-scores (1-10, all 85 cards)

| Criterion | Average |
|---|---|
| Scroll-stop | 8.26 |
| Pull | 8.02 |
| Clarity | 8.96 |
| Memorability | 8.40 |
| Accuracy | 10.00 |

No card scores below 8 on any criterion. The lowest-scoring cards are the recap and "what to steal" cards (075-085): they are summaries by nature, so Pull sits at 8.

## Proudest three

1. **ch13-035**
   - Hook: "Meta's photo store was designed for 3.6 copies' worth of disk per photo. It ended up paying for 5.3. Why?"
   - Title: "Haystack ran out of IOPS, so replication climbed to 5.3×"
2. **ch13-021**
   - Hook: "Prime Day 2024: one AWS service peaked at 146 million requests a second. Another beat it by over 100×. Which?"
   - Title: "Prime Day 2024: DynamoDB at 146M/s, a cache at 1T/min"
   - Note: the units-conversion trap; its predict asks which service peaked highest.
3. **ch13-056**
   - Hook: "Uber's cloud migration had an obvious shortcut: move the data and switch engines in one go. Why skip it?"
   - Title: "Never change storage and engines at the same time"
   - Note: the only analogy in this batch (a controlled experiment), and the deeper section spells out how it maps.

## Facts I was unsure about

Derived numbers that do not appear verbatim in the chapter:
- 021: ElastiCache's peak of about 16 billion requests per second and "roughly 110×" DynamoDB both come from dividing 1 trillion per minute by 60.
- 033: the stat "1.59 EB" is the chapter's 1,590 PB converted. "Roughly four-fifths full" is 1,250 / 1,590.
- 045: "about 30% empty" is inferred from the 70% utilization target.
- 069: "about 14 months" is August 2014 to October 2015.
- 030: the quiz answer (about 97 PB saved) is 65 PB × (3.6 − 2.1).

General textbook explanations that are not in the chapter, all checked as standard knowledge:
- 008: Dremel's tree fan-out.
- 030: Haystack's in-memory index.
- 031: the problems of multi-cluster memcache.
- 032: why an LSM tree compresses better.
- 037: what the Name, File and Block layers hold (marked "in general terms").
- 038: why each RS scheme fits its data.
- 040: why checkpoints use FUSE and flash.
- 043: LRC's local-group mechanics.
- 051: Hudi's key-to-file tracking.
- 054: Raft majority. The quiz assumes the failed zone held 2 of the 5 nodes.
- 061: Iceberg partition evolution.
- 068: dedupe by content hash, and the reason for waiting 15 minutes.

Framing calls to double-check:
- 015 says DynamoDB's Prime Day peak "was retail traffic". This rests on the AWS post being about Amazon's Prime Day event.
- 017 infers from "single-zone" that Express One Zone has less geographic redundancy.
- 028 says the January 2023 default "says nothing about objects written before it". The chapter says only "all new objects".
- 073 calls PingCAP's case study "a vendor source". This rests on the source list, not the prose.
- 075 notes that the table lists EBS as a foundation even though the prose calls it a block service.
