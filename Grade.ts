import {Numbers} from './Numbers';
import {Properties} from './Properties';
import {ScientificNotation} from './ScientificNotation';
import {SIParser} from './SIParser';

/**
 * @param points    Number of full-credit points.
 * @param observed  Cell or matrix of student answers.
 * @param expected  Array of cell or matrix of expected answers. A matrix row is treated as a lower-bound, the first element, and upper-bound, the last element, interval.
 *
 * @return          Matrix of earned points along with rationales for points taken off.
 **/
function grade(points: number, observed: any, expected: string[]): number {
  const gradingProperties = Properties._getGradingProperties(SpreadsheetApp.getActiveSpreadsheet());

  // expected becomes an array of the rest of the arguments
  expected = Array.prototype.slice.call(arguments, 2);
  console.log(`grade: expected = ${expected}`);

  if (!Array.isArray(observed)) {
    observed = [[observed]];
  }

  return observed.map((row: string[]): [number, string][] => {
    return row.map((cell: string): [number, string] => {
      return expected.map((e: string): [number, string] => {
        try {
          console.log(`grade: points = ${points}, cell = ${cell}, e = ${e}`);
          const gradeResult = Grade._grade(gradingProperties, points, cell, e);
          console.log(`grade: points = ${points}, cell = ${cell}, e = ${e}, _grade = ${gradeResult}`);

          return gradeResult;
        } catch (e) {
          console.log(`grade: e = ${e}`);

          return [0.0, `${e.fileName}:${e.lineNumber}:${e.toString()}`];
        }
      }).reduce((accum: [number, string], cellGradeVsExpected: [number, string]): [number, string] => {
        const [maxGrade, maxGradeReason] = accum;

        console.log(`grade: accum = ${accum}, elt = ${cellGradeVsExpected}`);
        return (maxGradeReason === undefined || maxGradeReason.toString().indexOf('Error:') === 0 || cellGradeVsExpected[0] > maxGrade)
            ? cellGradeVsExpected
            : accum;
      }, [-points, undefined]);
    });
  }).reduce((accum: [number, string][], rowGrades: [number, string]): [number, string][] => {
    return accum.concat(rowGrades);
  }, []);
}

