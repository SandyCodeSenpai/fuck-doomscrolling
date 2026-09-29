# Writing standard v2 (house style + card contract)

The reader is a software engineer learning storage infrastructure on their phone instead of Instagram.
Each card must (1) stop the scroll, (2) be effortless to read, (3) leave a correct, explainable picture,
(4) stick for a week. Accuracy beats everything: drama comes from framing, never from invented facts.

## Voice: problem-first storyteller
Every card is a tiny mystery: open a gap, raise the stakes, land the mechanism as the payoff.
- Start with the problem or tension, then the cause, then the clever answer. Never open with a definition.
- Concrete over abstract: a real number, a real company, a real failure. Put the number in the title when there is one.
- Include the one enabling fact that makes the mechanism click (e.g. "flash erases only whole blocks of 128-256 pages").
- Short sentences, active voice, "you" is fine. One idea per sentence. No filler.
- Analogies: at most 1 card in 3, and only if it maps 1:1 onto the real mechanism (say how it maps). Never a mixed metaphor.
- One memorable, quotable line per card (e.g. "You were grading the student with the student's own answer key."),
  preferably in `deeper` or `takeaway`.
- Every card stands alone: no "as we saw", no "the chapter says", no meta talk about the book or quizzes.
- **Banned:** "Here's the thing/trick/how", "Sit with…", "Not theoretical, either", "Say it in an interview:",
  "Picture…/Imagine…" as a default opener, "Let's dive in", "game-changer", exclamation marks, emoji, rhetorical-question chains.

## Accuracy (non-negotiable)
- Every number, year, company, system name, mechanism and cause/effect must be in the chapter text (book/chNN.txt).
  The existing card was fact-checked (see verify/chNN.md) — keep its facts; re-check anything you add.
- General textbook explanation of a mechanism is OK if correct; specific facts are not unless the chapter states them.
- Known error to fix: SSD endurance ratings (TBW/DWPD) are NOT counts of flash writes. Correct framing: endurance is
  really flash P/E cycles; at WAF 3 your writes wear flash 3x faster, so you hit the TBW rating early.
- A hook must be answered truthfully by the body. No clickbait.

## Card contract (JSON). Keep `id`, `chapter`, `section` unchanged; keep array order.
| field | required | rule |
|---|---|---|
| `hook` | yes | ≤ 110 chars. A question or surprising claim the body answers. Must NOT contain the answer. Shown big, before the reveal. |
| `title` | yes | ≤ 60 chars. The claim itself, readable alone ("Your app wrote 1 GB. Your SSD wrote 3."). Use `×` not `x` for multipliers. |
| `body` | yes | 55-95 words (45-80 if `stat` or `flow` present). Problem → cause → answer. First sentence works alone (rendered as the lede). Mark 1-3 key terms with `**term**` at their defining use. `` `x` `` only for literal identifiers (`fsync`, `PUT`). `\n\n` for a paragraph break, max 2 paragraphs. Don't mark numbers (renderer does). |
| `stat` | optional, ≤ 1 card in 4 | `{"value": "576×", "label": "lower data-loss risk from 24× faster repair"}`. value ≤ 7 chars incl. unit, label ≤ 48 chars and makes sense alone. Only when one number IS the point. |
| `flow` | optional | 2-5 steps, each ≤ 20 chars, for real sequences only (write path, pipeline, before→after). Noun phrases: `["Client", "Primary", "Secondaries", "Ack"]`. |
| `takeaway` | yes | ≤ 15 words, quotable rule/aphorism. Not a restatement of the title. Don't repeat it in the body. |
| `kind` | yes | `concept` \| `story` (a real company/system example, "In industry") \| `mistake` ("Common mistake") \| `lens` ("Senior staff lens" / design judgment) \| `recap` (key takeaways, glossary) |
| `company`, `year` | for `story` | e.g. `"Google"`, `2021` — only if the chapter gives them. Omit otherwise. |
| `deeper` | yes | 120-200 words, 2-4 short paragraphs, each opening with a 2-5 word bold lead-in (`**The catch:** …`, `**Why 60 seconds:** …`). Mechanics, numbers, trade-offs, real examples. Use a numbered chain ("1. … 2. …" on separate lines) for a real sequence. Must add beyond the body. |
| `quiz` | yes | `{"q", "a"}`. A scenario to apply or a paradox to resolve ("Two apps write the same volume…"). Answer ≤ 40 words. Never copy the book's own question verbatim. Used for free-recall once a card is mature. |
| `mcq` | yes | `{"q", "options": [4 strings], "why"}`. `options[0]` is correct (app shuffles). Distractors: the chapter's common mistakes, neighbouring concepts, plausible wrong numbers. Parallel length and grammar. No "all/none of the above", no jokes, no true/false. `why` ≤ 30 words explains the right answer. Must differ from `quiz`. |
| `predict` | optional, ~1 card in 4 | `{"q", "options": [3 strings]}`, `options[0]` correct. A guess BEFORE reading, only when the answer is surprising (a number, a winner in a trade-off, a failure cause). If present, it replaces the hook before the reveal, so it must also not give the answer away. |

## Self-scoring (do this for every card before saving)
Score 1-10: **Scroll-stop** (hook), **Pull** (does each sentence make you want the next?), **Clarity** (could a
mid-level engineer explain it correctly after the body alone?), **Memorability** (image, number, quotable line),
**Accuracy** (every fact in the chapter). Rewrite any card scoring < 8 on any criterion, or < 10 on accuracy.

## Example (ch10-026)
```json
{
  "hook": "A CPU core encrypts your data, decrypts it to double-check, gets a perfect match. The data is already ruined. How?",
  "title": "The CPU bug that passed its own test",
  "body": "Engineers assumed a faulty CPU crashes or throws an error. Google's HotOS 2021 paper, Cores that don't count, found **mercurial cores**: cores that silently compute wrong answers, a few per several thousand machines.\n\nThe eeriest case was a deterministic AES mis-computation that was self-inverting. The core made the same mistake encrypting and decrypting, so its own check passed. Only when a different core tried to decrypt did the stored data fail.",
  "takeaway": "Never let a machine grade its own work before an irreversible step.",
  "kind": "story", "company": "Google", "year": 2021,
  "mcq": {"q": "Why did Google's self-inverting AES bug pass its own check?", "options": ["The same core made the same error encrypting and decrypting", "The checksum was computed before encryption", "The key was cached in a different core", "The bug only appeared under high temperature"], "why": "Encrypt and decrypt on the one faulty core cancel out, so a same-core check can't see the corrupted ciphertext."}
}
```
