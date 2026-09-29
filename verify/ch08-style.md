# Chapter 8 style rewrite (Writing standard v2)

Rewrote all 70 cards in `cards/ch08.json`. Every card kept its id, chapter and section, and the array order is unchanged. None were added or removed. `python3 build.py cards/ch08.json` reports 70 cards, 0 problems. All 16 fixes listed in `verify/ch08.md` are kept: the 63% median, "about 1,000×", "many systems", the CRUSH wording, "thousands of groups", "might be served by over a million disks", "spike sharply", the DynamoDB reactive wording, the ~79% vs ~70% Tectonic note, "reasonable alternatives" for Akkio, and "at least six".

Mix: 38 concept, 23 story, 4 mistake, 3 lens, 2 recap. 10 cards have a `stat` (1 in 7), 16 have a `predict` (about 1 in 4), and 6 have a `flow`. Two cards use an analogy: 031 (insurance) and 067 (two queues).

## Average self-scores (1-10, n = 70)

| Criterion | Average |
|---|---|
| Scroll-stop | 8.54 |
| Pull | 8.53 |
| Clarity | 9.06 |
| Memorability | 8.73 |
| Accuracy | 10.0 |

No card scored below 8 on any criterion. I revised hooks that gave away the answer or ran past 110 characters (006, 048, 049, 052), and I rewrote deeper sections that referred to "the chapter" as meta talk. The weakest cards are the two recaps, 015 and 070, and the pure-definition cards 005, 014, 021, 042 and 058. They sit at 8 because their material is a list, with no single mystery to open.

## Three cards I'm proudest of

1. **ch08-020.** Hook: "Shard managers are famous for surviving crashes. Meta found something else matters far more. What?" Title: "Planned restarts happen about 1,000× more often than crashes"
2. **ch08-065.** Hook: "Each server is slow only 1 time in 100. Why can most of your users still hit the slow path?" Title: "Fan out to 100 servers and 63% of requests are slow"
3. **ch08-034.** Hook: "A DynamoDB table outgrew a partition, so it was split in two. Why did its hottest keys get slower?" Title: "Early DynamoDB: splitting for size also split throughput"

## Facts I was unsure about

- **Tectonic fill level (043, 062):** 1,250 of 1,590 PB is about 79%, but section 8.10.2 of the book says "about 70 percent". The cards give 79% and say it is also described as about 70%. This still needs checking against the FAST 2021 paper.
- **HDFS (004, 042):** The cards say HDFS kept its namespace in one server's memory. Chapter 8 only says HDFS "hit the limit of the metadata service" and points to Chapter 2. The one-server-memory detail is standard textbook knowledge, but it is not stated in this chapter.
- **Tectonic metadata layers (042):** The book says only "name, file, block" layers, each hash-partitioned. What each layer maps is my textbook-level gloss, marked "roughly".
- **Discord and Uber years:** No `year` is set. The body text gives no year for Discord, only the 2023 date on the source blog post. Schemaless is given as a range (2014-2016), which doesn't fit the integer `year` field.
- **Worked examples:** The arithmetic in quizzes and deeper sections is my own and uses hypothetical inputs. Examples: 150 IOPS as the midpoint of 100-200, 5% growth giving about 168 PB, token-bucket admissions, and a 70% order trigger reaching about 83%. The results were checked, but the inputs are not from the book.
- **Hedge sequence (066):** The book's diagram shows the client cancelling the request to Replica A after B answers. The card follows the diagram.