export module Grade {
  /**
   * If no magnitude:
   *   .75 of full credit off
   * Else:
   *   If magnitude off by orders of magnitude:
   *     .3125 of full credit off
   *
   *   If too few significant figures:
   *     .25 of full credit off
   *   Else if too many significant figures:
   *     .125 of full credit off
   *   Else if magnitude off within (0%, 1%]:
   *     .0625 of full credit off
   *   Else:
   *     .4375 of full credit off
   *
   * If no units:
   *   .25 of full credit off
   * Else if incorrect units:
   *   .1875 of full credit off
   **/
  export function _grade(gradingProperties: object, points: number, observed: string, expected: string): [number, string] {
    if (Array.isArray(expected[0])) {
      expected = expected[0];
    }

    console.log(`_grade: observed = ${observed}, expected = ${expected}`);

    const [
      minExpectedNormalizedMagnitude,
      minExpectedNormalizedUnits,
      minExpectedSignificantFigures,
      maxExpectedNormalizedMagnitude,
      maxExpectedNormalizedUnits,
      maxExpectedSignificantFigures] = (Array.isArray(expected)
        ? (): [number, string, number, number, string, number] => {
          const minExpected = expected[0];
          const maxExpected = expected[expected.length - 1];
          console.log(`_grade: minExpected = ${minExpected}, maxExpected = ${maxExpected}`);

          const minExpectedParts = Grade._getParts(minExpected);
          const maxExpectedParts = Grade._getParts(maxExpected);
          console.log(`_grade: minExpectedParts = ${minExpectedParts.toString(2)}, maxExpectedParts = ${maxExpectedParts.toString(2)}`);

          return [
            minExpectedParts.result.normalizedMagnitude,
            minExpectedParts.result.normalizedUnits,
            minExpectedParts.result.significantFigures,
            maxExpectedParts.result.normalizedMagnitude,
            maxExpectedParts.result.normalizedUnits,
            maxExpectedParts.result.significantFigures];
        }
        : (): [number, string, number, number, string, number] => {
          const expectedParts = Grade._getParts(expected);

          return [
            expectedParts.result.normalizedMagnitude,
            expectedParts.result.normalizedUnits,
            expectedParts.result.significantFigures,
            expectedParts.result.normalizedMagnitude,
            expectedParts.result.normalizedUnits,
            expectedParts.result.significantFigures];
        })();

    const observedParts = Grade._getParts(observed);
    const observedNormalizedMagnitude = observedParts.result.normalizedMagnitude;
    const observedNormalizedUnits = observedParts.result.normalizedUnits;
    const observedSignificantFigures = observedParts.result.significantFigures;

    if (minExpectedNormalizedUnits !== maxExpectedNormalizedUnits) {
      throw new Error(`Normalized expected units must be the same but were '${minExpectedNormalizedUnits}' and '${maxExpectedNormalizedUnits}'.`);
    }

    const expectedNormalizedUnits = minExpectedNormalizedUnits;

    const closestExpectedNormalizedMagnitude = Math.abs(observedNormalizedMagnitude - minExpectedNormalizedMagnitude) < Math.abs(observedNormalizedMagnitude - maxExpectedNormalizedMagnitude)
        ? minExpectedNormalizedMagnitude
        : maxExpectedNormalizedMagnitude;

    const minExpectedNormalizedOrderOfMagnitude = Numbers._orderOfMagnitude(minExpectedNormalizedMagnitude);
    const maxExpectedNormalizedOrderOfMagnitude = Numbers._orderOfMagnitude(maxExpectedNormalizedMagnitude);
    const observedNormalizedOrderOfMagnitude = Numbers._orderOfMagnitude(observedNormalizedMagnitude);

    const minExpectedNormalizedMagnitudeAdjusted = Grade._adjustOrderOfMagnitude(minExpectedNormalizedMagnitude, minExpectedNormalizedOrderOfMagnitude);
    const maxExpectedNormalizedMagnitudeAdjusted = Grade._adjustOrderOfMagnitude(maxExpectedNormalizedMagnitude, maxExpectedNormalizedOrderOfMagnitude);
    const observedNormalizedMagnitudeAdjusted = Grade._adjustOrderOfMagnitude(observedNormalizedMagnitude, observedNormalizedOrderOfMagnitude);

    const closestExpectedNormalizedMagnitudeAdjusted = Math.abs(observedNormalizedMagnitudeAdjusted - minExpectedNormalizedMagnitudeAdjusted) < Math.abs(observedNormalizedMagnitudeAdjusted - maxExpectedNormalizedMagnitudeAdjusted)
        ? minExpectedNormalizedMagnitudeAdjusted
        : maxExpectedNormalizedMagnitudeAdjusted;

    const expectedSignificantFigures = maxExpectedSignificantFigures > minExpectedSignificantFigures
        ? maxExpectedSignificantFigures
        : minExpectedSignificantFigures;
    const significantFiguresCmp = observedSignificantFigures < expectedSignificantFigures
        ? -1
        : observedSignificantFigures > expectedSignificantFigures
            ? 1
            : 0;

    console.log(`_grade: expected = ${expected}`);
    console.log(`_grade: observed = ${observed}`);

    console.log(`_grade: minExpectedNormalizedMagnitude = ${minExpectedNormalizedMagnitude}`);
    console.log(`_grade: maxExpectedNormalizedMagnitude = ${maxExpectedNormalizedMagnitude}`);
    console.log(`_grade: closestExpectedNormalizedMagnitude = ${closestExpectedNormalizedMagnitude}`);
    console.log(`_grade: observedNormalizedMagnitude = ${observedNormalizedMagnitude}`);

    console.log(`_grade: minExpectedNormalizedOrderOfMagnitude = ${minExpectedNormalizedOrderOfMagnitude}`);
    console.log(`_grade: maxExpectedNormalizedOrderOfMagnitude = ${maxExpectedNormalizedOrderOfMagnitude}`);
    console.log(`_grade: observedNormalizedOrderOfMagnitude = ${observedNormalizedOrderOfMagnitude}`);

    console.log(`_grade: minExpectedNormalizedMagnitudeAdjusted = ${minExpectedNormalizedMagnitudeAdjusted}`);
    console.log(`_grade: maxExpectedNormalizedMagnitudeAdjusted = ${maxExpectedNormalizedMagnitudeAdjusted}`);
    console.log(`_grade: closestExpectedNormalizedMagnitudeAdjusted = ${closestExpectedNormalizedMagnitudeAdjusted}`);
    console.log(`_grade: observedNormalizedMagnitudeAdjusted = ${observedNormalizedMagnitudeAdjusted}`);

    console.log(`_grade: minExpectedSignificantFigures = ${minExpectedSignificantFigures}`);
    console.log(`_grade: maxExpectedSignificantFigures = ${maxExpectedSignificantFigures}`);
    console.log(`_grade: expectedSignificantFigures = ${expectedSignificantFigures}`);
    console.log(`_grade: observedSignificantFigures = ${observedSignificantFigures}`);
    console.log(`_grade: significantFiguresCmp = ${significantFiguresCmp}`);

    console.log(`_grade: minExpectedNormalizedUnits = ${minExpectedNormalizedUnits}`);
    console.log(`_grade: maxExpectedNormalizedUnits = ${maxExpectedNormalizedUnits}`);
    console.log(`_grade: expectedNormalizedUnits = ${expectedNormalizedUnits}`);
    console.log(`_grade: observedNormalizedUnits = ${observedNormalizedUnits}`);

    const correctOrderOfMagnitude = minExpectedNormalizedOrderOfMagnitude <= observedNormalizedOrderOfMagnitude && observedNormalizedOrderOfMagnitude <= maxExpectedNormalizedOrderOfMagnitude;
    const withinAdjustedExpectedRange = minExpectedNormalizedMagnitudeAdjusted <= observedNormalizedMagnitudeAdjusted && observedNormalizedMagnitudeAdjusted <= maxExpectedNormalizedMagnitudeAdjusted;
    const closeToAdjustedExpected = Math.abs(observedNormalizedMagnitudeAdjusted - closestExpectedNormalizedMagnitudeAdjusted) / closestExpectedNormalizedMagnitudeAdjusted < .01;

    console.log(`_grade: correctOrderOfMagnitude = ${correctOrderOfMagnitude}`);
    console.log(`_grade: withinAdjustedExpectedRange = ${withinAdjustedExpectedRange}`);
    console.log(`_grade: closeToAdjustedExpected = ${closeToAdjustedExpected}`);

    const magnitudePortion = gradingProperties['magnitude-portion'];
    const magnitudeCredit = Numbers._isNaN(observedNormalizedMagnitude)
        ? [[gradingProperties['missing-magnitude'], 'No magnitude.']]
        : ((correctOrderOfMagnitude
            ? [[0.0, undefined]]
            : [[gradingProperties['incorrect-order-of-magnitude'], 'Incorrect order of magnitude.']])
            .concat(withinAdjustedExpectedRange
                ? (significantFiguresCmp < 0
                    ? [[gradingProperties['too-few-significant-figures'], 'Too few significant figures.']]
                    : significantFiguresCmp > 0
                        ? [[gradingProperties['too-many-significant-figures'], 'Too many significant figures.']]
                        : [[0.0, undefined]])
                : closeToAdjustedExpected
                    ? [[gradingProperties['order-adjusted-magnitude-off-by-less-than-one-percent'], 'Magnitude close but not exactly correct.']]
                    : [[gradingProperties['order-adjusted-magnitude-off-by-more-than-one-percent'], 'Incorrect order-of-magnitude-adjusted magnitude.']]));
    const unitsPortion = gradingProperties['units-portion'];
    const unitsCredit = observedNormalizedUnits === '' && expectedNormalizedUnits !== ''
        ? [[gradingProperties['missing-units'], 'No units.']]
        : observedNormalizedUnits !== expectedNormalizedUnits
            ? [[gradingProperties['incorrect-units'], 'Incorrect units.']]
            : [[0.0, undefined]];

    console.log(`_grade: magnitudeCredit = ${magnitudeCredit}`);
    console.log(`_grade: unitsCredit = ${unitsCredit}`);

    const noExpectedMagnitude = Numbers._isNaN(minExpectedNormalizedMagnitudeAdjusted) && Numbers._isNaN(maxExpectedNormalizedMagnitudeAdjusted);
    const noExpectedUnits = expectedNormalizedUnits === '';
    const result = []
        .concat(noExpectedMagnitude ? [] : magnitudeCredit)
        .concat(noExpectedUnits ? [] : unitsCredit)
        .filter((elt: [number, string][]): boolean => {
          return elt[1] !== undefined;
        }).reduce((accum: [number, string], elt: [number, string]): [number, string] => {
          return [accum[0] + elt[0], [accum[1], elt[1]].join(' ')];
        }, [0.0, '']);
    console.log(`_grade: result = ${result}`);
    result[0] = points
        - points
        * result[0]
        / (noExpectedMagnitude ? unitsPortion : 1)
        / (noExpectedUnits ? magnitudePortion : 1);
    result[1] = result[1].trim();

    if (observed === '') {
      result[1] = '';
    }

    return result;
  }

