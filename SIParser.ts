/**
 * Normalizes SI units into fundamental SI units (eg g, m, s) so it's easier to compare different representations (eg '50 kPa',
 * '50*10^3 kg/(m*s^2)', '5.0*10^4 kg*m^-1*s^-2').
 *
 * BNF grammar:
 *
 * <expression> ::= <magnitude> <term>
 *                  | <magnitude> * <term>
 *                  | <magnitude> / <term>
 *                  | <magnitude>
 *                  | <term>
 *
 * <magnitude> ::= <significand> *10^ <exponent>
 *
 * <significand> ::= <decimal>
 *
 * <units> ::= ( <term> )
 *             | <factor>
 *
 * <term> ::= <units>
 *            | <units> <asterix-units>...
 *            | <units> <slash-units>...
 *
 * <asterix-units> ::= * <units>
 *
 * <slash-units> ::= / <units>
 *
 * <factor> ::= <base>
 *              | <base> ^ <exponent>
 *
 * <base> ::= <base-unit>
 *            | <prefix> <base-unit>
 *            | <derived-unit>
 *            | <prefix> <derived-unit>
 *
 * <prefix> ::= Y | Z | E | P | T | G | M | k | da | d | c | m | μ | n | p | f | a | z | y
 *
 * <base-unit> ::= m | g | s | A | K | mol | cd
 *
 * <derived-unit> ::= rad | sr | Hz | N | Pa | J | W | C | V | F | Ω | S | Wb | T | H | °C | lm | lx | Bq | Gy | Sv | kat | % | ppm | ppb | ppt | ppq
 *
 * <exponent> ::= <integer>
 *
 * <integer> ::= + <digits>
 *               | - <digits>
 *               | <digits>
 *
 * <decimal> ::= + <digits> . <digits>
 *               | - <digits> . <digits>
 *               | <digits> . <digits>
 *
 * <digits> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
 **/
function normalizeUnits(string) {
  const normalizeUnitsResult = _throttle(
      (string) => new SIParser()._normalizeUnits(string),
      Array.prototype.slice.call(arguments));
  console.log(`_normalizeUnits: normalizeUnitsResult = ${JSON.stringify(normalizeUnitsResult)}`);

  if (normalizeUnitsResult.success) {
    const magnitudeString = normalizeUnitsResult.result.magnitude;
    const unitsString = normalizeUnitsResult.result.units;

    return `${magnitudeString} ${unitsString}`.trim();
  } else {
    throw new Error(`Unable to parse after '${normalizeUnitsResult.consumed}' in '${string}'. Are you sure metric units are being used?`);
  }
}

class SIParser {
  _normalizeUnits(string) {
    if (typeof (string) !== 'string') {
      throw new Error(`'${JSON.stringify(string)}' must be of type string but is of type '${typeof (string)}'.`);
    }

    string = string.split(' ').join('');

    if (string === '') {
      return {
        consumed: '',
        rest: '',
        result: {
          magnitude: '',
          units: ''
        },
        success: true
      };
    }

    const expressionResult = this._parseExpression(string);
    console.log(`_normalizeUnits: expressionResult = ${JSON.stringify(expressionResult)}`);

    if (expressionResult.success) {
      const exponents = expressionResult.result.exponents;

      const units = ['10', 'g', 'm', 's', 'A', 'K', 'cd', 'mol'].filter((unit) => {
        return exponents.hasOwnProperty(unit);
      });

      const magnitudeString = JSON.stringify(expressionResult.result.magnitude) + (exponents['10'] !== 0
          ? '*10^' + exponents['10']
          : '');
      const unitsString = units.filter((unit) => {
        return unit !== '10';
      }).map((unit) => {
        return unit + (exponents[unit] !== 1
            ? '^' + exponents[unit]
            : '');
      }).join('*');
      console.log(`_normalizeUnits: magnitudeString = ${magnitudeString}`);

      return {
        consumed: expressionResult.consumed,
        rest: expressionResult.rest,
        result: {
          magnitude: magnitudeString,
          units: unitsString
        },
        success: true
      };
    } else {
      return {
        consumed: expressionResult.consumed,
        rest: string,
        success: false
      };
    }
  }

