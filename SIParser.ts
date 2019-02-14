export module SIParser {
  /**
   * BNF grammar:
   *
   * <expression> ::= <magnitude>
   *                | <term>
   *                | <magnitude> <term>
   *                | <magnitude> * <term>
   *                | <magnitude> / <term>
   *
   * <magnitude> ::= <significand>
   *               | <significand> *10^ <exponent>
   *               | <significand> E <exponent>
   *               | <significand> e <exponent>
   *
   * <significand> ::= <decimal>
   *
   * <units> ::= <factor>
   *           | ( <term> )
   *
   * <term> ::= <units>
   *          | <units> <asterix-units>...
   *          | <units> <slash-units>...
   *
   * <asterix-units> ::= * <units>
   *
   * <slash-units> ::= / <units>
   *
   * <factor> ::= <base>
   *            | <base> ^ <exponent>
   *
   * <base> ::= <prefixless-unit>
   *          | <unit>
   *          | <prefix> <unit>
   *
   * <prefix> ::= y | z | a | f | p | n | μ | m | c | d | da | k | M | G | T | P | E | Z | Y
   *
   * <unit> ::= m | g | s | A | K | mol | cd | rad | sr | Hz | N | Pa | J | W | C | V | F | Ω | S | Wb | T | H | lm | lx | Bq | Gy | Sv | kat
   *
   * <prefixless-unit> ::= °C | | % | ppm | ppb | ppt | ppq
   *
   * <exponent> ::= <integer>
   *
   * <integer> ::= <digits>
   *             | + <integer>
   *             | - <integer>
   *
   * <decimal> ::= <digits>
   *             | . <digits>
   *             | <digits> . <digits>
   *             | + <decimal>
   *             | - <decimal>
   *
   * <digits> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
   **/
  export function _normalizeUnits(input: string): Result {
    if (typeof (input) !== 'string') {
      throw new Error(`'${JSON.stringify(input)}' must be of type string but is of type '${typeof (input)}'.`);
    }

    input = input.split(' ').join('');

    if (input === '') {
      return new SuccessResult('', '', {
        magnitude: '',
        units: ''
      });
    }

    const expressionResult = _parseExpression(input);
    console.log(`_normalizeUnits: expressionResult = ${expressionResult.toString()}`);

    if (expressionResult.success) {
      const exponents = expressionResult.result.exponents;

      const units = ['10', 'g', 'm', 's', 'A', 'K', 'cd', 'mol'].filter((unit) => {
        return exponents.hasOwnProperty(unit);
      });

      const magnitudeString = expressionResult.result.magnitude.toString() + (exponents['10'] !== 0
          ? '*10^' + exponents['10']
          : '');
      const unitsString = units
          .filter((unit) => {
            return unit !== '10';
          })
          .map((unit) => {
            return unit + (exponents[unit] !== 1
                ? '^' + exponents[unit]
                : '');
          })
          .join('*');
      console.log(`_normalizeUnits: magnitudeString = ${magnitudeString}`);

      return new SuccessResult(expressionResult.consumed, expressionResult.rest, {
        magnitude: magnitudeString,
        units: unitsString
      });
    } else {
      return new FailureResult(expressionResult.consumed, input);
    }
  }

  /**
   * <expression> ::= <magnitude>
   *                | <term>
   *                | <magnitude> <term>
   *                | <magnitude> * <term>
   *                | <magnitude> / <term>
   **/
  export function _parseExpression(input: string): Result {
    return Result.do(() => _parseTerm(input), (result: Result) => {
      return {
        exponents: result.success ? result.result.exponents : {},
        magnitude: NaN
      };
    })
    .orElseDo((input: string) => {
      return _parseMagnitude(input).withName('magnitude')
          .andThenDo((input: string) => _parseLiteral(input, '/'), (result: Result) => {
            return (termResult: Result) => {
              const termExponents = termResult.result.exponents;
              return Object.keys(termExponents).reduce((accum, elt) => {
                accum[elt] = elt !== '10' ? -accum[elt] : accum[elt];

                return accum;
              }, termExponents);
            };
          }).withName('divided-by')
          .orElseDo((input: string) => _parseLiteral(input, '*'), (result: Result) => {
            return (termResult: Result) => {
              return termResult.result.exponents;
            };
          }).withName('multiplied-by')
          .orElseDo((input: string) => _parseLiteral(input, ''), (result: Result) => {
            return (termResult: Result) => {
              return termResult.result.exponents;
            };
          }).withName('implied-multiplied-by')
          .andThenPossiblyDo(_parseTerm, (result: Result) => {
            return Object.assign(result.result, {
              exponents: result.previousResult.result(result)
            });
          }).withName('term')
          .map((result: Result) => {
            const magnitudeResult = result.getByName('magnitude');
            const termResult = result;
            console.log(`_parseExpression: termResult = ${termResult.toString()}, magnitudeResult = ${magnitudeResult.toString()}`);

            const exponents = termResult.result.exponents;

            return termResult.consumed !== '' && termResult.rest === ''
                ? Object.assign(termResult, {
                  result: {
                    exponents: !!exponents
                        ? Object.assign(exponents, {
                          10: (exponents ? exponents['10'] : 0) + magnitudeResult.result.exponent
                        })
                        : {
                          10: !!magnitudeResult ? magnitudeResult.result.exponent : 0
                        },
                    magnitude: !!magnitudeResult && magnitudeResult.success
                        ? !!termResult.result.conversion
                            ? termResult.result.conversion(magnitudeResult.result.significand)
                            : magnitudeResult.result.significand
                        : NaN
                  }
                })
                : new FailureResult(termResult.consumed, termResult.consumed + termResult.rest).withName('_parseExpression');
          });
    });
  }

  /**
   * <magnitude> ::= <significand>
   *               | <significand> <times-ten-to-the-exponent>
   **/
  export function _parseMagnitude(input: string): Result {
    return _parseSignificand(input)
        .map((result: Result) => {
          return Object.assign(result, {
            result:  {
              exponent: 0,
              significand: result.result
            }
          });
        })
        .andThenPossiblyDo(_parseTimesTenToTheExponent, (result: Result) => {
          return {
            exponent: result.result.exponent,
            significand: result.previousResult.result.significand
          };
        });
  }

  /**
   * <times-ten-to-the-exponent> ::= *10^ <exponent>
   *                               | E <exponent>
   *                               | e <exponent>
   **/
  function _parseTimesTenToTheExponent(input: string): Result {
    return _parseLiteral(input, '*10^')
        .orElseDo((input: string) => _parseLiteral(input, 'E'))
        .orElseDo((input: string) => _parseLiteral(input, 'e'))
        .andThenDo(_parseExponent, (result: Result) => {
          return {
            exponent: result.result
          };
        });
  }

  /**
   * <significand> ::= <decimal>
   **/
  export function _parseSignificand(input: string): Result {
    return _parseDecimal(input);
  }

  /**
   * <units> ::= <factor>
   *           | <parenthesized-term>
   */
  export function _parseUnits(input: string): Result {
    return _parseFactor(input)
        .orElseDo(_parseParenthesizedTerm);
  }

  /**
   * <parenthesized-term> ::= ( term )
   */
  function _parseParenthesizedTerm(input: string): Result {
    return _parseLiteral(input, '(')
        .andThenDo(_parseTerm)
        .andThenDo((input: string) => _parseLiteral(input, ')'), (result: Result) => result.previousResult.result)
        .map((result: Result) => {
          return Object.assign(result, {
            rest: result.success ? result.rest : input
          })
        });
  }

  /**
   * <term> ::= <units> <asterix-units>...
   *          | <units> <slash-units>...
   *
   * <asterix-units> ::= * <units>
   *
   * <slash-units> ::= / <units>
   **/
  export function _parseTerm(input: string): Result {
    const __parseTermHelper = (result: Result) => {
      const accumRest = result.rest;

      if (accumRest[0] !== '*' && accumRest[0] !== '/' || !result.success) {
        return result;
      } else {
        const operator = accumRest[0];
        const unitsResult = _parseUnits(accumRest.substring(1));
        console.log(`_parseTerm: unitsResult = ${unitsResult.toString()}`);

        const consumed = result.consumed + operator + unitsResult.consumed;

        return __parseTermHelper(unitsResult.success
            ? new SuccessResult(consumed, unitsResult.rest, {
              exponents: Object.keys(unitsResult.result.exponents).reduce((accum, elt) => {
                accum[elt] = (accum[elt] || 0) + (operator === '*' ? 1 : -1) * unitsResult.result.exponents[elt];

                return accum;
              }, result.result.exponents),
              conversion: (magnitude) => {
                return result.result.conversion(unitsResult.result.conversion(magnitude));
              }
            })
            : new FailureResult(consumed, unitsResult.rest));
      }
    };

    return __parseTermHelper(_parseUnits(input));
  }

  /**
   * <factor> ::= <base>
   *            | <base> <caret-exponent>
   **/
  export function _parseFactor(input: string): Result {
    return _parseBase(input)
        .andThenPossiblyDo(_parseCaretExponent.bind(this), (result: Result) => {
          console.log(`_parseFactor: result = ${result.toString()}`);

          return result.result(result.previousResult);
        });
  }

  /**
   * <caret-exponent> ::= ^ <exponent>
   **/
  function _parseCaretExponent(input: string): Result {
    return _parseLiteral(input, '^')
        .andThenDo(_parseExponent, (result: Result) => {
          return (baseResult: Result) => {
            const exponents = Object.keys(baseResult.result.exponents).reduce((accum, elt) => {
              accum[elt] *= result.result;
              if (accum[elt] === -0) {
                accum[elt] = 0;
              }

              return accum;
            }, baseResult.result.exponents);

            return {
              exponents: exponents,
              conversion: baseResult.result.conversion
            };
          };
        });
  }

  /**
   * <base> ::= <prefixless-unit>
   *          | <unit>
   *          | <prefix> <unit>
   *
   * <prefix> ::= y | z | a | f | p | n | μ | m | c | d | da | k | M | G | T | P | E | Z | Y
   *
   * <unit> ::= m | g | s | A | K | mol | cd | rad | sr | Hz | N | Pa | J | W | C | V | F | Ω | S | Wb | T | H | lm | lx | Bq | Gy | Sv | kat
   *
   * <prefixless-unit> ::= °C | | % | ppm | ppb | ppt | ppq
   **/
  export function _parseBase(input: string): Result {
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
          return prefix !== '' && input.indexOf(prefix) === 0;
        })
        .map((prefix) => {
          return units
              .filter((unit) => {
                const prefixedUnit = prefix + unit;

                return prefixlessUnits.indexOf(unit) === -1 && input.indexOf(prefixedUnit) === 0;
              })
              .map((unit) => {
                return {
                  prefix: prefix,
                  unit: unit
                };
              });
        })
        .reduce((acc, elt) => {
          return acc.concat(elt);
        }, [])
        .concat(units
            .filter((unit) => {
              return input.indexOf(unit) === 0;
            })
            .map((unit) => {
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

      return new SuccessResult(consumed, input.substring(consumed.length), Object.keys(derivedUnits).indexOf(unit) !== -1
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
          });
    } else {
      return new FailureResult('', input);
    }
  }

  /**
   * <exponent> ::= <integer>
   **/
  export function _parseExponent(input: string): Result {
    return _parseInteger(input);
  }

  /**
   * <integer> ::= <digits>
   *             | + <integer>
   *             | - <integer>
   **/
  export function _parseInteger(input: string): Result {
    return _parseDigits(input)
        .orElseDo((input: string) => {
          return _parseLiteral(input, '+')
              .andThenDo(_parseInteger);
        })
        .orElseDo((input: string) => {
          return _parseLiteral(input, '-')
              .andThenDo(_parseInteger, (result: Result) => {
                return (result.result === 0 ? 1 : -1) * result.result;
              });
        });
  }

  /**
   * <decimal> ::= <digits>
   *             | . <digits>
   *             | <digits> . <digits>
   *             | + <decimal>
   *             | - <decimal>
   **/
  export function _parseDecimal(input: string): Result {
    return _parseDigits(input).withName('integer-part')
        .alsoPossiblyDo((input: string) => _parseLiteral(input, '.'), (result: Result) => {
          return result.previousResult.result || 0;
        }).withName('integer-part')
        .alsoPossiblyDo(_parseDigits, (result: Result) => {
          const integerPart = result.getByName('integer-part');

          return parseFloat(result.previousResult.consumed + result.consumed);
        })
        .orElseDo((input: string) => {
          return _parseLiteral(input, '+')
              .andThenDo(_parseDecimal);
        })
        .orElseDo((input: string) => {
          return _parseLiteral(input, '-')
              .andThenDo(_parseDecimal, (result: Result) => {
                return (result.result === 0 ? 1 : -1) * result.result;
              });
        });
  }

  /**
   * <digits> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
   **/
  export function _parseDigits(input: string): Result {
    const nDigits = input.match(/^[0-9]*/g)[0].length;
    if (nDigits !== 0) {
      const consumed = input.substring(0, nDigits);

      return new SuccessResult(consumed, input.substring(nDigits), parseInt(consumed));
    } else {
      return new FailureResult('', input);
    }
  }

  export function _parseLiteral(input: string, literal: string): Result {
    return (input.substring(0, literal.length) === literal
        ? new SuccessResult(literal, input.substring(literal.length), literal)
        : new FailureResult('', input));
  }

  class Result {
    protected name: string;

    constructor(
        public success: boolean,
        public consumed: string,
        public rest: string,
        public result?: any,
        public previousResult?: Result) {
      this.name = undefined;
      this.success = success;
      this.consumed = consumed;
      this.rest = rest;
      this.result = result;
    }

    toString(indent?: number): string {
      return JSON.stringify(
          this,
          (key: any, value): string => {
            return typeof(value) !== 'function'
                ? value
                : value.toString().replace(/(\n| )+/g, ' ')
          },
          indent);
    }

    getByName(name: string): Result {
      return this.name === name
          ? this
          : this.previousResult.getByName(name);
    }

    withName(name: string): Result {
      this.name = name;

      return this;
    }

    static do(
        parseFn: () => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      const parsed = parseFn();
      console.log(`do: parsed = ${parsed.toString()}`);

      return parsed.success
          ? new SuccessResult(parsed.consumed, parsed.rest, onPass(parsed))
          : parsed;
    }

    andThenDo(
        parseFn: (string) => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      return this;
    }

    andThenPossiblyDo(
        parseFn: (string) => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      return this;
    }

    orElseDo(
        parseFn: (string) => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      return this;
    }

    alsoPossiblyDo(
        parseFn: (string) => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      const parsed = parseFn(this.rest);
      parsed.previousResult = this;
      console.log(`andThenPossiblyDo: this = ${this.toString()}, parsed = ${parsed.toString()}`);

      const consumed = this.consumed + parsed.consumed;

      return parsed.success
          ? new SuccessResult(consumed, parsed.rest, onPass(parsed), this)
          : parsed.consumed === ''
              ? this
              : Object.assign(parsed, {
                consumed: consumed,
                rest: this.consumed + this.rest
              });
    }

    map(operator = (result: Result) => result): Result {
      return operator(this);
    }
  }

  class NullResult extends Result {
    constructor() {
      super(false, '', '');
      this.name = 'NullResult';
    }

    toString(): string {
      return this.name;
    }

    getByName(name: string) {
      return this;
    }
  }

  export class SuccessResult extends Result {
    constructor(
        public consumed: string,
        public rest: string,
        public result?: any,
        public previousResult: Result = new NullResult()) {
      super(true, rest, result, previousResult);
    }

    andThenDo(
        parseFn: (string) => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      const parsed = parseFn(this.rest);
      parsed.previousResult = this;
      console.log(`andThenDo: parsed = ${parsed.toString()}`);

      const consumed = this.consumed + parsed.consumed;
      console.log(`andThenDo: this.consumed = '${this.consumed}', parsed.consumed = '${parsed.consumed}', consumed = '${consumed}'`);

      return parsed.success
          ? new SuccessResult(consumed, parsed.rest, onPass(parsed), this)
          : new FailureResult(consumed, parsed.rest, this.result, this);
    }

    andThenPossiblyDo(
        parseFn: (string) => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      return super.alsoPossiblyDo(parseFn, onPass);
    }
  }

  export class FailureResult extends Result {
    constructor(
        public consumed: string,
        public rest: string,
        public result?: any,
        public previousResult: Result = new NullResult()) {
      super(false, consumed, rest, result, previousResult);
    }

    orElseDo(
        parseFn: (string) => Result,
        onPass: (Result) => any = (result) => result.result): Result {
      const parsed = parseFn(this.rest);

      return Object.assign(parsed, {
        consumed: this.consumed + parsed.consumed,
        result: onPass(parsed),
        previousResult: this
      });
    }
  }
}
