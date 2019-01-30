import test from 'ava';

// TODO: Test all other derived units.

var SIParser = require('../SIParser.ts');

test('_parseChar should succeed', t => {
  const observed = SIParser._parseChar('aoeu', 'a');

  t.deepEqual(observed, {
    consumed: 'a',
    rest: 'oeu',
    success: true
  });
});

test('_parseChar should fail', t => {
  const observed = SIParser._parseChar('snth', 'a');

  t.deepEqual(observed, {
    consumed: '',
    rest: 'snth',
    success: false
  });
});

test('_parseDigits should fail if no digits to parse', t => {
  const observed = SIParser._parseDigits('aoeu');

  t.deepEqual(observed, {
    consumed: '',
    rest: 'aoeu',
    success: false
  });
});

test('_parseDigits should succeed', t => {
  const observed = SIParser._parseDigits('1234aoeu');

  t.deepEqual(observed, {
    consumed: '1234',
    rest: 'aoeu',
    result: 1234,
    success: true
  });
});

test('_parseDotDigits should fail if not starting with dot', t => {
  const observed = SIParser._parseDotDigits('1234');

  t.deepEqual(observed, {
    consumed: '',
    rest: '1234',
    success: false
  });
});

test('_parseDotDigits should observed in NaN if no digits after dot', t => {
  const observed = SIParser._parseDotDigits('.aoeu');

  t.deepEqual(observed, {
    consumed: '.',
    rest: 'aoeu',
    result: NaN,
    success: true
  });
});

test('_parseDecimal should fail', t => {
  const observed = SIParser._parseDecimal('aoeu');

  t.deepEqual(observed, {
    consumed: '',
    rest: 'aoeu',
    success: false
  });
});

test('_parseDecimal should fail with plus but no decimal', t => {
  const observed = SIParser._parseDecimal('+aoeu');

  t.deepEqual(observed, {
    consumed: '+',
    rest: '+aoeu',
    success: false
  })
});

test('_parseDecimal should succeed with plus followed by decimal', t => {
  const observed = SIParser._parseDecimal('+1234.5678');

  t.deepEqual(observed, {
    consumed: '+1234.5678',
    rest: '',
    result: 1234.5678,
    success: true
  });
});

test('_parseDecimal should fail with minus but no decimal', t => {
  const observed = SIParser._parseDecimal('-aoeu');

  t.deepEqual(observed, {
    consumed: '-',
    rest: '-aoeu',
    success: false
  })
});

test('_parseDecimal should succeed with minus followed by decimal', t => {
  const observed = SIParser._parseDecimal('-1234.5678');

  t.deepEqual(observed, {
    consumed: '-1234.5678',
    rest: '',
    result: -1234.5678,
    success: true
  })
})

test('_parseDecimal should succeed with digits but no dot', t => {
  const observed = SIParser._parseDecimal('1234aoeu');

  t.deepEqual(observed, {
    consumed: '1234',
    rest: 'aoeu',
    result: 1234,
    success: true
  });
});

test('_parseDecimal should succeed with digits dot digits', t => {
  const observed = SIParser._parseDecimal('1234.5678');

  t.deepEqual(observed, {
    consumed: '1234.5678',
    rest: '',
    result: 1234.5678,
    success: true
  })
});

test('_parseDecimal should succeed with just dot digits', t => {
  const observed = SIParser._parseDecimal('.1234');

  t.deepEqual(observed, {
    consumed: '.1234',
    rest: '',
    result: .1234,
    success: true
  });
});

test('_parseDecimal should succeed with digits dot', t => {
  const observed = SIParser._parseDecimal('1234.aoeu');

  t.deepEqual(observed, {
    consumed: '1234.',
    rest: 'aoeu',
    result: 1234,
    success: true
  });
});

test('_parseInteger should fail with plus but no integer', t => {
  const observed = SIParser._parseInteger('+aoeu');

  t.deepEqual(observed, {
    consumed: '+',
    rest: '+aoeu',
    success: false
  });
});

test('_parseInteger should succeed with plus followed by integer', t => {
  const observed = SIParser._parseInteger('+1234');

  t.deepEqual(observed, {
    consumed: '+1234',
    rest: '',
    result: 1234,
    success: true
  });
});

test('_parseInteger should fail with minus but no integer', t => {
  const observed = SIParser._parseInteger('-aoeu');

  t.deepEqual(observed, {
    consumed: '-',
    rest: '-aoeu',
    success: false
  });
});

test('_parseInteger should succeed with minus followed by integer', t => {
  const observed = SIParser._parseInteger('-1234');

  t.deepEqual(observed, {
    consumed: '-1234',
    rest: '',
    result: -1234,
    success: true
  });
});


