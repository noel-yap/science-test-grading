import test from 'ava';

function requireDefaultInterop(module) {
    return module._esModule ? module.default : module;
}

var Number = requireDefaultInterop(require('../Number.ts'));

test('_isNaN should return false', t => {
    t.false(Number._isNaN(5));
});
