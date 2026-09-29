# Chapter 11 style rewrite (WRITING_STANDARD v2)

Rewrote all 68 cards in `cards/ch11.json`. Every card keeps its `id`, `chapter`, `section` and position in the array. None were added or removed. `python3 build.py cards/ch11.json` reports 68 cards and 0 problems. Stricter extra checks also passed: body 55-95 words (45-80 with `stat`/`flow`), deeper 120-200 words, every deeper paragraph opens with a bold lead-in, 1-3 bold terms per body, no banned phrases.

Mix: 49 concept, 8 story, 6 lens, 3 mistake, 2 recap. 4 `stat` (003, 007, 059, 063), 12 `predict`, 7 `flow` (013, 020, 027, 041, 050, 060, 065).

## Average self-scores (1-10, n=68)

| Scroll-stop | Pull | Clarity | Memorability | Accuracy |
|---|---|---|---|---|
| 8.65 | 8.44 | 8.93 | 8.75 | 10.0 |

No card scores below 8 on any criterion. The lowest are the list-heavy cards: 017 (India/China), 022 (ISO/FedRAMP), 061 (preventive controls) and the two recaps, 067 and 068. They sit at 8 because their job is to cover a lot of ground, which leaves less room for one sharp hook.

## Proudest 3

1. **ch11-048**. Hook: "One mistaken setting can commit you to paying for a petabyte for ten years. Which setting?" Title: "A 10-year compliance lock on the wrong petabyte"
2. **ch11-029**. Hook: "You rotate your master key every year, right on schedule. A data key leaks. Did rotation just save you?" Title: "Rotating the master key won't save a leaked data key"
3. **ch11-019**. Hook: "The blobs never left Frankfurt. The audit still failed. What leaked?" Title: "Data in Frankfurt, search index and debug logs in Virginia"

## Facts I was unsure about / judgment calls

- **ch11-007**: This card now compares Meta's €1.2B transfer fine with Capital One's $80M OCC fine ("far larger"). I left out any multiple because the two amounts are in different currencies. Per the verify/ch11.md fix, the card gives no reason for Meta's fine.
- **ch11-060**: The title says "100M+ people". The book says about 100M in the US plus about 6M in Canada, so "100M+" is a safe rounding.
- **ch11-026**: Tagged `story` with company AWS and year 2023, even though the card also covers Google Cloud's default encryption. The book gives no year for Google's default.
- **ch11-059**: I used "Deep Root Analytics" (the firm that stored the data) as `company` and 2017 as `year`. UpGuard was the firm that found the exposure.
- **ch11-065**: Tagged `story` with company Meta and no year. The only date is the August 2024 source link, not the chapter text.
- **ch11-041**: Company "Google Cloud", no year. The chapter gives no year for the pipeline.
- **ch11-035**: The chapter only says "CPUs can have silent defects" and points to Chapter 10. I kept it at that and did not name Google's mercurial-cores paper, which is not in ch11.
- **ch11-048**: I avoided a legal ruling on whether Article 17(3) covers mistaken locks, per the verify fix. The card only says a mistaken lock was set for neither of the listed reasons, and that the locked data still can't be deleted until the lock expires.
- Several deeper sections carry general textbook explanations the chapter doesn't spell out. Examples: how truncation, hashing and tokenization differ (012), how delete markers hide the current version (045), why an explicit bypass header makes an override deliberate (046), what remote attestation does (035), and that Parquet delete files don't remove the rewrite cost (037). I believe all are correct, but none are chapter facts.
