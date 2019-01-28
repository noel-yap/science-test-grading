import test from 'ava';

// TODO: Test all other derived units.

var SIParser = require('../SIParser.ts');

test('_parseChar should succeed', t => {
  const result = SIParser._parseChar('aoeu', 'a');

  t.deepEqual(result, {
    consumed: 'a',
    rest: 'oeu',
    success: true
  });
});

test('_parseChar should fail', t => {
  const result = SIParser._parseChar('snth', 'a');

  t.deepEqual(result, {
    consumed: '',
    rest: 'snth',
    success: false
  });
});

test('_parseDigits should fail if no digits to parse', t => {
  const result = SIParser._parseDigits('aoeu');

  t.deepEqual(result, {
    consumed: '',
    rest: 'aoeu',
    success: false
  });
});

test('_parseDigits should succeed', t => {
  const result = SIParser._parseDigits('1234aoeu');

  t.deepEqual(result, {
    consumed: '1234',
    rest: 'aoeu',
    result: 1234,
    success: true
  });
});

test('_parseDotDigits should fail if not starting with dot', t => {
  const result = SIParser._parseDotDigits('1234');

  t.deepEqual(result, {
    consumed: '',
    rest: '1234',
    success: false
  });
});

test('_parseDotDigits should result in NaN if no digits after dot', t => {
  const result = SIParser._parseDotDigits('.aoeu');

  t.deepEqual(result, {
    consumed: '.',
    rest: 'aoeu',
    result: NaN,
    success: true
  });
});

test('_parseDecimal should fail', t => {
  const result = SIParser._parseDecimal('aoeu');

  t.deepEqual(result, {
    consumed: '',
    rest: 'aoeu',
    success: false
  });
});

test('_parseDecimal should fail with plus but no decimal', t => {
  const result = SIParser._parseDecimal('+aoeu');

  t.deepEqual(result, {
    consumed: '+',
    rest: '+aoeu',
    success: false
  })
});

test('_parseDecimal should succeed with plus followed by decimal', t => {
  const result = SIParser._parseDecimal('+1234.5678');

  t.deepEqual(result, {
    consumed: '+1234.5678',
    rest: '',
    result: 1234.5678,
    success: true
  });
});

test('_parseDecimal should fail with minus but no decimal', t => {
  const result = SIParser._parseDecimal('-aoeu');

  t.deepEqual(result, {
    consumed: '-',
    rest: '-aoeu',
    success: false
  })
});

test('_parseDecimal should succeed with minus followed by decimal', t => {
  const result = SIParser._parseDecimal('-1234.5678');

  t.deepEqual(result, {
    consumed: '-1234.5678',
    rest: '',
    result: -1234.5678,
    success: true
  })
})

test('_parseDecimal should succeed with digits but no dot', t => {
  const result = SIParser._parseDecimal('1234aoeu');

  t.deepEqual(result, {
    consumed: '1234',
    rest: 'aoeu',
    result: 1234,
    success: true
  });
});

test('_parseDecimal should succeed with digits dot digits', t => {
  const result = SIParser._parseDecimal('1234.5678');

  t.deepEqual(result, {
    consumed: '1234.5678',
    rest: '',
    result: 1234.5678,
    success: true
  })
});

test('_parseDecimal should succeed with just dot digits', t => {
  const result = SIParser._parseDecimal('.1234');

  t.deepEqual(result, {
    consumed: '.1234',
    rest: '',
    result: .1234,
    success: true
  });
});

test('_parseDecimal should succeed with digits dot', t => {
  const result = SIParser._parseDecimal('1234.aoeu');

  t.deepEqual(result, {
    consumed: '1234.',
    rest: 'aoeu',
    result: 1234,
    success: true
  });
});

test('_parseInteger should fail with plus but no integer', t => {
  const result = SIParser._parseInteger('+aoeu');

  t.deepEqual(result, {
    consumed: '+',
    rest: '+aoeu',
    success: false
  });
});

test('_parseInteger should succeed with plus followed by integer', t => {
  const result = SIParser._parseInteger('+1234');

  t.deepEqual(result, {
    consumed: '+1234',
    rest: '',
    result: 1234,
    success: true
  });
});

test('_parseInteger should fail with minus but no integer', t => {
  const result = SIParser._parseInteger('-aoeu');

  t.deepEqual(result, {
    consumed: '-',
    rest: '-aoeu',
    success: false
  });
});

test('_parseInteger should succeed with minus followed by integer', t => {
  const result = SIParser._parseInteger('-1234');

  t.deepEqual(result, {
    consumed: '-1234',
    rest: '',
    result: -1234,
    success: true
  });
});


test('_parseInteger should succeed with just digits', t => {
  const result = SIParser._parseInteger('1234');

  t.deepEqual(result, {
    consumed: '1234',
    rest: '',
    result: 1234,
    success: true
  })
});