  /**
   * <expression> ::= <magnitude> <term>
   *                  | <magnitude> * <term>
   *                  | <magnitude> / <term>
   *                  | <magnitude>
   *                  | <term>
   **/
  _parseExpression(string) {
    const magnitudeResult = this._parseMagnitude(string);
    console.log(`_parseExpression: magnitudeResult = ${JSON.stringify(magnitudeResult)}`);

    if (magnitudeResult.success || magnitudeResult.consumed === '') {
      if (magnitudeResult.rest) {
        const operator = magnitudeResult.rest[0] === '*'
            ? '*'
            : magnitudeResult.rest[0] === '/'
                ? '/'
                : '';
        const rest = magnitudeResult.rest.substring(operator === ''
            ? 0
            : 1);

        const termResult = this._parseTerm(rest);
        console.log(`_parseExpression: termResult = ${JSON.stringify(termResult)}`);

        const consumed = magnitudeResult.consumed + operator + termResult.consumed;

        if (termResult.success) {
          const termExponents = termResult.result.exponents;
          const exponents = operator === '/'
              ? Object.keys(termExponents).reduce((accum, elt) => {
                accum[elt] = -accum[elt];

                return accum;
              }, termExponents)
              : termExponents;
          if (magnitudeResult.success) {
            exponents['10'] += magnitudeResult.result.exponent;
          }

          return {
            consumed: consumed,
            rest: termResult.rest,
            result: {
              magnitude: magnitudeResult.success
                  // FIXME: This is incorrect for division.
                  ? termResult.result.conversion(magnitudeResult.result.significand)
                  : NaN,
              exponents: exponents
            },
            success: true
          };
        } else {
          return {
            consumed: consumed,
            rest: string,
            success: false
          };
        }
      } else {
        return {
          consumed: magnitudeResult.consumed,
          rest: magnitudeResult.rest,
          result: {
            magnitude: magnitudeResult.result.significand,
            exponents: {
              '10': magnitudeResult.result.exponent
            }
          },
          success: true
        };
      }
    } else {
      return {
        consumed: magnitudeResult.consumed,
        rest: string,
        success: false
      };
    }
  }

  /**
   * <magnitude> ::= <significand>
   *                 | <significand> *10^ <exponent>
   *                 | <significand> E <exponent>
   *                 | <significand> e <exponent>
   **/
  _parseMagnitude(string) {
    const significandResult = this._parseSignificand(string);
    console.log(`_parseMagnitude: significandResult = ${JSON.stringify(significandResult)}`);

    if (significandResult.success) {
      const operator = significandResult.rest.indexOf('*10^') === 0
          ? '*10^'
          : significandResult.rest[0] === 'E' || significandResult.rest[0] === 'e'
              ? significandResult.rest[0]
              : undefined;
      if (operator !== undefined) {
        const exponentResult = this._parseExponent(significandResult.rest.substring(operator.length));
        console.log(`_parseMagnitude: exponentResult = ${JSON.stringify(exponentResult)}`);

        const consumed = significandResult.consumed + operator + exponentResult.consumed;

        return exponentResult.success
            ? {
              consumed: consumed,
              rest: string.substring(consumed.length),
              result: {
                significand: significandResult.result,
                exponent: exponentResult.result
              },
              success: true
            }
            : {
              consumed: consumed,
              rest: string,
              success: false
            };
      } else {
        return {
          consumed: significandResult.consumed,
          rest: significandResult.rest,
          result: {
            significand: significandResult.result,
            exponent: 0
          },
          success: true
        };
      }
    } else {
      return {
        consumed: significandResult.consumed,
        rest: string,
        success: false
      };
    }
  }

