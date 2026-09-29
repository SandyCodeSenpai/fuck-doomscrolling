"""Validate cards against WRITING_STANDARD.md and merge into cards.json (what the app loads).
    python3 build.py                  # validate all, write cards.json
    python3 build.py cards/ch05.json  # validate just these files, write nothing
"""
import glob, json, re, sys

CHAPTERS = {
    1: "Storage Foundations", 2: "Distributed File Systems", 3: "Object Storage",
    4: "Block, Local & Kubernetes Storage", 5: "Databases & Storage Engines", 6: "Caching Tiers",
    7: "Lakes, Tiering & Archival", 8: "Scaling Storage", 9: "Operations & Migrations",
    10: "Reliability, Durability & DR", 11: "Compliance, Privacy & Security", 12: "Cost & Efficiency",
    13: "Company by Company", 14: "Thinking Like a Senior Staff Engineer",
}
KINDS = {"concept", "story", "mistake", "lens", "recap"}
words = lambda s: len(re.sub(r"[*`]", "", s).split())


def check(c):
    p = []
    for k in ("id", "chapter", "section", "hook", "title", "body", "takeaway", "kind", "deeper", "quiz", "mcq"):
        if not c.get(k): p.append(f"missing {k}")
    if p: return p
    if len(c["hook"]) > 110: p.append(f"hook {len(c['hook'])} chars")
    if len(c["title"]) > 60: p.append(f"title {len(c['title'])} chars")
    lo, hi = (45, 80) if c.get("stat") or c.get("flow") else (55, 95)
    if not lo - 3 <= words(c["body"]) <= hi + 3: p.append(f"body {words(c['body'])} words (want {lo}-{hi})")
    if c["body"].count("**") % 2 or c["deeper"].count("**") % 2: p.append("unbalanced **")
    if c["body"].count("**") > 6: p.append("more than 3 bold terms in body")
    if words(c["takeaway"]) > 16: p.append(f"takeaway {words(c['takeaway'])} words")
    if c["kind"] not in KINDS: p.append(f"kind {c['kind']!r}")
    if not 110 <= words(c["deeper"]) <= 215: p.append(f"deeper {words(c['deeper'])} words")
    q = c["quiz"]
    if not q.get("q") or not q.get("a") or words(q["a"]) > 42: p.append("quiz q/a")
    m = c["mcq"]
    if not m.get("q") or len(m.get("options", [])) != 4 or len(set(m["options"])) != 4 or not m.get("why"): p.append("mcq shape")
    elif words(m["why"]) > 32: p.append("mcq why too long")
    if (s := c.get("stat")) and (not s.get("value") or len(s["value"]) > 8 or not s.get("label") or len(s["label"]) > 52): p.append("stat shape")
    if (f := c.get("flow")) and (not 2 <= len(f) <= 5 or any(len(x) > 22 for x in f)): p.append("flow shape")
    if (r := c.get("predict")) and (not r.get("q") or not 2 <= len(r.get("options", [])) <= 4): p.append("predict shape")
    return p


paths = sys.argv[1:] or sorted(glob.glob("cards/ch*.json"))
out, problems, ids = [], [], set()
for path in paths:
    for c in json.load(open(path)):
        for msg in check(c): problems.append(f"{path}:{c.get('id')} {msg}")
        if c.get("id") in ids: problems.append(f"{path}:{c['id']} duplicate id")
        ids.add(c.get("id"))
        out.append({**c, "topic": "storage", "topicName": "Storage Infra", "chapterTitle": CHAPTERS[c["chapter"]]})

if not sys.argv[1:]:
    json.dump(out, open("cards.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)} cards, {len(problems)} problems", *problems[:60], sep="\n")
sys.exit(1 if problems else 0)
