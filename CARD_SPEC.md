# Card spec (for card-writing agents)

Input: `book/chNN.txt` (one chapter of "Storage Infrastructure" handbook, extracted from PDF; tables/diagrams may be mangled — reconstruct meaning carefully).
Output: `cards/chNN.json` — a JSON array of cards, in book order.

## Goal
Turn the WHOLE chapter into bite-sized "pockets": one concept per card, so a reader who reads every card
understands everything in the chapter. Cover every section, every defined term, every "In industry" box
(company + year), every "Common mistake", every "Senior staff lens", key takeaways, and comparison tables.
Skip only the Sources list. Use "Check your understanding" Q&As as quiz material.
Typical chapter => 40-70 cards. Don't merge unrelated ideas to save cards; don't pad either.

## Card shape
```json
{
  "id": "ch01-001",
  "chapter": 1,
  "section": "The storage media hierarchy",
  "title": "NVMe vs SATA: it's the interface, not the flash",
  "body": "60-100 words. Self-contained ...",
  "deeper": "120-220 words ...",
  "quiz": { "q": "Why can NVMe SSDs be driven harder by many cores than SATA SSDs?", "a": "<= 40 words" }
}
```

## Rules
- `title`: <= 70 chars, specific and punchy (like a good tweet hook), not generic ("Introduction").
- `body`: 60-100 words, strict. Must stand alone (define terms it uses, no "as mentioned above").
  Give the clear picture: what it is, how it works, why it matters. Plain text, no markdown. Use \n\n for a paragraph break if needed.
- `deeper`: 120-220 words that ADD detail beyond body: mechanics, numbers, trade-offs, real-company examples
  with years, pitfalls. Don't repeat the body.
- `quiz`: tests understanding (why/how/trade-off), not trivia recall of a number, unless the number is the point.
- Accuracy: only facts from the chapter. Keep numbers, years, and company names exactly as the text says.
  Remove citation markers like [5]. No invented facts.
- Order: book order, so prerequisites come first. ids sequential, zero-padded 3 digits.
- `section`: the chapter section heading the card comes from.

## Finish
Write the file, then validate it:
`python3 -c "import json;c=json.load(open('cards/chNN.json'));b=[x['id'] for x in c if not 55<=len(x['body'].split())<=105];print(len(c),'cards; body out of range:',b)"`
Fix any out-of-range bodies. Reply with only: card count, and any sections you could not cover.