  /**
   * <significand> ::= <decimal>
   **/
  _parseSignificand(string) {
    return this._parseDecimal(string);
  }

  /**
   * <units> ::= ( <term> )
   *             | <factor>
   */
  _parseUnits(string) {
    const openParenthesisResult = SIParser._parseChar(string, '(');
    console.log(`_parseUnits: openParenthesisResult = ${JSON.stringify(openParenthesisResult)}`);

    if (openParenthesisResult.success) {
      const termBetweenParenthesesResult = this._parseTerm(openParenthesisResult.rest);
      console.log(`_parseUnits: termBetweenParenthesesResult = ${JSON.stringify(termBetweenParenthesesResult)}`);

      if (termBetweenParenthesesResult.success) {
        const closeParenthesisResult = SIParser._parseChar(termBetweenParenthesesResult.rest, ')');
        console.log(`_parseUnits: closeParenthesisResult = ${JSON.stringify(closeParenthesisResult)}`);

        const consumedInclusiveBetweenParentheses = openParenthesisResult.consumed + termBetweenParenthesesResult.consumed + closeParenthesisResult.consumed;

        return closeParenthesisResult.success
            ? {
              consumed: consumedInclusiveBetweenParentheses,
              rest: closeParenthesisResult.rest,
              result: termBetweenParenthesesResult.result,
              success: true
            }
            : {
              consumed: consumedInclusiveBetweenParentheses,
              rest: string,
              success: false
            };
      } else {
        return {
          consumed: openParenthesisResult.consumed + termBetweenParenthesesResult.consumed,
          rest: string,
          success: false
        };
      }
    } else {
      const factorResult = this._parseFactor(string);
      console.log(`_parseUnits: factorResult = ${JSON.stringify(factorResult)}`);

      return factorResult.success
          ? factorResult
          : {
            consumed: factorResult.consumed,
            rest: string,
            success: false
          };
    }
  }

  /**
   * <term> ::= <units> <asterix-units>...
   *            | <units> <slash-units>...
   **/
  _parseTerm(string) {
    const __parseTermHelper = (accum) => {
      const accumRest = accum.rest;

      if (accumRest[0] !== '*' && accumRest[0] !== '/' || !accum.success) {
        return accum;
      } else {
        const operator = accumRest[0];
        const unitsResult = this._parseUnits(accumRest.substring(1));
        console.log(`_parseTerm: unitsResult = ${JSON.stringify(unitsResult)}`);

        const consumed = accum.consumed + operator + unitsResult.consumed;

        return __parseTermHelper(unitsResult.success
            ? {
              consumed: consumed,
              rest: unitsResult.rest,
              result: {
                exponents: Object.keys(unitsResult.result.exponents).reduce((accum, elt) => {
                  accum[elt] = (accum[elt] || 0) + (operator === '*' ? 1 : -1) * unitsResult.result.exponents[elt];

                  return accum;
                }, accum.result.exponents),
                conversion: (magnitude) => {
                  return accum.result.conversion(unitsResult.result.conversion(magnitude));
                }
              },
              success: true
            }
            : {
              consumed: consumed,
              rest: unitsResult.rest,
              success: false
            });
      }
    };

    const unitsResult = this._parseUnits(string);
    console.log(`_parseTerm: unitsResult = ${JSON.stringify(unitsResult)}`);

    return unitsResult.success
        ? __parseTermHelper(unitsResult)
        : {
          consumed: unitsResult.consumed,
          rest: string,
          success: false
        };
  }

