import test from 'ava';

import Grade from '../Grade.ts';

test('_adjustOrderOfMagnitude should divide by power of ten', t => {
  const observed = Grade._adjustOrderOfMagnitude(234.56789, 10);

  t.is(observed, 234.56789E-10);
});

test('_getParts should return parts', t => {
  const observed = Grade._getParts('100.kPa');

  t.deepEqual(observed, {
    significantFigures: 3,
    normalizedMagnitude: 100E6,
    normalizedUnits: 'g*m^-1*s^-2'
  });
});

test('_getParts should return parts for units only', t => {
  const observed = Grade._getParts('kPa');

  t.deepEqual(observed, {
    significantFigures: NaN,
    normalizedMagnitude: NaN,
    normalizedUnits: 'g*m^-1*s^-2'
  });
});

test('_grade should give full credit', t => {
  const gradingProperties = {};
  const observed = new Grade()._grade(gradingProperties, 16, '100. kPa', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [16, '']);
});

test('_grade should give partial credit for missing magnitude', t => {
  const gradingProperties = {
    'missing-magnitude': .75
  };
  const observed = new Grade()._grade(gradingProperties, 16, 'kPa', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [4, 'No magnitude.']);
});

test('_grade should give partial credit for incorrect magnitude', t => {
  const gradingProperties = {
    'incorrect-order-of-magnitude': .3125
  };
  const observed = new Grade()._grade(gradingProperties, 16, '100.Pa', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [11, 'Incorrect order of magnitude.']);
});

test('_grade should give partial credit for too few significant figures', t => {
  const gradingProperties = {
    'too-few-significant-figures': .25
  };
  const observed = new Grade()._grade(gradingProperties, 16, '100kPa', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [12, 'Too few significant figures.']);
});

test('_grade should give partial credit for too many significant figures', t => {
  const gradingProperties = {
    'too-many-significant-figures': .125
  };
  const observed = new Grade()._grade(gradingProperties, 16, '100.000kPa', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [14, 'Too many significant figures.']);
});

test('_grade should give partial credit for close answers', t => {
  const gradingProperties = {
    'order-adjusted-magnitude-off-by-less-than-one-percent': .0625
  };
  const observed = new Grade()._grade(gradingProperties, 16, '99.1kPa', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [15, 'Magnitude close but not exactly correct.']);
});

test('_grade should give partial credit for not-so-close answers', t => {
  const gradingProperties = {
    'order-adjusted-magnitude-off-by-more-than-one-percent': .4375
  };
  const observed = new Grade()._grade(gradingProperties, 16, '90.0kPa', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [9, 'Incorrect order-of-magnitude-adjusted magnitude.']);
});

test('_grade should give partial credit for missing units', t => {
  const gradingProperties = {
    'missing-units': .75
  };
  const observed = new Grade()._grade(gradingProperties, 16, '100.*10^6', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [4, 'No units.']);
});

test('_grade should give partial credit for incorrect units', t => {
  const gradingProperties = {
    'incorrect-units': .1875
  };
  const observed = new Grade()._grade(gradingProperties, 16, '100. kN', '100.*10^6 g*m^-1*s^-2');

  t.deepEqual(observed, [13, 'Incorrect units.']);
});
