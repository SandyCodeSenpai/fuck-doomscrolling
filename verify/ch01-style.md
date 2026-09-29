# Chapter 1 style pass (Writing standard v2)

Rewrote all 65 cards in `cards/ch01.json` to the v2 house style and card contract. Each card keeps its `id`, `chapter` and `section`, and the array order is unchanged. No cards were added or deleted. `python3 build.py cards/ch01.json` reports **65 cards, 0 problems**. A stricter check against the exact standard also passes on every card: body 55-95 words (45-80 with stat/flow), deeper 120-200 words in 2-4 bold-led paragraphs, hook ≤ 110 chars, title ≤ 60, takeaway ≤ 15 words, quiz answer ≤ 40, mcq why ≤ 30, and no banned phrases.

Every card now has hook, title, body, takeaway, kind, deeper, quiz and mcq. Optional fields: stat on 8 cards, flow on 5, predict on 12.
Kinds: concept 48, lens 4, mistake 2, recap 2, story 9. Story cards carry `company`, and `year` only where the chapter gives one.

## Average self-scores (1-10, all 65 cards, after revision)

| Scroll-stop | Pull | Clarity | Memorability | Accuracy |
|---|---|---|---|---|
| 8.2 | 8.2 | 9.0 | 8.3 | 10.0 |

No card finished below 8 on any criterion or below 10 on accuracy. Cards revised during scoring:
- **ch01-032** and **ch01-049**: the bodies read as flat lists. I rewrote them problem-first.
- **ch01-064**: the hook was weak. Rewritten.
- **ch01-004**: the quiz's capacity math didn't add up (four 8 TB drives against one 30 TB drive). Fixed.
- **ch01-053**: cut the implied size of Google's cells.
- **ch01-062**: the deeper section was restructured from 5 paragraphs to 4.

## Accuracy fixes carried in
- **The TBW/DWPD error is fixed in ch01-021 and ch01-022.** Endurance is now framed as flash P/E cycles: at WAF 3, app writes wear the flash 3× faster, so the drive hits its TBW rating early. Both cards had said ratings "count flash writes".
- **Every fix listed in verify/ch01.md is kept.** Examples:
  - 032: block has no namespace, and object gains named keys.
  - 052/002/038: the 15-minute wait is attributed to GFS, based on the Google study.
  - 027: Tectonic is Meta's later shared layer, not a "response" to Haystack.
  - 060: "converged". RS(10,4) is used only for Tectonic blob storage.
  - 013: no Magic Pocket overclaim.
  - 006: fan-out makes a slow device "likely".
  - 047: an optimistic estimate, not a bound.
  - 061: Haystack became IOPS-bound (it didn't "sink").
  - 057: no overclaim about L4.
- **Meta talk removed** ("the chapter's quiz asks…"). "The running example" is now "a billion-user app".

## The 3 cards I'm proudest of
- **ch01-021** — hook: "Your app wrote 1 GB to an SSD. The flash chips inside wrote more. How much more, and why?" — title: "Your app wrote 1 GB. Your SSD wrote 3."
- **ch01-054** — hook: "Your design doc says 'three replicas.' Against one very common event, how many copies do you really have?" — title: "Three replicas in one rack is really one replica"
- **ch01-038** — hook: "A storage node just vanished. Rebuilding its data right away sounds safest. Why did GFS deliberately wait?" — title: "Wait 15 minutes before rebuilding: most outages heal"

## Facts I was unsure about (kept, flagged)
- **ch01-035 / 053, One Zone-IA is single-zone.** This comes from the class name, not the chapter text. verify/ch01.md already flagged it. The claim that "only the multi-zone class stays reachable through a zone outage" is inferred from it.
- **ch01-022, QLC for read-mostly and TLC for write-heavy.** This is textbook reasoning. The chapter only says QLC has lower endurance.
- **ch01-061, LSM turns small writes sequential and suits flash.** Textbook reasoning, checked as correct in verify/ch01.md.
- **ch01-014, "tiny bits are hard to write stably".** A paraphrase of the chapter's "so smaller bits can be written stably".
- **ch01-038, year 2010.** Taken from the chapter's answer key ("Google's 2010 study") and its OSDI 2010 source.
- **ch01-036, Azure 2011 paper title ("…with strong consistency").** From the chapter's Sources list, not the body text.
- **ch01-023, the quiz's 0.99^100 ≈ 37%.** General probability I added. The chapter only says a slow device is "likely".
- **ch01-010 / 016, SSD vs HDD price ratios.** These mix late-2025 consumer NVMe with Backblaze's Nov 2022 HDD figure. The cards say to treat the ratio as rough.
- **ch01-060, "separate clusters each need their own headroom".** Inferred reasoning for the 10× cluster cut. The chapter gives the number, not the cause.
- **ch01-056 / 015, power per TB as a reason tape keeps an archive role.** Reasonable inference. The chapter lists power per TB and tape's zero shelf power separately.
- **ch01-047, the factor of 2 in the durability math.** Reproduced exactly as printed.
- **ch01-064 (road map).** This card has to talk about the rest of the book. I kept the wording about topics ahead and avoided "the chapter says".