  /**
   * <factor> ::= <base>
   *              | <base> ^ <exponent>
   **/
  _parseFactor(string) {
    const failureResult = {
      rest: string,
      success: false
    };

    const baseResult = this._parseBase(string);
    console.log(`parseFactor: baseResult = ${JSON.stringify(baseResult)}`);

    if (baseResult.success) {
      const caretResult = SIParser._parseChar(baseResult.rest, '^');
      console.log(`_parseFactor: caretResult = ${JSON.stringify(caretResult)}`);

      if (caretResult.success) {
        const exponentResult = this._parseExponent(caretResult.rest);
        console.log(`_parseFactor: exponentResult = ${JSON.stringify(exponentResult)}`);

        const consumedAroundCaret = baseResult.consumed + caretResult.consumed + exponentResult.consumed;

        if (exponentResult.success) {
          const exponents = Object.keys(baseResult.result.exponents).reduce((accum, elt) => {
            accum[elt] *= exponentResult.result;

            return accum;
          }, baseResult.result.exponents);

          return {
            consumed: consumedAroundCaret,
            rest: exponentResult.rest,
            result: {
              exponents: exponents,
              conversion: baseResult.result.conversion
            },
            success: true
          };
        } else {
          failureResult['consumed'] = consumedAroundCaret;
        }
      } else {
        return baseResult;
      }
    } else {
      failureResult['consumed'] = baseResult.consumed;
    }

    return failureResult;
  }

