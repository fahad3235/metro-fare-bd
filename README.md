# Metro Fare BD

Offline Dhaka Metro Rail (MRT Line 6) fare calculator — all 16 operating stations from Uttara North to Motijheel. No account, no network, no data collection.

## Features

1. **Fare calculator** — pick From / To stations (with swap), see the single-journey fare, the MRT / Rapid Pass fare (exactly 10% off), and the special-needs fare (15% off with ID). Shows direction, number of stations, the full route strip, estimated travel time, and return-trip cost.
2. **Full fare chart** — the complete 16×16 station-to-station matrix. Search by station name; tap a column header to highlight it.
3. **Pass savings** — enter trips per day and travel days per week to compare weekly single-ticket cost vs pass cost and estimated monthly savings.
4. **Line map** — tap stations to build a trip (first tap = From, second = To).
5. **Bilingual** — English / বাংলা toggle (persisted) with Bengali digits, plus localStorage persistence of your last trip.

## The fare data

Fares follow the DMTCL policy: **5 BDT per km, minimum ৳20, maximum ৳100** per journey. The app ships the full published station-by-station table, cross-checked in October 2026 against three independent published sources:

- The DMTCL fare policy (Financial Express, 2022): 5 BDT/km, min 20, max 100; Uttara North → Motijheel = 100.
- The station-by-station table "in force in October 2026" (mapa-metro): the full Uttara North and Motijheel columns.
- Full per-station rows (travellerhimel) and the Dhaka Tribune Agargaon / Mirpur-10 rows — every overlapping pair agrees with the shipped matrix, and the matrix is symmetric on all 120 pairs (verified by unit tests).

Examples: Uttara North → Motijheel ৳100 · Agargaon → Farmgate ৳20 · Mirpur 10 → Motijheel ৳60 · Shahbag → Motijheel ৳20.

**Kamalapur is excluded**: it is not yet in passenger service. Travel-time estimates use ~2.2 minutes per stop (the published full-route time is ~33 minutes) and are labelled estimates.

## Run locally

Just open `index.html` in any browser. No build step, no dependencies.

## Tests

```sh
node tests/tests.js   # 57 fare-matrix unit tests
node tests/smoke.js   # 17 headless-Chrome (CDP) UI checks
```

## Limitations

- Fares can change; verify against the station fare chart before travelling. This is an unofficial app, not affiliated with DMTCL.
- Travel times are estimates, not live schedules; no live train times are included.
- Kamalapur station is omitted until it opens to passengers.

## Status

Built 2026-10-26 (MUSE Project Factory run, 13:00 slot). Tests: 57/57 unit + 17/17 smoke, 0 console errors.
