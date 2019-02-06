import test from 'ava';

import Properties from '../Properties.ts';

test('_getGradingProperties should handle non-existent range', t => {
  const spreadsheet = {
    getRangeByName: name => {
      return null;
    }
  };

  t.not(Properties._getGradingProperties(spreadsheet), null);
});

test('_getGradingProperties should allow overriding of properties', t => {
  const spreadsheet = {
    getRangeByName: (name) => {
      return {
        getValues: () => {
          return [['too-many-significant-figures', '', 2]];
        }
      }
    }
  };

  t.is(Properties._getGradingProperties(spreadsheet)['too-many-significant-figures'], 2);
});
