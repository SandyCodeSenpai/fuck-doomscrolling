# Chapter 4 style rewrite (WRITING_STANDARD v2)

I rewrote all 70 cards in the new house style. Every card keeps its id, chapter and section, and the array order is unchanged. No cards were added or deleted. `python3 build.py cards/ch04.json` reports 70 cards and 0 problems. A stricter check against the exact limits in the standard (body, deeper, quiz, mcq and takeaway lengths, banned phrases, bold lead-ins) also passes.

Card mix:
- **Kinds:** 44 concept, 19 story, 3 mistake, 3 lens, 1 recap.
- **Optional fields:** 9 stat (at most 1 in 4), 16 predict (about 1 in 4), 6 flow.
- **Analogies:** 2 (ch04-020 watertight compartments, ch04-051 hotel booking).

## Average self-scores (1-10, 70 cards)

| Criterion | Average | Min |
|---|---|---|
| Scroll-stop | 8.39 | 8 |
| Pull | 8.24 | 8 |
| Clarity | 8.86 | 8 |
| Memorability | 8.47 | 8 |
| Accuracy | 10.0 | 10 |

Any card that scored below 8 was rewritten before it was saved. For example, ch04-029 (Azure disk types) was reworked after it scored 7 on memorability.

## The 3 cards I'm proudest of

1. **ch04-047**
   - Hook: "Your fsync failed, so you retried it. The retry succeeded. In 2018 PostgreSQL learned why that's no comfort."
   - Title: "The fsync retry that reports success on lost data"
2. **ch04-059**
   - Hook: "Your database primary dies on Kubernetes and the StatefulSet reacts. Which replica does it promote?"
   - Title: "A StatefulSet has never heard of your database"
3. **ch04-020**
   - Hook: "Your config store holds a few megabytes and sees little traffic. Why is it the scariest box on the diagram?"
   - Title: "The smallest dependency can have the biggest blast radius"

## Facts I was unsure about

All fixes listed in verify/ch04.md are kept. For example, CSI attach belongs to the controller, and HubSpot's 1,000+ clusters are counted on Vitess and not claimed to all run through the operator.

**Derived numbers.** I worked these out from numbers the chapter gives; the chapter does not state them:
- **ch04-005:** the IOPS/throughput crossover at about 64 KiB, and about 125 MiB/s at 16,000 × 8 KiB.
- **ch04-028:** 1.2 TB/s over 2,500 nodes is about 480 MB/s per node.
- **ch04-037:** 8,000 s ≈ 2.2 h. The chapter gives both figures.

I removed one derived number, "100× more durable" for io2 Block Express (ch04-023). That title now states 99.999% directly.

**Interpretations:**
- **ch04-042:** the title reads Pangu's "P999 under 1 ms" as "99.9% of cloud-disk I/Os under 1 ms".
- **year fields:** ch04-042 uses 2023, the year of the FAST paper; Pangu itself dates from 2009. ch04-016 and ch04-019 use 2020, the NSDI paper. ch04-063 uses 2019, the CNCF case study.
- **ch04-052:** the StorageClass `throughput: "500"` is read as 500 MiB/s. The book gives no unit, as verify/ch04.md notes.

**General textbook knowledge that is correct but not in the chapter:**
- **ch04-053:** ReadWriteOnce is per node, so two pods on one node can both mount the volume.
- **ch04-044:** journaling protects metadata, not necessarily file contents.
- **ch04-016:** a 7-node Paxos majority tolerates 3 failures.
- **ch04-008:** burst volumes drop to baseline when their credits run out.
- **ch04-022:** ordinary transports keep a flow on one path.
- **ch04-065:** a detach waits because the system must be sure the old node has stopped writing.
- **ch04-068:** SMB is common for Windows workloads.

**Story cards without a company or year:**
- **ch04-012:** AWS, no year.
- **ch04-043:** Meta, no year.
- **ch04-044:** Apache Kafka, no year.
- **ch04-031 and ch04-034:** no company. One covers three clouds; the other is open-source Kafka.
- **ch04-062:** company is set to "Rook", which is a CNCF project rather than a company.