test('_parseBase should parse grams', t => {
  const result = SIParser._parseBase('g');

  t.deepEqual(result, {
    consumed: 'g',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        g: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse meters', t => {
  const result = SIParser._parseBase('m');

  t.deepEqual(result, {
    consumed: 'm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse seconds', t => {
  const result = SIParser._parseBase('s');

  t.deepEqual(result, {
    consumed: 's',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        s: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse Kelvins', t => {
  const result = SIParser._parseBase('K');

  t.deepEqual(result, {
    consumed: 'K',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        K: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse moles', t => {
  const result = SIParser._parseBase('mol');

  t.deepEqual(result, {
    consumed: 'mol',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        mol: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse amperes', t => {
  const result = SIParser._parseBase('A');

  t.deepEqual(result, {
    consumed: 'A',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        A: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse candelas', t => {
  const result = SIParser._parseBase('cd');

  t.deepEqual(result, {
    consumed: 'cd',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        cd: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse Newtons', t => {
  const result = SIParser._parseBase('N');

  t.deepEqual(result, {
    consumed: 'N',
    rest: '',
    result: {
      conversion: result.result.conversion,
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
  const result = SIParser._parseBase('Pa');

  t.deepEqual(result, {
    consumed: 'Pa',
    rest: '',
    result: {
      conversion: result.result.conversion,
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
  const result = SIParser._parseBase('J');

  t.deepEqual(result, {
    consumed: 'J',
    rest: '',
    result: {
      conversion: result.result.conversion,
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
  const result = SIParser._parseBase('W');

  t.deepEqual(result, {
    consumed: 'W',
    rest: '',
    result: {
      conversion: result.result.conversion,
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

test('_parseBase should parse Celcius', t => {
  const result = SIParser._parseBase('°C');

  t.deepEqual(result, {
    consumed: '°C',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        K: 1
      }
    },
    success: true
  });
  t.is(result.result.conversion(0), 273.15);
});

test('_parseBase should parse yotta', t => {
  const result = SIParser._parseBase('Ym');

  t.deepEqual(result, {
    consumed: 'Ym',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 24,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse zetta', t => {
  const result = SIParser._parseBase('Zm');

  t.deepEqual(result, {
    consumed: 'Zm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 21,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse exa', t => {
  const result = SIParser._parseBase('Em');

  t.deepEqual(result, {
    consumed: 'Em',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 18,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse peta', t => {
  const result = SIParser._parseBase('Pm');

  t.deepEqual(result, {
    consumed: 'Pm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 15,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse tera', t => {
  const result = SIParser._parseBase('Tm');

  t.deepEqual(result, {
    consumed: 'Tm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 12,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse giga', t => {
  const result = SIParser._parseBase('Gm');

  t.deepEqual(result, {
    consumed: 'Gm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 9,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse mega', t => {
  const result = SIParser._parseBase('Mm');

  t.deepEqual(result, {
    consumed: 'Mm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 6,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse kilo', t => {
  const result = SIParser._parseBase('km');

  t.deepEqual(result, {
    consumed: 'km',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 3,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse hecto', t => {
  const result = SIParser._parseBase('hm');

  t.deepEqual(result, {
    consumed: 'hm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 2,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse deca', t => {
  const result = SIParser._parseBase('dam');

  t.deepEqual(result, {
    consumed: 'dam',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 1,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse deci', t => {
  const result = SIParser._parseBase('dm');

  t.deepEqual(result, {
    consumed: 'dm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -1,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse centi', t => {
  const result = SIParser._parseBase('cm');

  t.deepEqual(result, {
    consumed: 'cm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -2,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse milli', t => {
  const result = SIParser._parseBase('mm');

  t.deepEqual(result, {
    consumed: 'mm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -3,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse micro', t => {
  const result = SIParser._parseBase('μm');

  t.deepEqual(result, {
    consumed: 'μm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -6,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse nano', t => {
  const result = SIParser._parseBase('nm');

  t.deepEqual(result, {
    consumed: 'nm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -9,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse pico', t => {
  const result = SIParser._parseBase('pm');

  t.deepEqual(result, {
    consumed: 'pm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -12,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse femto', t => {
  const result = SIParser._parseBase('fm');

  t.deepEqual(result, {
    consumed: 'fm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -15,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse atto', t => {
  const result = SIParser._parseBase('am');

  t.deepEqual(result, {
    consumed: 'am',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -18,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse zepto', t => {
  const result = SIParser._parseBase('zm');

  t.deepEqual(result, {
    consumed: 'zm',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -21,
        m: 1
      }
    },
    success: true
  });
});

test('_parseBase should parse yocto', t => {
  const result = SIParser._parseBase('ym');

  t.deepEqual(result, {
    consumed: 'ym',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -24,
        m: 1
      }
    },
    success: true
  });
});

test('_parseFactor should succeed with just base', t => {
  const result = SIParser._parseFactor('s');

  t.deepEqual(result, {
    consumed: 's',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        s: 1
      }
    },
    success: true
  });
});

test('_parseFactor should fail with nothing after caret', t => {
  const result = SIParser._parseFactor('s^');

  t.deepEqual(result, {
    consumed: 's^',
    rest: 's^',
    success: false
  });
});

test('_parseFactor should succeed with both base and exponent', t => {
  const result = SIParser._parseFactor('s^-2');

  t.deepEqual(result, {
    consumed: 's^-2',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: -0,
        s: -2
      }
    },
    success: true
  });
});

test('_parseCharTerm should fail with nothing after char', t => {
  const result = SIParser._parseCharTerm('?', '?');

  t.deepEqual(result, {
    consumed: '?',
    rest: '?',
    success: false
  });
});

test('_parseCharTerm should pass with term after char', t => {
  const result = SIParser._parseCharTerm('?g', '?');

  t.deepEqual(result, {
    consumed: '?g',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        g: 1
      }
    },
    success: true
  });
});

test('_parseTerm should parse factor only', t => {
  const result = SIParser._parseTerm('K');

  t.deepEqual(result, {
    consumed: 'K',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        K: 1
      }
    },
    success: true
  });
});

test('_parseTerm should parse factor times factor', t => {
  const result = SIParser._parseTerm('g*m');

  t.deepEqual(result, {
    consumed: 'g*m',
    rest: '',
    result: {
      conversion: result.result.conversion,
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
  const result = SIParser._parseTerm('m/s');

  t.deepEqual(result, {
    consumed: 'm/s',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        m: 1,
        s: -1
      }
    },
    success: true
  });
});

test('_parseTerm should recurse over multiplication operators', t => {
  const result = SIParser._parseTerm('g*m/s');

  t.deepEqual(result, {
    consumed: 'g*m/s',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        g: 1,
        m: 1,
        s: -1
      }
    },
    success: true
  });
});

test('_parseTerm should fail with nothing after parenthesis', t => {
  const result = SIParser._parseTerm('(');

  t.deepEqual(result, {
    consumed: '(',
    rest: '(',
    success: false
  });
});

test('_parseTerm should fail with unbalanced parentheses', t => {
  const result = SIParser._parseTerm('(A');

  t.deepEqual(result, {
    consumed: '(A',
    rest: '(A',
    success: false
  });
});

test('_parseTerm should parse parentheses', t => {
  const result = SIParser._parseTerm('(A)');

  t.deepEqual(result, {
    consumed: '(A)',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        A: 1
      }
    },
    success: true
  });
});

test('_parseTerm should recurse through parentheses', t => {
  const result = SIParser._parseTerm('((A))');

  t.deepEqual(result, {
    consumed: '((A))',
    rest: '',
    result: {
      conversion: result.result.conversion,
      exponents: {
        10: 0,
        A: 1
      }
    },
    success: true
  });
});

test('_parseMagnitude should succeed wth significand only', t => {
  const result = SIParser._parseMagnitude('234.567');

  t.deepEqual(result, {
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
  const result = SIParser._parseMagnitude('234.567*10^');

  t.deepEqual(result, {
    consumed: '234.567*10^',
    rest: '234.567*10^',
    success: false
  });
});

test('_parseMagnitude parse *10^ syntax', t => {
  const result = SIParser._parseMagnitude('234.567*10^89');

  t.deepEqual(result, {
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
  const result = SIParser._parseMagnitude('234.567E');

  t.deepEqual(result, {
    consumed: '234.567E',
    rest: '234.567E',
    success: false
  });
});

test('_parseMagnitude parse E syntax', t => {
  const result = SIParser._parseMagnitude('234.567E89');

  t.deepEqual(result, {
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
  const result = SIParser._parseMagnitude('234.567e');

  t.deepEqual(result, {
    consumed: '234.567e',
    rest: '234.567e',
    success: false
  });
});

test('_parseMagnitude parse e syntax', t => {
  const result = SIParser._parseMagnitude('234.567e89');

  t.deepEqual(result, {
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
  const result = SIParser._parseExpression('6.02214086*10^23');

  t.deepEqual(result, {
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
  const result = SIParser._parseExpression('6.02214086*10^23mol^-1');

  t.deepEqual(result, {
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
  const result = SIParser._parseExpression('6.02214086*10^23*mol^-1');

  t.deepEqual(result, {
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
  const result = SIParser._parseExpression('6.02214086*10^23/mol');

  t.deepEqual(result, {
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
  const result = SIParser._parseExpression('mol^-1');

  t.deepEqual(result, {
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
  const result = SIParser._normalizeUnits('');

  t.deepEqual(result, {
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
  const result = SIParser._normalizeUnits('100kPa');

  t.deepEqual(result, {
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
  const result = SIParser._normalizeUnits('aoeu');

  t.deepEqual(result, {
    consumed: '',
    rest: 'aoeu',
    success: false
  });
});
