# Chapter 5 style pass (WRITING_STANDARD v2)

I rewrote all 84 cards in cards/ch05.json. The ids, chapter, section values and array order are unchanged, and no cards were added or removed. `python3 build.py cards/ch05.json` reports 84 cards, 0 problems.

Every card now has the full contract: `hook`, `title`, `kind`, `body`, `takeaway`, `deeper`, `quiz` and `mcq`, with `options[0]` correct. Optional fields:
- `stat` on 13 cards
- `predict` on 19 cards
- `flow` on 7 cards
- `company` on all 29 story cards, and `year` wherever the chapter gives one

Kinds: 41 concept, 29 story, 7 lens, 4 recap, 3 mistake. The 3 mistake cards match the chapter's 3 "Common mistake" boxes.

## Average self-scores (1-10, all 84 cards)

| Scroll-stop | Pull | Clarity | Memorability | Accuracy |
|---|---|---|---|---|
| 8.21 | 8.18 | 8.95 | 8.17 | 10.0 |

No card scores below 8 on any criterion. Cards that scored lower on a first pass were rewritten:
- ch05-005: a rhetorical-question chain was removed.
- ch05-051, 058, 061, 083: hooks were reworded because they implied things the chapter doesn't state (for example, that Instagram "had plenty of capacity").
- ch05-010: the title now says "wasted", the chapter's word, instead of "empty".

The recap cards (026, 079, 083, 084) got 8 for clarity because they are dense by nature.

## The 3 cards I'm proudest of

1. **ch05-016**
   - Hook: "You delete a huge batch of rows from an LSM database, then check disk usage. It doesn't do what you expect."
   - Title: "In an LSM-tree, a delete is just another write"
   - The predict question ("It rises slightly") lands the tombstone idea before the body explains it.
2. **ch05-038**
   - Hook: "During a network split, you add a book on one replica and a lamp on another. What does your cart show?"
   - Title: "Dynamo kept writing through failures, then merged carts"
   - Takeaway: "If you never refuse a write, someday you must merge two truths."
3. **ch05-077**
   - Hook: "Each of your 200 shards is slow only 1% of the time. How often is a query that asks all of them slow?"
   - Title: "Fan out to 200 shards and p99 becomes typical"
   - Stat 87%. Takeaway: "Wait on enough servers, and their worst case becomes your normal."

## Facts I was unsure about

- **Kept the 10 fixes from verify/ch05.md:**
  - 021: no causal claim about Cassandra's size-tiered compaction.
  - 034: commit wait is "set by the uncertainty".
  - 039: DynamoDB is leader-based, with Multi-Paxos per partition.
  - 045: Prime Day gives numbers only, with no mechanism credited. The card says so explicitly.
  - 046: the DynamoDB features "fit the same philosophy".
  - 051: no mechanism is given for the 13-byte per-row overhead.
  - 064: uses Vitess facts only (proxy, vindexes, filtered binlog resharding).
  - 069: large customers created hot shards.
  - 073: began in 2017, 99% by December 2020, not finished.
  - 079: the per-partition list includes Vitess and MySQL+MyRocks.
- **Story `year` choices:**
  - DynamoDB cards (039-043) use 2022, the paper year, although the service launched in 2012.
  - Prime Day uses 2021.
  - MyRocks (051) uses 2017, the year the migration finished. The paper is from 2020.
  - The Meta fragmentation card (010) and Meta's recipe (054) have no year, because the chapter gives none.
  - RocksDB (027) and Cassandra (060) name the company "Facebook", as the chapter does.
- **Derived numbers that are not in the chapter.** These are my own arithmetic, used only in quiz answers:
  - 020: a size multiplier of 4 gives about 33% upper-level overhead.
  - 049: a 1 TB segment takes about 100× longer to repair, roughly 17 minutes.
  - 077: 50 shards gives about 40% (1 − 0.99^50).
  - 071: 64 logical shards per machine.
  - 025 and 004: throughput sums using hypothetical MB/s figures.
- **Hypothetical numbers marked as scenarios.** These don't come from the chapter:
  - The 95% cache hit rate in 046's hook, and the 5% and 190k/10k reads in its deeper text and quiz.
  - The 16 salt buckets in 074.
  - The 400/600 GB disk in 021.
- **General textbook explanations the chapter doesn't spell out.** I believe they are correct and kept them:
  - A binary tree needs about 30 levels for a billion keys (007).
  - Hybrid logical clocks combine a physical clock with a logical counter (066).
  - Lightweight transactions add coordination to Cassandra (059).
  - RocksDB's C++ explicit memory management avoids GC pauses (061).
  - A union merge of carts can bring back a deleted item (038). verify/ch05.md already notes this as correct.
  - Deleting a whole file is far cheaper than rewriting it (022).
- **ch05-040 flow and body:** "the request router authenticates and looks up cached partition metadata" comes from the chapter's DynamoDB diagram labels, not its prose.
