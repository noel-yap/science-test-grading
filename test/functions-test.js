import test from 'ava';

import {Functions} from '../Functions';

test('compose should compose', t => {
  const g = (x, y) => x + y;
  const f = n => n * 2;

  const h = Functions.compose(f, g);

  t.is(42, h(19, 2));
});

test('bindLeft should bind', t => {
  const f = (lhs, rhs) => lhs - rhs;

  const g = Functions.bindLeft(f, 8, 5);

  t.is(3, g());
});

test('bindLeft should bind from the left', t => {
  const f = (lhs, rhs) => lhs - rhs;

  const g = Functions.bindLeft(f, 8);

  t.is(3, g(5));
});
