# Verify spec (for fact-checking agents)

Inputs: `book/chNN.txt` (source of truth, PDF-extracted; tables may be mangled) and `cards/chNN.json` (cards written from it; format and house style in `WRITING_STANDARD.md`).
Outputs: corrected `cards/chNN.json` + report `verify/chNN.md`.

## Do
1. Read the WHOLE chapter text first, then every card.
2. For every card, check every factual claim in `hook`, `title`, `body`, `stat`, `flow`, `takeaway`, `deeper`, `quiz`, `mcq`, `predict`, `company`/`year` against the chapter.
   Extra checks for the new fields:
   - `mcq.options[0]` and `predict.options[0]` must be the correct answer; every other option must be clearly wrong per the chapter (not arguably right). `mcq.why` must be accurate.
   - `stat.value`/`label` must match a number in the chapter exactly (rounding only if the chapter rounds).
   - The `hook` must be answered truthfully by the body and must not give the answer away; no clickbait.
   - `takeaway` must not overclaim beyond what the chapter supports.
   Check:
   numbers, units, years, company/system names, who did what, mechanisms, cause/effect, comparisons.
   Verdicts:
   - WRONG: contradicts the text (wrong number, wrong company, reversed trade-off, mis-explained mechanism). Fix it.
   - UNSUPPORTED: a specific fact (number, year, company claim, named feature) that the chapter does not state. Remove or replace it with what the chapter says. General, textbook-level explanation of a mechanism is fine if it is correct.
   - MISLEADING: technically from the text but oversimplified so a learner would get the wrong idea, or quiz answer that doesn't actually answer the question. Fix it.
   - Also fix titles that overclaim, and cards that don't stand alone.
3. Coverage: cards were checked for coverage before; don't add cards now. Keep the house style when fixing (WRITING_STANDARD.md).
4. Keep all WRITING_STANDARD rules; validate with `python3 build.py cards/chNN.json` (0 problems).

## Rules for editing the JSON
- NEVER change an existing card's `id` (user progress is keyed by it). Never reuse an id.
- New cards: next unused number (e.g. after ch05-084 comes ch05-085), inserted at their book-order position in the array.
- A card that is a pure duplicate of another may be deleted; say so in the report.
- Edit with a script (load JSON, modify, dump with ensure_ascii=False, indent=2). Keep the file valid.

## Report `verify/chNN.md`
```
# Chapter N verification
Checked: X cards. Correct as-is: A. Fixed: B. Added: C. Deleted: D.
## Fixes
- ch05-012 [WRONG] body said "X"; book says "Y" (section "..."). Fixed.
## Added
- ch05-085 "title" — covers <gap>
## Notes
<anything the user should know, e.g. places where the book itself is ambiguous>
```

Reply with the one "Checked:" summary line only.
