import test from 'ava';

import {ScientificNotation} from '../ScientificNotation';

test('_sciToNum should convert scientific notatation', t => {
  const observed = ScientificNotation._sciToNum('234.567*10^89');

  t.is(observed, 234.567E89);
});

test('_numToSci should format number', t => {
  const observed = ScientificNotation._numToSci(234.567E89, 5);

  t.is(observed, '2.3457*10^91');
});
