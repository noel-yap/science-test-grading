import test from 'ava';

var Number = require('../Number.ts');

test('_isNaN should return false', t => {
  t.false(Number._isNaN(5));
});

test('_isNaN should return true', t => {
  t.true(Number._isNaN(NaN));
});

test('_round should round down to nearest hundred', t => {
  t.is(Number._round(5540, 2), 5500);
});

test('_round should round up to nearest hundred', t => {
  t.is(Number._round(5550, 2), 5600);
});

test('_round should round down to nearest hundredth', t => {
  t.is(Number._round(.554, -2), .55);
});

test('_round should round up to nearest hundredth', t => {
  t.is(Number._round(.555, -2), .56);
});