  /**
   * <base> ::= <base-unit>
   *            | <prefix> <base-unit>
   *            | <derived-unit>
   *            | <prefix> <derived-unit>
   *
   * <prefix> ::= Y | Z | E | P | T | G | M | k | da | d | c | m | μ | n | p | f | a | z | y
   *
   * <base-unit> ::= m | g | s | A | K | mol | cd
   *
   * <derived-unit> ::= rad | sr | Hz | N | Pa | J | W | C | V | F | Ω | S | Wb | T | H | °C | lm | lx | Bq | Gy | Sv | kat | % | ppm | ppb | ppt | ppq
   **/
  _parseBase(string) {
    const prefixes = {
      'Y': 24,
      'Z': 21,
      'E': 18,
      'P': 15,
      'T': 12,
      'G': 9,
      'M': 6,
      'k': 3,
      'h': 2,
      'da': 1,
      '': 0,
      'd': -1,
      'c': -2,
      'm': -3,
      'μ': -6,
      'n': -9,
      'p': -12,
      'f': -15,
      'a': -18,
      'z': -21,
      'y': -24
    };
    const baseUnits = ['m', 'g', 's', 'A', 'K', 'mol', 'cd'];
    const derivedUnits = {
      'L': {
        exponents: {
          10: -3,
          m: 3
        },
      },
      'rad': {
        exponents: {}
      },
      'sr': {
        exponents: {}
      },
      'Hz': {
        exponents: {
          s: -1
        }
      },
      'N': {
        exponents: {
          10: 3,
          g: 1,
          m: 1,
          s: -2
        }
      },
      'Pa': {
        exponents: {
          10: 3,
          g: 1,
          m: -1,
          s: -2
        }
      },
      'bar': {
        exponents: {
          10: 8,
          g: 1,
          m: -1,
          s: -2
        }
      },
      'J': {
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -2
        }
      },
      'W': {
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -3
        }
      },
      'C': {
        exponents: {
          s: 1,
          A: 1
        }
      },
      'V': {
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -3,
          A: -1
        }
      },
      'F': {
        exponents: {
          10: -3,
          g: -1,
          m: -2,
          s: 4,
          A: 2
        }
      },
      'Ω': {
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -3,
          A: -2
        }
      },
      'S': {
        exponents: {
          10: -3,
          g: -1,
          m: -2,
          s: 3,
          A: 2
        }
      },
      'Wb': {
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -2,
          A: -1
        }
      },
      'T': {
        exponents: {
          10: 3,
          g: 1,
          s: -2,
          A: -1
        }
      },
      'H': {
        exponents: {
          10: 3,
          g: 1,
          m: 2,
          s: -2,
          A: -2
        }
      },
      '°C': {
        exponents: {
          K: 1
        },
        conversion: (magnitude) => {
          return magnitude + 273.15;
        }
      },
      'lm': { // TODO: multiply by 4π
        exponents: {
          cd: 1
        }
      },
      'lx': { // TODO: conversion
        exponents: {
          m: -2,
          cd: 1
        }
      },
      'Bq': { // TODO: conversion
        exponents: {
          s: -1
        }
      },
      'Gy': { // TODO: conversion
        exponents: {
          m: 2,
          s: -2
        }
      },
      'Sv': { // TODO: conversion
        exponents: {
          m: 2,
          s: -2
        }
      },
      'kat': {
        exponents: {
          mol: 1,
          s: -1
        }
      },
      '%': {
        exponents: {
          10: -2
        }
      },
      'ppm': {
        exponents: {
          10: -6
        }
      },
      'ppb': {
        exponents: {
          10: -9
        }
      },
      'ppt': {
        exponents: {
          10: -12
        }
      },
      'ppq': {
        exponents: {
          10: -15
        }
      }
    };
    const prefixlessUnits = ['°C', '%', 'ppm', 'ppb', 'ppt', 'ppq'];

    const units = baseUnits.concat(Object.keys(derivedUnits));
    const match = Object.keys(prefixes)
        .filter((prefix) => {
          return prefix !== '' && string.indexOf(prefix) === 0;
        }).map((prefix) => {
          return units.filter((unit) => {
            const prefixedUnit = prefix + unit;

            return prefixlessUnits.indexOf(unit) === -1 &&
                string.indexOf(prefixedUnit) === 0;
          }).map((unit) => {
            return {
              prefix: prefix,
              unit: unit
            };
          });
        }).reduce((acc, elt) => {
          return acc.concat(elt);
        }, []).concat(units.filter((unit) => {
          return string.indexOf(unit) === 0;
        }).map((unit) => {
          return {
            prefix: '',
            unit: unit
          };
        }))
        .sort((lhs, rhs) => {
          return (rhs.prefix.length + rhs.unit.length) - (lhs.prefix.length + lhs.unit.length);
        });

    if (match.length > 0) {
      const prefix = match[0].prefix;
      const unit = match[0].unit;
      const consumed = `${prefix}${unit}`;

      const tensExponent = {10: prefixes[prefix]};
      const passThroughConversion = (magnitude) => {
        return magnitude;
      };

      return {
        consumed: consumed,
        rest: string.substring(consumed.length),
        result: Object.keys(derivedUnits).indexOf(unit) !== -1
            ? {
              exponents: Object.keys(derivedUnits[unit].exponents).reduce((accum, elt) => {
                accum[elt] = (accum[elt] || 0) + derivedUnits[unit].exponents[elt];

                return accum;
              }, tensExponent),
              conversion: derivedUnits[unit].conversion || passThroughConversion
            } : {
              exponents: {
                ...tensExponent,
                [unit]: 1
              },
              conversion: passThroughConversion
            },
        success: true
      };
    } else {
      return {
        consumed: '',
        rest: string,
        success: false
      };
    }
  }

  /**
   * <exponent> ::= <integer>
   **/
  _parseExponent(string) {
    return this._parseInteger(string);
  }

  /**
   * <integer> ::= + <integer>
   *               | - <integer>
   *               | <digits>
   **/
  _parseInteger(string) {
    if (string[0] === '+' || string[0] === '-') {
      const operator = string[0];
      
      const operatorResult = SIParser._parseChar(string, operator);
      console.log(`_parseInteger: operatorResult = ${JSON.stringify(operatorResult)}`);

      const integerAfterOperatorResult = this._parseInteger(operatorResult.rest);
      console.log(`_parseInteger: integerAfterOperatorResult = ${JSON.stringify(integerAfterOperatorResult)}`);

      const consumedInclusiveAfterOperator = operatorResult.consumed + integerAfterOperatorResult.consumed;

      return integerAfterOperatorResult.success
          ? {
            consumed: consumedInclusiveAfterOperator,
            rest: integerAfterOperatorResult.rest,
            result: (operator === '+' ? 1 : -1) * integerAfterOperatorResult.result,
            success: true
          }
          : {
            consumed: consumedInclusiveAfterOperator,
            rest: string,
            success: false
          };
    } else {
      const digitsResult = SIParser._parseDigits(string);
      console.log(`_parseInteger: digitsResult = ${JSON.stringify(digitsResult)}`);

      return digitsResult.success
          ? digitsResult
          : {
            consumed: digitsResult.consumed,
            rest: string,
            success: false
          };
    }
  }

  /**
   * <decimal> ::= + <decimal>
   *               | - <decimal>
   *               | <digits> <dot-digits>
   *               | <digits>
   *               | <dot-digits>
   **/
  _parseDecimal(string) {
    if (string[0] === '+' || string[0] === '-') {
      const operator = string[0];

      const operatorResult = SIParser._parseChar(string, operator);
      console.log(`_parseDecimal: operatorResult = ${JSON.stringify(operatorResult)}`);

      const decimalAfterOperatorResult = this._parseDecimal(operatorResult.rest);
      console.log(`_parseDecimal: decimalAfterOperatorResult = ${JSON.stringify(decimalAfterOperatorResult)}`);

      const consumedInclusiveAfterOperator = operatorResult.consumed + decimalAfterOperatorResult.consumed;

      return decimalAfterOperatorResult.success
          ? {
            consumed: consumedInclusiveAfterOperator,
            rest: decimalAfterOperatorResult.rest,
            result: (operator === '+' ? 1 : -1) * decimalAfterOperatorResult.result,
            success: true
          }
          : {
            consumed: consumedInclusiveAfterOperator,
            rest: string,
            success: false
          };
    } else {
      const digitsResult = SIParser._parseDigits(string);
      console.log(`_parseDecimal: digitsResult = ${JSON.stringify(digitsResult)}`);

      const dotDigitsResult = SIParser._parseDotDigits(digitsResult.rest);
      console.log(`_parseDecimal: dotDigitsResult = ${JSON.stringify(dotDigitsResult)}`);

      if (dotDigitsResult.success) {
        const consumedAroundPeriod = digitsResult.consumed + dotDigitsResult.consumed;

        return {
          consumed: consumedAroundPeriod,
          rest: dotDigitsResult.rest,
          result: parseFloat(consumedAroundPeriod),
          success: true
        };
      } else {
        return digitsResult;
      }
    }
  }

  /**
   * <dot-digits> ::= . <digits>
   **/
  static _parseDotDigits(string) {
    const periodResult = SIParser._parseChar(string, '.');
    console.log(`_parseDotDigits: periodResult = ${JSON.stringify(periodResult)}`);

    if (periodResult.success) {
      const digitsAfterPeriodResult = SIParser._parseDigits(periodResult.rest);
      console.log(`_parseDotDigits: digitsAfterPeriodResult = ${JSON.stringify(digitsAfterPeriodResult)}`);

      const consumedAfterPeriod = periodResult.consumed + digitsAfterPeriodResult.consumed;

      return {
        consumed: consumedAfterPeriod,
        rest: string.substring(consumedAfterPeriod.length),
        result: parseFloat(consumedAfterPeriod),
        success: true
      };
    } else {
      return {
        consumed: periodResult.consumed,
        rest: string,
        success: false
      };
    }
  }

  /**
   * <digits> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
   **/
  static _parseDigits(string) {
    const nDigits = string.match(/^[0-9]*/g)[0].length;
    if (nDigits !== 0) {
      const consumed = string.substring(0, nDigits);

      return {
        consumed: consumed,
        rest: string.substring(nDigits),
        result: parseInt(consumed),
        success: true
      };
    } else {
      return {
        consumed: '',
        rest: string,
        success: false
      };
    }
  }

  static _parseChar(string, char) {
    return char === string[0]
        ? {
          consumed: char,
          rest: string.substring(1),
          success: true
        }
        : {
          consumed: '',
          rest: string,
          success: false
        };
  }
}

module.exports = SIParser;
