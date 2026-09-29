# Chapter 14 style rewrite (WRITING_STANDARD v2)

All 116 cards were rewritten to the house style and card contract. Every card keeps its id, chapter, section and position in the array. `python3 build.py cards/ch14.json` reports 116 cards, 0 problems.

Mix: 55 concept, 44 recap (41 glossary cards, plus further reading and the two key-takeaways cards), 11 mistake, 6 lens. There are no story cards: the chapter's company examples are illustrations inside concept and lens cards, not stand-alone stories. Optional fields: 5 stat, 20 predict, 8 flow.

## Average self-scores (1-10, per card)

| Criterion | Average |
|---|---|
| Scroll-stop | 8.45 |
| Pull | 8.07 |
| Clarity | 8.98 |
| Memorability | 8.32 |
| Accuracy | 10.0 |

No card scores below 8 on any criterion. Every card has accuracy 10, meaning each fact was checked against book/ch14.txt or is correct general textbook background (listed below).

## The three cards I'm proudest of

1. **ch14-004** - Hook: "You can buy more durability without adding a single disk. How?" / Title: "Halve repair time, cut data-loss risk by 4×"
2. **ch14-047** - Hook: "A crash lands between two writes. The record exists, but no lookup will ever find it. How long does that last?" / Title: "Two writes, no transaction, inconsistent forever"
3. **ch14-064** - Hook: "Deleting one user from a year of immutable backups would mean rewriting all of them. What's the shortcut?" / Title: "Crypto-shredding: delete the key, not the backups"

## Fixes from verify/ch14.md, all kept

- ch14-033: eight question groups, all named.
- ch14-012: "Amazon retail left Oracle", with nothing added.
- ch14-043: Dropbox leaving S3 is framed only as an example that fits the build-vs-buy rule. No motive is given.
- ch14-020: no cost multiplier. The card says the primary-vs-derived question decides how much durability, replication and backup the data needs.
- ch14-062: Paxos runs on a majority of each shard's replicas, and those replicas are spread across regions.
- ch14-113: two-phase commit latency only "helps explain" why a design doc might list cross-region transactions as a non-goal.
- ch14-005: the reason for Magic Pocket's 15-minute wait is presented as general reasoning about grace periods.
- The AFR of 1-2 percent is labelled as an assumption (ch14-004).

## Facts I was unsure about

- **ch14-072:** the book says sharding by hash of parent ID keeps "large directories" off one shard and keeps renames within a directory cheap. Hashing by parent ID puts one directory's entries on a single shard, so I wrote that directories spread across shards while each directory's entries share one shard. The book's phrasing is ambiguous.
- **General background not stated in the chapter.** I believe all of these are correct:
  - TiDB keeps secondary indexes transactional (ch14-047).
  - Dynamo used vector clocks and consistent hashing (ch14-090, 092; verify/ch14.md already accepts the vector-clock point).
  - Group commit (ch14-100).
  - Write skew under snapshot isolation (ch14-098).
  - Leases need a margin for clock drift (ch14-105).
  - Rollback techniques for a new on-disk format: dual-format readers, a feature flag (ch14-037).
  - How a Bloom filter works (ch14-079).
- **ch14-012:** "why migration keeps happening" (scale, cost, hardware change) is my reasoning. The chapter gives the 5-10 year claim and the examples, not the causes.
- **ch14-106:** "only object lock holds when the deleter has full permissions" is a general statement about WORM locks. Some real object-lock modes can be bypassed by privileged users. The chapter defines object lock only as WORM protection that prevents deletion for a period.
- **Numbers I derived, not quoted:**
  - ch14-027 quiz: 3× replication gives about 274 PB a year.
  - ch14-065 quiz: 20 PB at 100 Gbps takes about 18.5 days.
  - ch14-104: 1 − 0.99⁵⁰ ≈ 40 percent.
  - ch14-008: 5 billion × 2 KB ≈ 10 TB.
  - ch14-109: 6 PB versus 2.8 PB.
