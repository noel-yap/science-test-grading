import test from 'ava';

var ScientificNotationConversion = require('../ScientificNotationConversion.ts');

test('_sciToNum should convert scientific notatation', t => {
  const result = ScientificNotationConversion._sciToNum('234.567*10^89');

  t.is(result, 234.567E89);
});

test('_numToSci should format number', t => {
  const result = ScientificNotationConversion._numToSci(234.567E89, 5);

  t.is(result, '2.3457*10^91');
});
