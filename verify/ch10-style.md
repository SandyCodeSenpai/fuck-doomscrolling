# Chapter 10 style rewrite (Writing standard v2)

Rewrote all 66 cards in `cards/ch10.json` to the v2 contract: hook, title, body, takeaway, kind, deeper, quiz and mcq on every card, with stat, flow and predict where they fit. Ids, chapter, section and array order are unchanged. No cards were added or deleted. `python3 build.py cards/ch10.json` reports 66 cards, 0 problems. Every fix listed in verify/ch10.md was kept.

Optional fields: 11 stat (1 in 6), 7 flow, 11 predict. Kinds: 34 concept, 18 story, 9 lens, 3 mistake, 2 recap.

## Average self-scores (1-10, all 66 cards)
| Criterion | Average |
|---|---|
| Scroll-stop | 8.30 |
| Pull | 8.17 |
| Clarity | 9.00 |
| Memorability | 8.79 |
| Accuracy | 10.00 |

No card scored below 8 on any criterion. Every card scored 10 on accuracy.

## Proudest 3
1. **ch10-026** — Hook: "A CPU core encrypts your data, decrypts it to double-check, gets a perfect match. The data is already ruined." Title: "The CPU bug that passed its own test"
2. **ch10-032** — Hook: "At 10:00 someone deletes a table. You have three replicas and a 04:00 backup. Which still have the data?" Title: "Replication copies your mistakes. Backups undo them."
3. **ch10-058** — Hook: "GitLab had database replication, disk snapshots and backups to S3. How much of it worked on the day?" Title: "GitLab 2017: five backups, zero working"

## Facts I was unsure about
- **Numbers I calculated (not stated in the book, but they follow from its figures):** 2.5M-hour MTTF ≈ 0.35% AFR (003). 1M drives at 1.4% ≈ 38 failures/day (005 quiz). 2 TB rebuild under 3 h, so the 12× longer window means about 144× the risk (010). Plain sharding 4×2 means a poison customer takes out ~25% of customers (054). Chaos Kong quiz: 70% load across 3 regions means 105% on each survivor (050). Halving λ cuts loss 8× and halving T cuts it 4× (007 quiz). A 4-hour p99 against a 1-hour claim is 16× less durable (018 quiz). All of these follow from the book's formula or plain arithmetic.
- **General knowledge the book doesn't state (kept from the earlier fact-checked cards):** TCP 16-bit checksum misses ~1 in 65,536 random errors (020). CRC32C has hardware support (021). The pilot-light furnace origin of the name (041). Fencing/split-brain wording for region ownership transfer (051). "Many customers fail over at once, so provisioning APIs overload" (044). This last one is an inference; the book only says control planes are less available and may break in the same disaster.
- **ch10-038 title "3-2-1 became 3-2-1-1-0":** the digit string is my own shorthand. The book says teams add "1 immutable copy, 0 unverified restores."
- **ch10-016 (Google 2015 lightning):** I kept to the book's "volatile cache during power loss" and "persistent write path". I did not claim writes had been acknowledged while still in cache.
- **Story years:** 030 uses 2015, the year of the CACM paper (TLA+ has been used since 2011). 049 uses 2018, the Maelstrom paper (Storm talks were around 2016). 048 uses 2012, the ACM Queue article. 062's company field is "Google Cloud" and 063's is "UniSuper".
- **ch10-026 hook:** the example in the standard is 114 characters, over the 110 limit. I dropped the trailing "How?" so the hook now ends on the surprising claim.