  export function _getParts(expression: string): SIParser.Result {
    try {
      return SIParser._normalizeUnits(expression)
          .andThen((normalizeExpressionResult: SIParser.Result) => {
            const magnitudeProvided = '0' <= expression.charAt(0) && expression.charAt(0) <= '9' || expression.charAt(0) === '.';
            const normalizedMagnitude = magnitudeProvided
                ? ScientificNotation._sciToNum((<SIParser.SuccessResult>normalizeExpressionResult).result.magnitude)
                : NaN;
            const normalizedUnits = (<SIParser.SuccessResult>normalizeExpressionResult).result.units;
            const significantFigures = magnitudeProvided
                ? Numbers._numberOfSignificantFigures(expression)
                : NaN;

            console.log(`_getParts: normalizedMagnitude = ${normalizedMagnitude}`);
            console.log(`_getParts: normalizedUnits = ${normalizedUnits}`);
            console.log(`_getParts: significantFigures = ${significantFigures}`);

            return Object.assign(normalizeExpressionResult, {
              result: {
                significantFigures: significantFigures,
                normalizedMagnitude: normalizedMagnitude,
                normalizedUnits: normalizedUnits
              }
            });
          })
          .orElse((normalizeExpressionResult: SIParser.Result): SIParser.Result => {
            throw new Error(`Unable to parse after '${normalizeExpressionResult.consumed}' in '${expression}'. Non-metric units might be being used.`);
          });
    } catch (e) {
      if (e.message.indexOf('must be of type string') !== -1) {
        throw new Error(`${expression}' must be entered in as text (ie by starting it with \`'\`)`);
      } else {
        throw e;
      }
    }
  }

  export function _adjustOrderOfMagnitude(input: number, adjustBy: number): number {
    const numberOfSignificantFigures = Numbers._numberOfSignificantFigures(input.toString());
    const orderOfMagnitude = Numbers._orderOfMagnitude(input);
    console.log(`_adjustOrderOfMagnitude: adjustBy = ${adjustBy}, numberOfSignificantFigures = ${numberOfSignificantFigures}, orderOfMagnitude = ${orderOfMagnitude}`);

    return Numbers._round(input * Math.pow(10, -adjustBy), -adjustBy - (numberOfSignificantFigures - orderOfMagnitude));
  }
}
