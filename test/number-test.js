import test from 'ava';

import Number from '../Number.ts';

test('_isNaN should return false', t => {
  t.false(Number._isNaN(5));
});

test('_isNaN should return true', t => {
  t.true(Number._isNaN(NaN));
});

test('_orderOfMagnitude should round up to 2', t => {
    const observed = Number._orderOfMagnitude(50);

    t.is(observed, 2);
});

test('_orderOfMagnitude should round up to 3', t => {
    const observed = Number._orderOfMagnitude(499);

    t.is(observed, 3);
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

test('_numberOfSignificantFigures should work with decimal', t => {
  const observed = Number._numberOfSignificantFigures('.90');

  t.is(observed, 2);
});

test('_numberOfSignificantFigures should ignore leading zeroes', t => {
  const observed = Number._numberOfSignificantFigures('0123');

  t.is(observed, 3);
});

test('_numberOfSignificantFigures should include all digits up to decimal', t => {
  const observed = Number._numberOfSignificantFigures('100.');

  t.is(observed, 3);
});

test('_numberOfSignificantFigures should be 3', t => {
  const observed = Number._numberOfSignificantFigures('99.9');

  t.is(observed, 3);
});
