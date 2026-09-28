"""Validate cards/*.json and merge into cards.json (what the app loads). Run: python3 build.py"""
import glob, json, sys

CHAPTERS = {
    1: "Storage Foundations", 2: "Distributed File Systems", 3: "Object Storage",
    4: "Block, Local & Kubernetes Storage", 5: "Databases & Storage Engines", 6: "Caching Tiers",
    7: "Lakes, Tiering & Archival", 8: "Scaling Storage", 9: "Operations & Migrations",
    10: "Reliability, Durability & DR", 11: "Compliance, Privacy & Security", 12: "Cost & Efficiency",
    13: "Company by Company", 14: "Thinking Like a Senior Staff Engineer",
}

out, problems, ids = [], [], set()
for path in sorted(glob.glob("cards/ch*.json")):
    for c in json.load(open(path)):
        where = f"{path}:{c.get('id')}"
        missing = [k for k in ("id", "chapter", "section", "title", "body", "deeper", "quiz") if not c.get(k)]
        if missing or not c["quiz"].get("q") or not c["quiz"].get("a"):
            problems.append(f"{where} missing {missing or 'quiz q/a'}"); continue
        if c["id"] in ids: problems.append(f"{where} duplicate id")
        ids.add(c["id"])
        words = len(c["body"].split())
        if not 50 <= words <= 110: problems.append(f"{where} body {words} words")
        out.append({**c, "topic": "storage", "topicName": "Storage Infra", "chapterTitle": CHAPTERS[c["chapter"]]})

json.dump(out, open("cards.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)} cards", *problems, sep="\n")
sys.exit(1 if problems else 0)
