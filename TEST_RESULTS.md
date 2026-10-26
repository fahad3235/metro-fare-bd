# Metro Fare BD — Test Results (2026-10-26, 13:00 slot)

## Unit tests — 57/57 passed, 0 failed
`node tests/tests.js` (pure Node, no dependencies)

- Shape: 16 stations, 16×16 matrix, diagonal 0.
- Symmetry: matrix symmetric on all 120 pairs.
- Range: every off-diagonal fare is a multiple of 10 in 20..100.
- Verified pairs (all pass):
  - Full Uttara North column: 20, 20, 30, 30, 40, 40, 50, 60, 60, 70, 80, 80, 90, 90, 100.
  - Full Motijheel column: 100, 90, 90, 80, 70, 60, 60, 50, 50, 40, 30, 30, 20, 20, 20.
  - Intermediates: Agargaon→Motijheel 50, Agargaon→Secretariat 40, Agargaon→Farmgate 20,
    Mirpur 10→Motijheel 60, Mirpur 10→Secretariat 60, Mirpur 10→Farmgate 30, Mirpur 10→Shahbag 50,
    Uttara Center→Agargaon 50, Pallabi→Motijheel 80, Farmgate→Motijheel 30, Shahbag→Motijheel 20.
- Discounts: pass 100→90, 30→27, 20→18; concession 100→85, 20→17.
- Travel-time estimate: full route 33 min; Agargaon→Farmgate 4 min; same station 0.

## Headless-Chrome smoke — 17/17 passed, 0 console/page errors
`node tests/smoke.js` (raw CDP, /opt/meta-chromium/chrome, file://)

- Title, 16+16 station options, default trip Uttara North→Motijheel shows ৳100 / ৳90 / ৳85.
- Agargaon→Farmgate shows ৳20 / ৳18; route strip lists intermediates incl. Bijoy Sarani.
- Swap exchanges From/To; same-station inline error shown.
- Chart tab: header + 16 rows; search "Farmgate" narrows to 1 row + header.
- Pass tab: 2 trips × 5 days × ৳100 → ৳1,000 single / ৳900 pass.
- BN toggle renders Bengali labels and Bengali digits (১০০).
- Line map has 16 stations; 390px viewport has no horizontal overflow.

## Source hygiene
- All sources pure ASCII (Bengali emitted as \uXXXX escapes in JS, numeric entities in HTML);
  `grep -rP '[^\x00-\x7F]'` over js/, index.html, css/ returns nothing.
- Zero network requests by design (no CDN, no fonts, no analytics).