test('_parseInteger should succeed with just digits', t => {
  const observed = SIParser._parseInteger('1234');

  t.deepEqual(observed, {
    consumed: '1234',
    rest: '',
    result: 1234,
    success: true
  })
});

test('_parseBase should parse grams', t => {
  const observed = SIParser._parseBase('g');

  t.deepEqual(observed, {
    consumed: 'g',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        g: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse meters', t => {
  const observed = SIParser._parseBase('m');

  t.deepEqual(observed, {
    consumed: 'm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse seconds', t => {
  const observed = SIParser._parseBase('s');

  t.deepEqual(observed, {
    consumed: 's',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        s: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse Kelvins', t => {
  const observed = SIParser._parseBase('K');

  t.deepEqual(observed, {
    consumed: 'K',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        K: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse moles', t => {
  const observed = SIParser._parseBase('mol');

  t.deepEqual(observed, {
    consumed: 'mol',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        mol: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse amperes', t => {
  const observed = SIParser._parseBase('A');

  t.deepEqual(observed, {
    consumed: 'A',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        A: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse candelas', t => {
  const observed = SIParser._parseBase('cd');

  t.deepEqual(observed, {
    consumed: 'cd',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        cd: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse Newtons', t => {
  const observed = SIParser._parseBase('N');

  t.deepEqual(observed, {
    consumed: 'N',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 3,
        g: 1,
        m: 1,
        s: -2
      }
    },
    success: true
  });
});

test('_parseBase should parse Pascals', t => {
  const observed = SIParser._parseBase('Pa');

  t.deepEqual(observed, {
    consumed: 'Pa',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 3,
        g: 1,
        m: -1,
        s: -2
      }
    },
    success: true
  });
});

test('_parseBase should parse Joulse', t => {
  const observed = SIParser._parseBase('J');

  t.deepEqual(observed, {
    consumed: 'J',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 3,
        g: 1,
        m: 2,
        s: -2
      }
    },
    success: true
  });
});

test('_parseBase should parse Watts', t => {
  const observed = SIParser._parseBase('W');

  t.deepEqual(observed, {
    consumed: 'W',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 3,
        g: 1,
        m: 2,
        s: -3
      }
    },
    success: true
  });
});

test('_parseBase should parse percent', t => {
  const observed = SIParser._parseBase('%');

  t.deepEqual(observed, {
    consumed: '%',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -2
      }
    },
    success: true
  });
});

test('_parseBase should parse parts-per-million', t => {
  const observed = SIParser._parseBase('ppm');

  t.deepEqual(observed, {
    consumed: 'ppm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -6
      }
    },
    success: true
  });
});

test('_parseBase should parse parts-per-billion', t => {
  const observed = SIParser._parseBase('ppb');

  t.deepEqual(observed, {
    consumed: 'ppb',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -9
      }
    },
    success: true
  });
});

test('_parseBase should parse parts-per-trillion', t => {
  const observed = SIParser._parseBase('ppt');

  t.deepEqual(observed, {
    consumed: 'ppt',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -12
      }
    },
    success: true
  });
});

test('_parseBase should parse parts-per-quadrillion', t => {
  const observed = SIParser._parseBase('ppq');

  t.deepEqual(observed, {
    consumed: 'ppq',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -15
      }
    },
    success: true
  });
});

test('_parseBase should parse Celcius', t => {
  const observed = SIParser._parseBase('°C');

  t.deepEqual(observed, {
    consumed: '°C',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        K: 1
      }
    },
    success: true
  });
  t.is(observed.result.conversion(0), 273.15);
});

