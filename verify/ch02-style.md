# Chapter 2 style rewrite

All 71 cards in `cards/ch02.json` are rewritten to Writing standard v2. Every card keeps its id, chapter, section and position in the array, and none were added or removed. `python3 build.py cards/ch02.json` reports 71 cards and 0 problems. Every card also meets the standard's exact limits, not just the ±3 slack `build.py` allows: body words, deeper at 120-200 words, takeaway, quiz answer and mcq `why`.

## Average self-scores (1-10, all 71 cards)

| Criterion | Average |
|---|---|
| Scroll-stop | 8.27 |
| Pull | 8.20 |
| Clarity | 8.85 |
| Memorability | 8.41 |
| Accuracy | 10.00 |

No card scored below 8 on any criterion. Cards that first scored below 8 were revised before saving.

**Mix of card kinds:** 47 concept, 17 story, 3 lens, 2 mistake, 2 recap.

**Optional fields:**
- `stat` on 10 cards, under the 1-in-4 cap.
- `predict` on 15 cards.
- `flow` on 12 cards.
- Analogies on 2 cards: the ViewFs mount table in 031, and "simplicity is a loan" in 019.

The facts fixed in verify/ch02.md are all kept. Some examples:
- 016: the 15-minute wait is attributed to the 2010 paper.
- 026: the base of the recursion is unpublished.
- 029: 3 objects × 200 bytes.
- 037: "roughly the same metadata per file".
- 061: HDFS has custom, non-POSIX interfaces.
- 070: Alluxio is listed with POSIX.

The old 048 guess that Azure chose strong consistency because it served external customers was dropped, because the chapter gives no reason.

## The three cards I'm proudest of

1. **ch02-066**
   - Hook: "Every data block is safe in S3, yet the whole file system is gone. How?"
   - Title: "Safe blocks, lost file system: the metadata trap"
2. **ch02-014**
   - Hook: "Every replica returns the exact same bytes, and the data is still wrong. GFS has a word for that."
   - Title: "Consistent is not defined: GFS's two-word guarantee"
3. **ch02-038**
   - Hook: "Meta's hot-photo store was designed for 3.6 copies of every byte. It ended up paying for far more. Why?"
   - Title: "Haystack paid 5.3× for a 3.6× design"

## Facts I was unsure about

These are all general textbook explanations or derived arithmetic, not statements from ch02.txt. I believe each one is correct.

- **006:** "a namespace change counts only once logged locally and remotely", and the master scanning its in-memory state for background work. Both are standard GFS-paper detail kept from the verified card.
- **011:** the hook says chain replication costs "roughly the time of one copy". That is the pipelining argument. The chapter only says the chain uses every machine's full bandwidth.
- **016:** "such as a reboot" as an example of short unavailability.
- **024:** "L4 cache index servers answer hit or miss" comes from the chapter's diagram labels, not its prose.
- **026:** the cold-start deadlock reasoning, and "each level is far smaller than the one above".
- **028:** the HDFS pipeline forwarding order: writer's node, then the remote rack, then the same remote rack. The chapter implies this but doesn't state it.
- **029:** the "roughly 200× more RAM" in the quiz answer is my own arithmetic from 128 MB blocks.
- **030:** `year` is 2016, when the 500 ms RPC queue peak happened. Uber's report was published in 2018, which is the year card 035 uses.
- **042:** the explanation of random versus fixed copysets. The chapter says only that copysets balance loss risk against reconstruction load.
- **052:** LRC(12,2,2) as two local groups of 6 plus 2 global parities. verify/ch02.md already notes this as correct but unstated.
