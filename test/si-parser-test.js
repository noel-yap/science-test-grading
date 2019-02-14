import test from 'ava';

// TODO: Test all other derived units.

import {SIParser} from '../SIParser.ts';

test('_parseLiteral should succeed', t => {
  const observed = SIParser._parseLiteral('aoeu', 'a');

  t.deepEqual(observed, new SIParser.SuccessResult('a', 'oeu', 'a').withName(observed.name));
});

test('_parseLiteral should fail', t => {
  const observed = SIParser._parseLiteral('snth', 'a');

  t.deepEqual(observed, new SIParser.FailureResult('', 'snth').withName(observed.name));
});

test('_parseLiteral should parse multi-character string', t => {
  const observed = SIParser._parseLiteral('snth', 'sn');

  t.deepEqual(observed, new SIParser.SuccessResult('sn', 'th', 'sn').withName(observed.name));
});

test('_parseLiteral should parse null string', t => {
  const observed = SIParser._parseLiteral('snth', '');

  t.deepEqual(observed, new SIParser.SuccessResult('', 'snth', '').withName(observed.name));
});

test('_parseDigits should fail if no digits to parse', t => {
  const observed = SIParser._parseDigits('aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('', 'aoeu').withName(observed.name));
});

test('_parseDigits should succeed', t => {
  const observed = SIParser._parseDigits('1234aoeu');

  t.deepEqual(observed, new SIParser.SuccessResult('1234', 'aoeu', 1234).withName(observed.name));
});

test('_parseDecimal should fail', t => {
  const observed = SIParser._parseDecimal('aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('', 'aoeu', undefined, observed.previousResult).withName(observed.name));
});

test('_parseDecimal should fail with plus but no decimal', t => {
  const observed = SIParser._parseDecimal('+aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('+', 'aoeu', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseDecimal should succeed with plus followed by decimal', t => {
  const observed = SIParser._parseDecimal('+1234.5678');

  t.deepEqual(observed, new SIParser.SuccessResult('+1234.5678', '', 1234.5678, observed.previousResult).withName(observed.name));
});

test('_parseDecimal should fail with minus but no decimal', t => {
  const observed = SIParser._parseDecimal('-aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('-', 'aoeu', '-', observed.previousResult).withName(observed.name));
});

test('_parseDecimal should succeed with minus followed by decimal', t => {
  const observed = SIParser._parseDecimal('-1234.5678');

  t.deepEqual(observed, new SIParser.SuccessResult('-1234.5678', '', -1234.5678, observed.previousResult).withName(observed.name))
});

test('_parseDecimal should succeed with digits but no dot', t => {
  const observed = SIParser._parseDecimal('1234aoeu');

  t.deepEqual(observed, new SIParser.SuccessResult('1234', 'aoeu', 1234, observed.previousResult).withName(observed.name));
});

test('_parseDecimal should succeed with digits dot digits', t => {
  const observed = SIParser._parseDecimal('1234.5678');

  t.deepEqual(observed, new SIParser.SuccessResult('1234.5678', '', 1234.5678, observed.previousResult).withName(observed.name));
});

test('_parseDecimal should succeed with just dot digits', t => {
  const observed = SIParser._parseDecimal('.1234');

  t.deepEqual(observed, new SIParser.SuccessResult('.1234', '', .1234, observed.previousResult).withName(observed.name));
});

test('_parseDecimal should succeed with digits dot', t => {
  const observed = SIParser._parseDecimal('1234.aoeu');

  t.deepEqual(observed, new SIParser.SuccessResult('1234.', 'aoeu', 1234, observed.previousResult).withName(observed.name));
});

test('_parseExponent should fail', t => {
  const observed = SIParser._parseExponent('aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('', 'aoeu', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseInteger should fail with plus but no integer', t => {
  const observed = SIParser._parseInteger('+aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('+', 'aoeu', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseInteger should succeed with plus followed by integer', t => {
  const observed = SIParser._parseInteger('+1234');

  t.deepEqual(observed, new SIParser.SuccessResult('+1234', '', 1234, observed.previousResult).withName(observed.name));
});

test('_parseInteger should fail with minus but no integer', t => {
  const observed = SIParser._parseInteger('-aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('-', 'aoeu', '-', observed.previousResult).withName(observed.name));
});

test('_parseInteger should succeed with minus followed by integer', t => {
  const observed = SIParser._parseInteger('-1234');

  t.deepEqual(observed, new SIParser.SuccessResult('-1234', '', -1234, observed.previousResult).withName(observed.name));
});


test('_parseInteger should succeed with just digits', t => {
  const observed = SIParser._parseInteger('1234');

  t.deepEqual(observed, new SIParser.SuccessResult('1234', '', 1234).withName(observed.name));
});

test('_parseInteger should fail with empty string', t => {
  const observed = SIParser._parseInteger('');

  t.deepEqual(observed, new SIParser.FailureResult('', '', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseBase should parse grams', t => {
  const observed = SIParser._parseBase('g');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'g',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          g: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse meters', t => {
  const observed = SIParser._parseBase('m');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse seconds', t => {
  const observed = SIParser._parseBase('s');

  t.deepEqual(observed, new SIParser.SuccessResult(
      's',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          s: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse Kelvins', t => {
  const observed = SIParser._parseBase('K');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'K',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          K: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse moles', t => {
  const observed = SIParser._parseBase('mol');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'mol',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          mol: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse amperes', t => {
  const observed = SIParser._parseBase('A');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'A',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          A: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse candelas', t => {
  const observed = SIParser._parseBase('cd');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'cd',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          cd: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse Newtons', t => {
  const observed = SIParser._parseBase('N');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'N',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 3,
          g: 1,
          m: 1,
          s: -2
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse Pascals', t => {
  const observed = SIParser._parseBase('Pa');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Pa',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 3,
          g: 1,
          m: -1,
          s: -2
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse Joulse', t => {
  const observed = SIParser._parseBase('J');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'J',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -2
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse Watts', t => {
  const observed = SIParser._parseBase('W');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'W',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -3
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse percent', t => {
  const observed = SIParser._parseBase('%');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '%',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -2
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse parts-per-million', t => {
  const observed = SIParser._parseBase('ppm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'ppm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -6
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse parts-per-billion', t => {
  const observed = SIParser._parseBase('ppb');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'ppb',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -9
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse parts-per-trillion', t => {
  const observed = SIParser._parseBase('ppt');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'ppt',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -12
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse parts-per-quadrillion', t => {
  const observed = SIParser._parseBase('ppq');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'ppq',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -15
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse Celcius', t => {
  const observed = SIParser._parseBase('°C');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '°C',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          K: 1
        }
      })
      .withName(observed.name));
  t.is(observed.result.conversion(0), 273.15);
});

test('_parseBase should parse yotta', t => {
  const observed = SIParser._parseBase('Ym');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Ym',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 24,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse zetta', t => {
  const observed = SIParser._parseBase('Zm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Zm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 21,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse exa', t => {
  const observed = SIParser._parseBase('Em');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Em',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 18,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse peta', t => {
  const observed = SIParser._parseBase('Pm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Pm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 15,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse tera', t => {
  const observed = SIParser._parseBase('Tm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Tm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 12,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse giga', t => {
  const observed = SIParser._parseBase('Gm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Gm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 9,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse mega', t => {
  const observed = SIParser._parseBase('Mm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'Mm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 6,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse kilo', t => {
  const observed = SIParser._parseBase('km');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'km',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 3,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse hecto', t => {
  const observed = SIParser._parseBase('hm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'hm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 2,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse deca', t => {
  const observed = SIParser._parseBase('dam');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'dam',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 1,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse deci', t => {
  const observed = SIParser._parseBase('dm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'dm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -1,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse centi', t => {
  const observed = SIParser._parseBase('cm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'cm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -2,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse milli', t => {
  const observed = SIParser._parseBase('mm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'mm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -3,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse micro', t => {
  const observed = SIParser._parseBase('μm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'μm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -6,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse nano', t => {
  const observed = SIParser._parseBase('nm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'nm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -9,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse pico', t => {
  const observed = SIParser._parseBase('pm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'pm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -12,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse femto', t => {
  const observed = SIParser._parseBase('fm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'fm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -15,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse atto', t => {
  const observed = SIParser._parseBase('am');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'am',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -18,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse zepto', t => {
  const observed = SIParser._parseBase('zm');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'zm',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -21,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should parse yocto', t => {
  const observed = SIParser._parseBase('ym');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'ym',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: -24,
          m: 1
        }
      })
      .withName(observed.name));
});

test('_parseBase should fail with just prefix', t => {
  const observed = SIParser._parseBase('k');

  t.deepEqual(observed, new SIParser.FailureResult('', 'k').withName(observed.name));
});

test('_parseBase should fail with prefix with °C', t => {
  const observed = SIParser._parseBase('k°C');

  t.deepEqual(observed, new SIParser.FailureResult('', 'k°C').withName(observed.name));
});

test('_parseFactor should succeed with just base', t => {
  const observed = SIParser._parseFactor('s');

  t.deepEqual(observed, new SIParser.SuccessResult(
      's',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          s: 1
        }
      })
      .withName(observed.name));
});

test('_parseFactor should fail with nothing after caret', t => {
  const observed = SIParser._parseFactor('s^');

  t.deepEqual(observed, new SIParser.FailureResult('s^', 's^', '^', observed.previousResult));
});

test('_parseFactor should succeed with both base and exponent', t => {
  const observed = SIParser._parseFactor('s^-2');

  t.deepEqual(observed, new SIParser.SuccessResult('s^-2', '', {
    conversion: observed.result.conversion,
    exponents: {
      10: 0,
      s: -2
    }
  }, observed.previousResult));
});

test('_parseFactor should not have -0 exponents', t => {
  const observed = SIParser._parseFactor('mol^-1');

  t.deepEqual(observed, new SIParser.SuccessResult('mol^-1', '', {
    conversion: observed.result.conversion,
    exponents: {
      10: 0,
      mol: -1
    }
  }, observed.previousResult));
});

test('_parseTerm should parse factor multiplied by factor', t => {
  const observed = SIParser._parseTerm('g*m');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'g*m',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          g: 1,
          m: 1
        }
      },
      observed.previousResult));
});

test('_parseTerm should parse factor divided by factor', t => {
  const observed = SIParser._parseTerm('m/s');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'm/s',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          m: 1,
          s: -1
        }
      },
      observed.previousResult));
});

test('_parseTerm should parse consecutive multiplication operators', t => {
  const observed = SIParser._parseTerm('g*m*s');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'g*m*s',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          g: 1,
          m: 1,
          s: 1
        }
      },
      observed.previousResult));
});

test('_parseTerm should parse consecutive division operators', t => {
  const observed = SIParser._parseTerm('g/m/s');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'g/m/s',
      '', {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          g: 1,
          m: -1,
          s: -1
        }
      },
      observed.previousResult));
});

test('_parseTerm should fail with failed multiplier', t => {
  const observed = SIParser._parseTerm('%*1ppm');

  t.deepEqual(observed, new SIParser.FailureResult('%*', '%*1ppm', observed.result, observed.previousResult));
});

test('_parseTerm should fail with failed divisor', t => {
  const observed = SIParser._parseTerm('%/1ppm');

  t.deepEqual(observed, new SIParser.FailureResult('%/', '%/1ppm', observed.result, observed.previousResult));
});

test('_parseUnits should fail with nothing after open parenthesis', t => {
  const observed = SIParser._parseUnits('(');

  t.deepEqual(observed, new SIParser.FailureResult('(', '(', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseUnits should fail with unbalanced parentheses', t => {
  const observed = SIParser._parseUnits('(A');

  t.deepEqual(observed, new SIParser.FailureResult(
      '(A', '(A', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseUnits should parse parentheses', t => {
  const observed = SIParser._parseUnits('(A)');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '(A)',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          A: 1
        }
      }, observed.previousResult)
      .withName(observed.name));
});

test('_parseUnits should recurse through parentheses', t => {
  const observed = SIParser._parseUnits('((A))');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '((A))',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          A: 1
        }
      }, observed.previousResult)
      .withName(observed.name));
});

test('_parseUnits should parse factor only', t => {
  const observed = SIParser._parseUnits('K');

  t.deepEqual(observed, new SIParser.SuccessResult(
      'K',
      '',
      {
        conversion: observed.result.conversion,
        exponents: {
          10: 0,
          K: 1
        }
      }, observed.previousResult)
      .withName(observed.name));
});

test('_parseMagnitude should succeed wth significand only', t => {
  const observed = SIParser._parseMagnitude('234.567');

  t.deepEqual(observed, new SIParser.SuccessResult('234.567', '', {
    exponent: 0,
    significand: 234.567
  }, observed.previousResult));
});

test('_parseMagnitude should fail with nothing after *10^', t => {
  const observed = SIParser._parseMagnitude('234.567*10^');

  t.deepEqual(observed, new SIParser.FailureResult('234.567*10^', '234.567*10^', observed.result, observed.previousResult));
});

test('_parseMagnitude parse *10^ syntax', t => {
  const observed = SIParser._parseMagnitude('234.567*10^89');

  t.deepEqual(observed, new SIParser.SuccessResult('234.567*10^89', '', {
    exponent: 89,
    significand: 234.567
  }, observed.previousResult));
});

test('_parseMagnitude should fail with nothing after E', t => {
  const observed = SIParser._parseMagnitude('234.567E');

  t.deepEqual(observed, new SIParser.FailureResult('234.567E', '234.567E', observed.result, observed.previousResult));
});

test('_parseMagnitude parse E syntax', t => {
  const observed = SIParser._parseMagnitude('234.567E89');

  t.deepEqual(observed, new SIParser.SuccessResult('234.567E89', '', {
    exponent: 89,
    significand: 234.567
  }, observed.previousResult));
});

test('_parseMagnitude should fail with nothing after e', t => {
  const observed = SIParser._parseMagnitude('234.567e');

  t.deepEqual(observed, new SIParser.FailureResult('234.567e', '234.567e', observed.result, observed.previousResult));
});

test('_parseMagnitude should parse e syntax', t => {
  const observed = SIParser._parseMagnitude('234.567e89');

  t.deepEqual(observed, new SIParser.SuccessResult('234.567e89', '', {
    exponent: 89,
    significand: 234.567
  }, observed.previousResult));
});

test('_parseMagnitude should fail', t => {
  const observed = SIParser._parseMagnitude('aoeu');

  t.deepEqual(observed, new SIParser.FailureResult(
      '', 'aoeu', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseExpression should parse magnitude only', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '6.02214086*10^23',
      '', {
        exponents: {
          10: 23
        },
        magnitude: 6.02214086
      }, observed.previousResult)
      .withName(observed.name));
});

test('_parseExpression should parse magnitude with term', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23mol^-1');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '6.02214086*10^23mol^-1',
      '',
      {
        exponents: {
          10: 23,
          mol: -1
        },
        magnitude: 6.02214086
      },
      observed.previousResult)
      .withName(observed.name));
});

test('_parseExpression should parse magnitude multiplied by term', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23*mol^-1');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '6.02214086*10^23*mol^-1',
      '',
      {
        exponents: {
          10: 23,
          mol: -1
        },
        magnitude: 6.02214086
      },
      observed.previousResult)
      .withName(observed.name));
});

