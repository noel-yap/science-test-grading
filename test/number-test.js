import test from 'ava';

var Number = require('../Number.ts');

test('_isNaN should return false', t => {
    t.false(Number._isNaN(5));
});

test('_isNaN should return true', t => {
    t.true(Number._isNaN(NaN));
});

test('_round should return 5.55', t => {
    t.is(Number._round(5.554, -2), 5.55);
});