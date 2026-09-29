# Chapter 3 style rewrite (WRITING_STANDARD v2)

Rewrote all 67 cards in `cards/ch03.json` to the problem-first house style and the v2 card contract. Every card keeps its `id`, `chapter`, `section` and array position. No cards were added or deleted. `python3 build.py cards/ch03.json` reports 67 cards, 0 problems.

Optional fields used: 11 `stat` (at most 1 in 4), 12 `predict`, 7 `flow`. Kinds: 31 concept, 24 story, 5 lens, 4 recap, 3 mistake (story cards carry `company`, plus `year` when the chapter gives one). Only one card uses an analogy (SMR drives as roof shingles, ch03-059), and the card says how it maps.

## Average self-scores (1-10, all 67 cards)

| Criterion | Average |
|---|---|
| Scroll-stop | 8.3 |
| Pull | 8.2 |
| Clarity | 8.9 |
| Memorability | 8.2 |
| Accuracy | 10.0 |

Before saving, three cards scored below 8 and were revised:
- ch03-002: the hook was generic. It now opens on "a key like photos/cat.jpg carries no region, no permissions, no settings".
- ch03-038 and ch03-065: the bodies read like tables. Each now opens with a framing lede ("Eight classes, three dials…", "Same API, different homes for metadata…"), and 065 got a new hook built on a listing paradox.

## The three cards I'm proudest of

1. **ch03-053** Hook: "Surviving a region loss usually means a full second copy. How did f4 do it for half the extra cost?" Title: "f4's XOR trick: survive a region loss at 2.1×, not 2.8×"
2. **ch03-025** Hook: "A 9+3 erasure code survives any 3 lost shards. Why does it lose data when one of three zones goes down?" Title: "9+3 can't survive losing a zone. 8+4 can."
3. **ch03-020** Hook: "S3's cache holds version 1 of a key. Version 2 was just written. How does the cache find out in time?" Title: "The witness: a tiny in-memory check that ended stale reads"

## Facts I was unsure about, or that go beyond the chapter text

The facts fixed in verify/ch03.md are all kept: 016 still says the checks were maintained by non-experts, 026 has no parity-equivalence claim, 039 says "up to 10×", 041 uses the GA framing, 044 uses the softened Spanner wording, 045 describes stamps as clusters of racks, 048 does not put S3 in the replicate-then-EC arc, and 049's quiz is about seeks rather than capacity.

**Arithmetic I derived from the chapter's numbers (checked, but not stated in the book):**
- ch03-009: 10,000 parts × 5 GiB = 48.8 TiB, which is why the max object size forces large parts.
- ch03-023: at 11 nines, 100 million objects gives about one loss per 1,000 years.
- ch03-053: the hook says "half the extra cost". The extra over one encoded copy is 0.7 for XOR versus 1.4 for a second copy.
- ch03-049: at 4 ops per read and about 120 IOPS, one drive serves about 30 photos/s, against about 120 at 1 op per read. This is illustrative. The chapter gives 120 IOPS as the HDD figure since 2006, and I applied it to Facebook's 2010 drives.
- ch03-054: in the quiz, 20 PB × 1.5 = about 30 PB saved.
- ch03-025 and ch03-064: the quizzes about 10+5 and 17+3 over 3 zones use the chapter's even-spread method.

**Textbook background not in the chapter (judged correct):**
- ch03-043: GFS had a single metadata master. verify/ch03.md already accepted this.
- ch03-059: why shingled tracks can't be rewritten in place (overlap disturbs the neighbouring tracks).
- ch03-061: why K+1 at half parity prevents split-brain (two equal halves could each reach K).
- ch03-062: CRUSH lets clients compute placement.
- ch03-006: don't assume the ETag is an MD5 for every upload type. The chapter only says "often an MD5 for simple uploads".
- ch03-055: the quiz reasons about hash versus range partitioning.

**My own framing or advice, which a reviewer may want to soften:**
- ch03-022: advice item 3, don't chain a bucket-config change with a dependent action.
- ch03-057: the deeper says "owning the storage beats renting it, even after paying a storage team". This is my reading of the chapter's "better unit economics".
- ch03-035: the hot spot moves to a new, unsplit date range every midnight. This is inferred from how S3 partitions by key range.
- ch03-034: a hash-first key breaks listing by date.

**Kind and year choices:**
- ch03-011 is tagged year 2023, the date of Warfield's figures, not 2006 when S3 launched.
- ch03-033 is tagged Google 2025, for the L4 post.
- ch03-049 and ch03-050 use company "Meta" even though the book says "Facebook" for 2010.
- ch03-018 is tagged `concept` rather than `story` because it spans several companies and years.