test('_parseBase should parse yotta', t => {
  const observed = SIParser._parseBase('Ym');

  t.deepEqual(observed, {
    consumed: 'Ym',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 24,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse zetta', t => {
  const observed = SIParser._parseBase('Zm');

  t.deepEqual(observed, {
    consumed: 'Zm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 21,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse exa', t => {
  const observed = SIParser._parseBase('Em');

  t.deepEqual(observed, {
    consumed: 'Em',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 18,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse peta', t => {
  const observed = SIParser._parseBase('Pm');

  t.deepEqual(observed, {
    consumed: 'Pm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 15,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse tera', t => {
  const observed = SIParser._parseBase('Tm');

  t.deepEqual(observed, {
    consumed: 'Tm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 12,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse giga', t => {
  const observed = SIParser._parseBase('Gm');

  t.deepEqual(observed, {
    consumed: 'Gm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 9,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse mega', t => {
  const observed = SIParser._parseBase('Mm');

  t.deepEqual(observed, {
    consumed: 'Mm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 6,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse kilo', t => {
  const observed = SIParser._parseBase('km');

  t.deepEqual(observed, {
    consumed: 'km',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 3,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse hecto', t => {
  const observed = SIParser._parseBase('hm');

  t.deepEqual(observed, {
    consumed: 'hm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 2,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse deca', t => {
  const observed = SIParser._parseBase('dam');

  t.deepEqual(observed, {
    consumed: 'dam',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 1,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse deci', t => {
  const observed = SIParser._parseBase('dm');

  t.deepEqual(observed, {
    consumed: 'dm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -1,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse centi', t => {
  const observed = SIParser._parseBase('cm');

  t.deepEqual(observed, {
    consumed: 'cm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -2,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse milli', t => {
  const observed = SIParser._parseBase('mm');

  t.deepEqual(observed, {
    consumed: 'mm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -3,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse micro', t => {
  const observed = SIParser._parseBase('μm');

  t.deepEqual(observed, {
    consumed: 'μm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -6,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse nano', t => {
  const observed = SIParser._parseBase('nm');

  t.deepEqual(observed, {
    consumed: 'nm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -9,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse pico', t => {
  const observed = SIParser._parseBase('pm');

  t.deepEqual(observed, {
    consumed: 'pm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -12,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse femto', t => {
  const observed = SIParser._parseBase('fm');

  t.deepEqual(observed, {
    consumed: 'fm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -15,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse atto', t => {
  const observed = SIParser._parseBase('am');

  t.deepEqual(observed, {
    consumed: 'am',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -18,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse zepto', t => {
  const observed = SIParser._parseBase('zm');

  t.deepEqual(observed, {
    consumed: 'zm',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -21,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse yocto', t => {
  const observed = SIParser._parseBase('ym');

  t.deepEqual(observed, {
    consumed: 'ym',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -24,
        m: 1
      }
    },
    success: true
  });
});

test('_parseFactor should succeed with just base', t => {
  const observed = SIParser._parseFactor('s');

  t.deepEqual(observed, {
    consumed: 's',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        s: 1
      }
    },
    success: true
  });
});

test('_parseFactor should fail with nothing after caret', t => {
  const observed = SIParser._parseFactor('s^');

  t.deepEqual(observed, {
    consumed: 's^',
    rest: 's^',
    success: false
  });
});

test('_parseFactor should succeed with both base and exponent', t => {
  const observed = SIParser._parseFactor('s^-2');

  t.deepEqual(observed, {
    consumed: 's^-2',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: -0,
        s: -2
      }
    },
    success: true
  });
});

test('_parseCharUnits should fail with nothing after char', t => {
  const observed = SIParser._parseCharUnits('?', '?');

  t.deepEqual(observed, {
    consumed: '?',
    rest: '?',
    success: false
  });
});

test('_parseCharUnits should pass with term after char', t => {
  const observed = SIParser._parseCharUnits('?g', '?');

  t.deepEqual(observed, {
    consumed: '?g',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        g: 1
      }
    },
    success: true
  });
});

test('_parseTerm should parse factor times factor', t => {
  const observed = SIParser._parseTerm('g*m');

  t.deepEqual(observed, {
    consumed: 'g*m',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        g: 1,
        m: 1
      }
    },
    success: true
  });
});

test('_parseTerm should parse factor divided by factor', t => {
  const observed = SIParser._parseTerm('m/s');

  t.deepEqual(observed, {
    consumed: 'm/s',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        m: 1,
        s: -1
      }
    },
    success: true
  });
});

test('_parseTerm should parse consecutive multiplication operators', t => {
  const observed = SIParser._parseTerm('g*m*s');

  t.deepEqual(observed, {
    consumed: 'g*m*s',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        g: 1,
        m: 1,
        s: 1
      }
    },
    success: true
  });
});

test('_parseTerm should parse consecutive division operators', t => {
  const observed = SIParser._parseTerm('g/m/s');

  t.deepEqual(observed, {
    consumed: 'g/m/s',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        g: 1,
        m: -1,
        s: -1
      }
    },
    success: true
  });
});

test('_parseUnits should fail with nothing after open parenthesis', t => {
  const observed = SIParser._parseUnits('(');

  t.deepEqual(observed, {
    consumed: '(',
    rest: '(',
    success: false
  });
});

test('_parseUnits should fail with unbalanced parentheses', t => {
  const observed = SIParser._parseUnits('(A');

  t.deepEqual(observed, {
    consumed: '(A',
    rest: '(A',
    success: false
  });
});

test('_parseUnits should parse parentheses', t => {
  const observed = SIParser._parseUnits('(A)');

  t.deepEqual(observed, {
    consumed: '(A)',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        A: 1
      }
    },
    success: true
  });
});

test('_parseUnits should recurse through parentheses', t => {
  const observed = SIParser._parseUnits('((A))');

  t.deepEqual(observed, {
    consumed: '((A))',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        A: 1
      }
    },
    success: true
  });
});

test('_parseUnits should parse factor only', t => {
  const observed = SIParser._parseUnits('K');

  t.deepEqual(observed, {
    consumed: 'K',
    rest: '',
    result: {
      conversion: observed.result.conversion,
      exponents: {
        10: 0,
        K: 1
      }
    },
    success: true
  });
});

test('_parseMagnitude should succeed wth significand only', t => {
  const observed = SIParser._parseMagnitude('234.567');

  t.deepEqual(observed, {
    consumed: '234.567',
    rest: '',
    result: {
      exponent: 0,
      significand: 234.567
    },
    success: true
  });
});

test('_parseMagnitude should fail with nothing after *10^', t => {
  const observed = SIParser._parseMagnitude('234.567*10^');

  t.deepEqual(observed, {
    consumed: '234.567*10^',
    rest: '234.567*10^',
    success: false
  });
});

test('_parseMagnitude parse *10^ syntax', t => {
  const observed = SIParser._parseMagnitude('234.567*10^89');

  t.deepEqual(observed, {
    consumed: '234.567*10^89',
    rest: '',
    result: {
      exponent: 89,
      significand: 234.567
    },
    success: true
  });
});

test('_parseMagnitude should fail with nothing after E', t => {
  const observed = SIParser._parseMagnitude('234.567E');

  t.deepEqual(observed, {
    consumed: '234.567E',
    rest: '234.567E',
    success: false
  });
});

test('_parseMagnitude parse E syntax', t => {
  const observed = SIParser._parseMagnitude('234.567E89');

  t.deepEqual(observed, {
    consumed: '234.567E89',
    rest: '',
    result: {
      exponent: 89,
      significand: 234.567
    },
    success: true
  });
});

test('_parseMagnitude should fail with nothing after e', t => {
  const observed = SIParser._parseMagnitude('234.567e');

  t.deepEqual(observed, {
    consumed: '234.567e',
    rest: '234.567e',
    success: false
  });
});

test('_parseMagnitude parse e syntax', t => {
  const observed = SIParser._parseMagnitude('234.567e89');

  t.deepEqual(observed, {
    consumed: '234.567e89',
    rest: '',
    result: {
      exponent: 89,
      significand: 234.567
    },
    success: true
  });
});

test('_parseExpression should parse magnitude only', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23');

  t.deepEqual(observed, {
    consumed: '6.02214086*10^23',
    rest: '',
    result: {
      exponents: {
        10: 23
      },
      magnitude: 6.02214086
    },
    success: true
  });
});

test('_parseExpression should parse magnitude with term', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23mol^-1');

  t.deepEqual(observed, {
    consumed: '6.02214086*10^23mol^-1',
    rest: '',
    result: {
      exponents: {
        10: 23,
        mol: -1
      },
      magnitude: 6.02214086
    },
    success: true
  });
});

test('_parseExpression should parse magnitude times term', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23*mol^-1');

  t.deepEqual(observed, {
    consumed: '6.02214086*10^23*mol^-1',
    rest: '',
    result: {
      exponents: {
        10: 23,
        mol: -1
      },
      magnitude: 6.02214086
    },
    success: true
  });
});

test('_parseExpression should parse magnitude divided by term', t => {
  const observed = SIParser._parseExpression('6.02214086*10^23/mol');

  t.deepEqual(observed, {
    consumed: '6.02214086*10^23/mol',
    rest: '',
    result: {
      exponents: {
        10: 23,
        mol: -1
      },
      magnitude: 6.02214086
    },
    success: true
  });
});

test('_parseExpression should parse units only', t => {
  const observed = SIParser._parseExpression('mol^-1');

  t.deepEqual(observed, {
    consumed: 'mol^-1',
    rest: '',
    result: {
      exponents: {
        10: -0,
        mol: -1
      },
      magnitude: NaN
    },
    success: true
  });
});

test('_normalizeUnits should throw on non-string input', t => {
  t.throws(() => { SIParser._normalizeUnits(1); }, Error);
});

test('_normalizeUnits should parse empty string', t => {
  const observed = SIParser._normalizeUnits('');

  t.deepEqual(observed, {
    consumed: '',
    rest: '',
    result: {
      magnitude: '',
      units: ''
    },
    success: true
  });
});

test('_normalizeUnits should normalize units', t => {
  const observed = SIParser._normalizeUnits('100kPa');

  t.deepEqual(observed, {
    consumed: '100kPa',
    rest: '',
    result: {
      magnitude: '100*10^6',
      units: 'g*m^-1*s^-2'
    },
    success: true
  });
});

test('_normalizeUnits should fail', t => {
  const observed = SIParser._normalizeUnits('aoeu');

  t.deepEqual(observed, {
    consumed: '',
    rest: 'aoeu',
    success: false
  });
});
