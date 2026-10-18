# Emergency Reporting: Trade-offs and Known Limits

Owner: Member 2 (Tushar). Scope: `/report`, `POST /api/reports`, data quality, offline queue.

## What we built
- A report form that supports proxy reporting ("someone else") and honest unknowns.
- Server-side validation with one shared Zod schema for client and server.
- Duplicate flagging, raise-only merging, and conflict marking.
- An offline queue that never claims delivery before the server confirms.

## Decisions and why

| Decision | Reason | What we gave up |
|---|---|---|
| Unknown means `null`, never `false` | A missing answer is not the same as "safe" | Needs extra display logic in every screen |
| Full original submission kept in `reports.payload` | We can always audit what was really reported | Slightly larger rows |
| Duplicates are flagged, not merged or deleted | A false merge could hide a real emergency | A coordinator must review flagged reports |
| A later report can only raise severity, never lower it | One careless "all safe" report must not downgrade a real rescue | A genuine improvement in conditions is not reflected automatically |
| Conflicting severity (difference of 2 or more) marks the incident `conflicting` | Disagreement needs a human decision | More items in the review queue |
| Provisional priority score with a capped bonus for unknown fields | Missing data raises caution, but cannot outrank a confirmed emergency | The score is a stand-in until the shared dispatch score is plugged in |
| Original reports are kept even if incident creation fails (`needs_review = true`) | Never lose a report | An orphan report may need manual linking |
| Offline queue says "Saved on this device. NOT delivered yet." | No false promise of help | Reporters must stay aware of the status |
| Retries reuse one idempotency key | A retry must not create a second incident | See limitation 1 |

## Known limitations (honest list)
1. **Idempotency is not atomic.** The server checks the key and then inserts. Two simultaneous requests with the same key could both pass. A unique index on the idempotency key in the database would fix this, but it needs a schema change that we do not own.
2. **Incidents table cannot store "unknown".** `medical_urgent`, `mobility_help` and `people_count` are NOT NULL with defaults. The real unknowns live in `reports.payload`, and the incident stays `unverified` with the unknown fields listed in `details`. Making those columns nullable would be the clean fix.
3. **The offline queue stores the reporter's name and phone in plain text** in the browser until the report is delivered, then deletes them. On a shared device another person could read them while queued.
4. **The rate limiter is in memory.** It resets on server restart and does not work across multiple servers. It also trusts the forwarded IP header, which can be spoofed.
5. **Public intake has no login by design**, so anyone can report in an emergency. That also means someone can submit false reports. We reduce the damage (reports can only raise priority, and everything is flagged `unverified`) but we do not verify identity.
6. **Duplicate rules are assumptions:** within 2 hours, within 50 m, same zone, or same household. They are not tuned on real data, and a report without coordinates cannot be matched by distance.
7. **Reports without coordinates** only have a zone and cannot be placed as a precise map pin. The dashboard needs a "location approximate" display for them.
8. **`possible_duplicate_of` points to the first report** of the matched incident, not the most recent one.
9. **Reports older than 72 hours** are rejected, so an item queued for several days will show "Needs correction".
10. **Synthetic data only.** All zones, households and incidents in this prototype are fictional.

## Privacy choices
- `GET /api/reports` returns 404 in production and removes reporter name and phone from its output.
- The secret database key is used only in server code and is never sent to the browser.
- Reporter contact details are optional.

## What we left out, and why
- Real SMS or WhatsApp intake (needs a gateway, a simulated flow is enough for the demo).
- Photo or voice reports (time).
- Identity verification of reporters (out of scope for 36 hours).
- Machine-learning duplicate detection (a transparent rule is easier to explain and audit).

## What we would do next
- Make the unknown-capable columns nullable and add a unique index for idempotency.
- Replace the provisional score with the shared dispatch priority function.
- Move rate limiting to a shared store, and add per-device and per-number limits.
- Add coordinator tooling to confirm or reject flagged duplicates.