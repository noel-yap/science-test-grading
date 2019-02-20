import test from 'ava';

import {Functions} from '../Functions';

test('compose should compose', t => {
  const g = (x, y) => x + y;
  const f = n => n * 2;

  const h = Functions.compose(f, g);

  t.is(42, h(19, 2));
});
