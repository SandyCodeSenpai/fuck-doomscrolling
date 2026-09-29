# Chapter 7 style rewrite

All 58 cards in `cards/ch07.json` were rewritten to WRITING_STANDARD v2. Ids, chapter, sections and array order are unchanged. No cards were added or deleted. `python3 build.py cards/ch07.json` reports 58 cards, 0 problems. Every body and deeper also meets the standard's exact word ranges, without build.py's ±3 tolerance.

Optional fields: `stat` on 9 cards, `flow` on 5, `predict` on 12. Kinds: 34 concept, 18 story, 4 lens, 1 mistake, 1 recap.

## Average self-scores (1-10, n = 58)

| Criterion | Average |
|---|---|
| Scroll-stop | 8.45 |
| Pull | 8.33 |
| Clarity | 8.90 |
| Memorability | 8.50 |
| Accuracy | 10.00 |

No card scored below 8 on any criterion, and every card scored 10 on accuracy. The weakest cards, all at 8, are the comparison and recap cards (019 HDFS vs object store, 029 five lakes, 042 Autoclass/Azure, 052 archive media, 058 recap). They carry table-shaped content that can't be fully turned into a story.

Before saving, these cards were revised:
- They opened with a definition, so they now open with the problem: 014, 027, 034, 039, 044.
- Their lede depended on context: 009 ("HDFS's third problem") and 047 (it opened on "public evidence is limited").
- Hook 031 implied photos moved after a month. They moved after three months, so the hook was fixed.
- Hook 035 said "Inside Google". GCS customers do pick tiers, so it now says "Inside Colossus".

## The 3 cards I'm proudest of

1. **ch07-013**
   - Hook: "One table, 1 TB a day, a flush every 5 minutes. Innocent settings. How many files after a year?"
   - Title: "One streaming table, 52 million files a year"
2. **ch07-047**
   - Hook: "Three replicas protect you from a dead disk. What protects you from your own code deleting the data?"
   - Title: "Gmail 2011: a bug deleted mail, and tape brought it back"
   - Takeaway: "Replication copies your mistakes as faithfully as your data."
3. **ch07-018**
   - Hook: "On HDFS, renaming a directory is instant and all-or-nothing. On S3 the same step can fail halfway. Why?"
   - Title: "Object stores can't rename a directory atomically"

## Facts I was unsure about, or derived

- **RS(9,6) notation (025).** I kept the verify note's reading: 9 data + 6 parity, about 1.67×. The MCQ avoids the other convention (n=9, k=6) as a distractor.
- **Uber's ">1 EB" (022 stat).** The book says "more than 1 exabyte of data across tens of thousands of servers in each of its two regions". "In each region" could modify the servers or the data. The takeaways say "more-than-1-exabyte Hadoop lake", so the stat treats it as a total and puts "each of its two regions" only on servers.
- **Derived numbers.** These are my arithmetic, not stated in the book:
  - 010: "50-fold" slowdown (500 ms / 10 ms).
  - 035: "about 40%" raw-disk saving (2.1 / 3.6).
  - 013 quiz: 36,000 files/day and about 28 MB each.
  - 037 quiz: about $0.0033/GB-month.
  - 007 quiz: about 1,000× more files.
- **Hypothetical numbers in examples.** These are illustrations, not chapter facts: 200 columns (002), 5 of 100 columns (017), 60 IOPS/TB (032), bursts to 50 (033), 64 KB thumbnails (041), 100 units of IO (026).
- **General-knowledge statements added for mechanism.** I believe these are correct, but the chapter doesn't state them:
  - A disk's IOPS are roughly fixed regardless of capacity (032).
  - Any 6 of 9 RS(6,3) chunks rebuild the data (008).
  - Ransomware "typically encrypts or deletes data and demands payment" (055).
  - Buying servers is capex and per-request billing is opex (019).
- **Interpretive claims.** These are reasoned, not stated:
  - Warehouse jobs are "bursty" and blob storage has its own peaks (026).
  - Migrations compete for an archive's limited read throughput (053).
  - Erasure coding without the relaxed building "would save far less power" (049).
- **Year fields on story cards.**
  - 024-026 use 2021, the Tectonic paper year. The HDFS-era events are earlier and undated.
  - 051 uses 2023, the SOSP paper year. The Warner Bros. proof of concept was 2019.
  - 015 uses 2022, when OpenHouse entered production.
  - 020 (Netflix/Iceberg) has no year because the book gives none.
- **S3 prices** are the book's 2026 snapshot and will go out of date.
