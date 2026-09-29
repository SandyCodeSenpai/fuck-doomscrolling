# Chapter 12 house-style rewrite

56 cards rewritten to WRITING_STANDARD v2. Every card keeps its id, chapter, section and array position. No cards added or deleted. `python3 build.py cards/ch12.json` gives 56 cards, 0 problems. The cards also pass the standard's exact limits (the validator allows a few words of slack): body 55-95 words (45-80 with stat or flow), deeper 120-200, takeaway ≤ 15, quiz answer ≤ 40, mcq why ≤ 30, stat value ≤ 7 chars and label ≤ 48, flow steps ≤ 20. None of the banned phrases appear.

Mix: 7 stat cards, 12 predict cards, 5 flow cards. Kinds: 33 concept, 13 story, 5 lens, 3 recap, 2 mistake.
Stories carry `company` always, and `year` only where the chapter states one (Backblaze 2022, Dropbox 2018/2015, Meta f4 2014, Azure 2012, Facebook 2016, 37signals 2025, Uber 2024).

## Average self-scores (1-10, 56 cards)

| Scroll-stop | Pull | Clarity | Memorability | Accuracy |
|---|---|---|---|---|
| 8.21 | 8.14 | 8.86 | 8.20 | 10.00 |

Every card scores at least 8 on every criterion. The lowest-scoring group is the three playbook recap cards (ch12-054/055/056) and the six-factor card (ch12-042). Their bodies are necessarily list-shaped, so pull and clarity sit at 8.

## Proudest three

1. **ch12-026**. Hook: "Haystack never changed its replication scheme, yet its effective replication rose from 3.6× to 5.3×. How?" Title: "How Haystack drifted from 3.6× to 5.3× unchanged". Takeaway: "Empty disk bought for speed is still disk you paid for."
2. **ch12-012**. Hook: "A database's disks can cost less than the network bill for keeping its replicas in sync. How?" Title: "The forgotten line: 3-zone replication traffic". Takeaway: "Disk bills what you keep. Replication bills what you change."
3. **ch12-017**. Hook: "Tiering 2 MB photos pays back in under a month. Tiering 20 KB thumbnails can lose money. Why?" Title: "Tiering tiny objects can cost more than it saves". Takeaway: "Fees per object, savings per byte. Tiny objects lose that race."

## Facts kept from verify/ch12.md

All 15 fixes are preserved:
- Cost per GB, not drive price (003).
- 60 to 100 disks per machine with the same CPU and memory (004).
- Redundancy is "the multiplier design choices swing most", not "the biggest" (005).
- Cross-zone transfer is billed on updates and overwrites (012).
- The $1.27M bill includes the $31,500 replica storage growth line (014).
- "An easy way" (018).
- Transition fees are per object (019).
- "Roughly half ... or less" (020).
- No claim that the Haystack failure drove Tectonic's design (026).
- Right media is in the lever tree, not the playbook (029).
- No dictionary speculation (031).
- The Dropbox hybrid is stated neutrally (039).
- Uber's cost was spread over a broader platform (041).
- The 8 W assumption is named in the title (053).
- Dropbox's SMR work is a case study (055).

## Facts I was unsure about (general knowledge or derived, not stated in the chapter)

- **Derived arithmetic (checked, not in book):**
  - 40% lower server cost per drive at 100 vs 60 disks (004).
  - 1.6× cost at 50% vs 80% full, and about two-thirds higher monthly cost at 3 vs 5 years (007).
  - $36 vs $21 media per usable TB (002 quiz).
  - About $378k/month replica line by month 12 (014 quiz).
  - $300k-$900k to scan 30 PB of Glacier IR. This uses the book's $0.01-$0.03 retrieval range, which the book gives for IA and Glacier IR combined (016 quiz).
  - 100 billion objects in 1 PB of 10 KB files (017 quiz).
  - 5 replicas to survive 4 losses (020 quiz).
  - 500 HDDs at 100 IOPS each (028 quiz; 100 is inside the book's 80-200 range).
  - Cost per user down about 19% (049 quiz).
- **General textbook mechanisms, not detailed in the chapter:**
  - LRC local parity groups (023).
  - Why shingled tracks forbid in-place rewrites (027).
  - HDD IOPS and power set by the motor and arm (025, 053).
  - HDFS NameNode keeping file metadata in memory (049).
  - Drive spin-up delay and tape robots (052).
  - Archival classes taking minutes to hours to restore (015).
  - XOR recovery algebra (022).
  - Committed-use discounts defined as a spending commitment for lower prices (043).
- **Field choices:**
  - ch12-023 uses `company: "Azure"`, because the chapter says "Azure Storage", not Microsoft.
  - ch12-039 uses `year: 2015`, the date of the Magic Pocket migration. The savings figures are for 2016-2017, from the 2018 filing.
- All prices are the book's 2026 list prices or teaching assumptions. As the book warns, cross-zone rates especially should be rechecked before real use.
