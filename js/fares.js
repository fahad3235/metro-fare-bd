// metro-fare-bd \u2014 MRT Line 6 fare data.
// Fare matrix: single-journey ticket fares in BDT between the 16 operating
// MRT Line 6 stations (Uttara North .. Motijheel). Kamalapur is excluded:
// it is not yet in passenger service.
// Sources (cross-checked Oct 2026):
//  - DMTCL fare policy: 5 BDT/km, minimum 20, maximum 100 (Financial Express).
//  - Station-by-station table "in force in October 2026" (mapa-metro).
//  - Full per-station rows (travellerhimel) + Dhaka Tribune Agargaon/Mirpur-10
//    rows, which agree with the matrix on every overlapping pair.
// The matrix is symmetric: fare(A,B) == fare(B,A) on all 120 pairs.
'use strict';
const STATIONS = [
  { en: 'Uttara North', bn: '\u0989\u09a4\u09cd\u09a4\u09b0\u09be \u0989\u09a4\u09cd\u09a4\u09b0' },
  { en: 'Uttara Center', bn: '\u0989\u09a4\u09cd\u09a4\u09b0\u09be \u09b8\u09c7\u09a8\u09cd\u099f\u09be\u09b0' },
  { en: 'Uttara South', bn: '\u0989\u09a4\u09cd\u09a4\u09b0\u09be \u09a6\u0995\u09cd\u09b7\u09bf\u09a3' },
  { en: 'Pallabi', bn: '\u09aa\u09b2\u09cd\u09b2\u09ac\u09c0' },
  { en: 'Mirpur 11', bn: '\u09ae\u09bf\u09b0\u09aa\u09c1\u09b0 \u09e7\u09e7' },
  { en: 'Mirpur 10', bn: '\u09ae\u09bf\u09b0\u09aa\u09c1\u09b0 \u09e7\u09e6' },
  { en: 'Kazipara', bn: '\u0995\u09be\u099c\u09c0\u09aa\u09be\u09a1\u09bc\u09be' },
  { en: 'Shewrapara', bn: '\u09b6\u09c7\u0993\u09a1\u09bc\u09be\u09aa\u09be\u09a1\u09bc\u09be' },
  { en: 'Agargaon', bn: '\u0986\u0997\u09be\u09b0\u0997\u09be\u0981\u0993' },
  { en: 'Bijoy Sarani', bn: '\u09ac\u09bf\u099c\u09af\u09bc \u09b8\u09b0\u09a3\u09bf' },
  { en: 'Farmgate', bn: '\u09ab\u09be\u09b0\u09cd\u09ae\u0997\u09c7\u099f' },
  { en: 'Karwan Bazar', bn: '\u0995\u09be\u09b0\u0993\u09af\u09bc\u09be\u09a8 \u09ac\u09be\u099c\u09be\u09b0' },
  { en: 'Shahbag', bn: '\u09b6\u09be\u09b9\u09ac\u09be\u0997' },
  { en: 'Dhaka University', bn: '\u09a2\u09be\u0995\u09be \u09ac\u09bf\u09b6\u09cd\u09ac\u09ac\u09bf\u09a6\u09cd\u09af\u09be\u09b2\u09af\u09bc' },
  { en: 'Bangladesh Secretariat', bn: '\u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6 \u09b8\u099a\u09bf\u09ac\u09be\u09b2\u09af\u09bc' },
  { en: 'Motijheel', bn: '\u09ae\u09a4\u09bf\u099d\u09bf\u09b2' },
];
// Row i = fares FROM station i TO stations 0..15.
const FARES = [
  [0, 20, 20, 30, 30, 40, 40, 50, 60, 60, 70, 80, 80, 90, 90, 100],
  [20, 0, 20, 20, 30, 30, 40, 40, 50, 60, 60, 70, 80, 80, 90, 90],
  [20, 20, 0, 20, 20, 30, 30, 40, 40, 50, 60, 60, 70, 70, 80, 90],
  [30, 20, 20, 0, 20, 20, 20, 30, 30, 40, 50, 50, 60, 60, 70, 80],
  [30, 30, 20, 20, 0, 20, 20, 20, 30, 40, 40, 50, 50, 60, 70, 70],
  [40, 30, 30, 20, 20, 0, 20, 20, 20, 30, 30, 40, 50, 50, 60, 60],
  [40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30, 40, 40, 50, 50, 60],
  [50, 40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30, 40, 40, 50, 50],
  [60, 50, 40, 30, 30, 20, 20, 20, 0, 20, 20, 20, 30, 30, 40, 50],
  [60, 60, 50, 40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30, 40, 40],
  [70, 60, 60, 50, 40, 30, 30, 20, 20, 20, 0, 20, 20, 20, 30, 30],
  [80, 70, 60, 50, 50, 40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30],
  [80, 80, 70, 60, 50, 50, 40, 40, 30, 20, 20, 20, 0, 20, 20, 20],
  [90, 80, 70, 60, 60, 50, 50, 40, 30, 30, 20, 20, 20, 0, 20, 20],
  [90, 90, 80, 70, 70, 60, 50, 50, 40, 40, 30, 20, 20, 20, 0, 20],
  [100, 90, 90, 80, 70, 60, 60, 50, 50, 40, 30, 30, 20, 20, 20, 0],
];
function fareBetween(a, b) {
  if (a < 0 || a > 15 || b < 0 || b > 15) throw new Error('station index out of range');
  return FARES[a][b];
}
function passFare(single) { return Math.round(single * 0.9); }
function concessionFare(single) { return Math.round(single * 0.85); }
// Full end-to-end ride is published at ~33 minutes for 15 gaps.
function estimateMinutes(a, b) { return Math.round(Math.abs(b - a) * 2.2); }
if (typeof module !== 'undefined') {
  module.exports = { STATIONS, FARES, fareBetween, passFare, concessionFare, estimateMinutes };
}