test('_parseExpression should parse magnitude divided by term', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23/mol');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '6.02214086*10^23/mol',
      '',
      {
        exponents: {
          10: 23,
          mol: -1
        },
        magnitude: 6.02214086
      },
      observed.previousResult)
      .withName(observed.name));
});

test('_parseExpression should parse units only', t => {
  const observed = SIParser._parseExpression('mol^-1');

  t.deepEqual(observed, new SIParser.SuccessResult('mol^-1', '', {
    exponents: {
      10: 0,
      mol: -1
    },
    magnitude: NaN
  }, observed.previousResult));
});

test('_parseExpression should fail', t => {
  const observed = SIParser._parseExpression('aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('', 'aoeu', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseExpression should fail with prefix with °C', t => {
  const observed = SIParser._parseExpression('1001k°C');

  t.deepEqual(observed, new SIParser.FailureResult('1001', '1001k°C', observed.result, observed.previousResult).withName(observed.name));
});

test('_parseExpression should do conversion', t => {
  const observed = SIParser._parseExpression('0°C');

  t.deepEqual(observed, new SIParser.SuccessResult(
      '0°C',
      '',
      {
        exponents: {
          10: 0,
          K: 1
        },
        magnitude: 273.15
      },
      observed.previousResult)
      .withName(observed.name));
});

test('_normalizeUnits should throw on non-string input', t => {
  t.throws(() => {
    SIParser._normalizeUnits(1);
  }, Error);
});

test('_normalizeUnits should parse empty string', t => {
  const observed = SIParser._normalizeUnits('');

  t.deepEqual(observed, new SIParser.SuccessResult('', '', {
    magnitude: '',
    units: ''
  }));
});

test('_normalizeUnits should normalize units', t => {
  const observed = SIParser._normalizeUnits('100kPa');

  t.deepEqual(observed, new SIParser.SuccessResult('100kPa', '', {
    magnitude: '100*10^6',
    units: 'g*m^-1*s^-2'
  }));
});

test('_normalizeUnits should fail', t => {
  const observed = SIParser._normalizeUnits('aoeu');

  t.deepEqual(observed, new SIParser.FailureResult('', 'aoeu', observed.result, observed.previousResult).withName(observed.name));
});
