// metro-fare-bd — Node unit tests for the fare matrix. Run: node tests/tests.js
'use strict';
const { STATIONS, FARES, fareBetween, passFare, concessionFare, estimateMinutes } = require('../js/fares.js');
let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('  ok:', label); }
  else { fail++; console.error('FAIL:', label, extra !== undefined ? '(' + extra + ')' : ''); }
}
function eq(a, b, label) { ok(a === b, label, 'got ' + a + ', want ' + b); }

// Shape
eq(STATIONS.length, 16, '16 stations');
eq(FARES.length, 16, '16 fare rows');
ok(FARES.every(r => r.length === 16), 'every row has 16 columns');
ok(FARES.every((r, i) => r[i] === 0), 'diagonal is 0 (same station)');
// Symmetry + range
let sym = true, range = true;
for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
  if (FARES[i][j] !== FARES[j][i]) sym = false;
  if (i !== j && (FARES[i][j] < 20 || FARES[i][j] > 100 || FARES[i][j] % 10 !== 0)) range = false;
}
ok(sym, 'matrix symmetric on all 120 pairs');
ok(range, 'all off-diagonal fares are multiples of 10 in 20..100');
// Verified pairs: Uttara North column (mapa-metro / DMTCL table)
const un = [20, 20, 30, 30, 40, 40, 50, 60, 60, 70, 80, 80, 90, 90, 100];
un.forEach((f, k) => eq(fareBetween(0, k + 1), f, 'Uttara North -> ' + STATIONS[k + 1].en + ' = ' + f));
// Verified pairs: Motijheel column
const mj = [100, 90, 90, 80, 70, 60, 60, 50, 50, 40, 30, 30, 20, 20, 20];
mj.forEach((f, k) => eq(fareBetween(15, k), f, 'Motijheel -> ' + STATIONS[k].en + ' = ' + f));
// Verified intermediate pairs (Dhaka Tribune + travellerhimel rows)
eq(fareBetween(8, 15), 50, 'Agargaon -> Motijheel = 50');
eq(fareBetween(8, 14), 40, 'Agargaon -> Secretariat = 40');
eq(fareBetween(8, 10), 20, 'Agargaon -> Farmgate = 20');
eq(fareBetween(5, 15), 60, 'Mirpur 10 -> Motijheel = 60');
eq(fareBetween(5, 14), 60, 'Mirpur 10 -> Secretariat = 60');
eq(fareBetween(5, 10), 30, 'Mirpur 10 -> Farmgate = 30');
eq(fareBetween(5, 12), 50, 'Mirpur 10 -> Shahbag = 50');
eq(fareBetween(1, 8), 50, 'Uttara Center -> Agargaon = 50');
eq(fareBetween(3, 15), 80, 'Pallabi -> Motijheel = 80');
eq(fareBetween(10, 15), 30, 'Farmgate -> Motijheel = 30');
eq(fareBetween(12, 15), 20, 'Shahbag -> Motijheel = 20');
// Discounts
eq(passFare(100), 90, 'pass fare 100 -> 90');
eq(passFare(30), 27, 'pass fare 30 -> 27');
eq(passFare(20), 18, 'pass fare 20 -> 18');
eq(concessionFare(100), 85, 'concession 100 -> 85');
eq(concessionFare(20), 17, 'concession 20 -> 17');
// Travel-time estimate: full route ~33 min (published)
eq(estimateMinutes(0, 15), 33, 'Uttara North -> Motijheel estimate = 33 min');
eq(estimateMinutes(8, 10), 4, 'Agargaon -> Farmgate estimate = 4 min');
eq(estimateMinutes(5, 5), 0, 'same station estimate = 0');
// Station names present in both languages
ok(STATIONS.every(s => s.en && s.bn && s.bn.length >= 2), 'all stations have EN + BN names');
ok(new Set(STATIONS.map(s => s.en)).size === 16, 'station EN names unique');
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
