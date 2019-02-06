let __Number__ = __require('./Number.ts', () => {
  return {
    _numberOfSignificantFigures: _numberOfSignificantFigures,
    _round: _round,
    _orderOfMagnitude: _orderOfMagnitude,
    _isNaN: _isNaN
  };
});
let __Properties__ = __require('./Properties.ts', () => {
  return {
    _getGradingProperties: _getGradingProperties
  };
});
let __ScientificNotation__ = __require('./ScientificNotation.ts', () => {
  return {
    _sciToNum: _sciToNum
  };
});
let SIParser = __require('./SIParser.ts', () => {});

/**
 * @param points    Number of full-credit points.
 * @param observed  Cell or matrix of student answers.
 * @param expected  Array of cell or matrix of expected answers. A matrix row is treated as a lower-bound, the first element, and upper-bound, the last element, interval.
 *
 * @return          Matrix of earned points along with rationales for points taken off.
 **/
function grade(points, observed, expected) {
  const gradingProperties = __Properties__._getGradingProperties(SpreadsheetApp.getActiveSpreadsheet());

  // expected becomes an array of the rest of the arguments
  expected = Array.prototype.slice.call(arguments, 2);
  console.log(`grade: expected = ${expected}`);
  
  if (!Array.isArray(observed)) {
    observed = [[observed]];
  }

  return observed.map((row) => {
    return row.map((cell) => {
      return expected.map((e) => {
        try {
          console.log(`grade: points = ${points}, cell = ${cell}, e = ${e}`);
          const result = _grade(gradingProperties, points, cell, e);
          console.log(`grade: points = ${points}, cell = ${cell}, e = ${e}, _grade = ${result}`);

          return result;
        } catch(e) {
          console.log(`grade: e = ${e}`);
          
          return [0.0, e.fileName + ':' + e.lineNumber + ': ' + e.toString()];
        }
      }).reduce((accum, cellGradeVsExpected) => {
        const [maxGrade, maxGradeReason] = accum;

        console.log(`grade: accum = ${accum}, elt = ${cellGradeVsExpected}`);
        return (maxGradeReason === undefined || maxGradeReason.toString().indexOf('Error:') === 0 || cellGradeVsExpected[0] > maxGrade)
            ? cellGradeVsExpected
            : accum;
      }, [-points, undefined]);
    });
  }).reduce((accum, rowGrades) => {
    return accum.concat(rowGrades);
  }, []);
}

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
function _grade(gradingProperties, points, observed, expected) {
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
      ? () => {
        const minExpected = expected[0];
        const maxExpected = expected[expected.length - 1];
        console.log(`_grade: minExpected = ${minExpected}, maxExpected = ${maxExpected}`);

        const minExpectedParts = _getParts(minExpected);
        const maxExpectedParts = _getParts(maxExpected);

        return [
            minExpectedParts.normalizedMagnitude,
            minExpectedParts.normalizedUnits,
            minExpectedParts.significantFigures,
            maxExpectedParts.normalizedMagnitude,
            maxExpectedParts.normalizedUnits,
            maxExpectedParts.significantFigures];
      }
      : () => {
        const expectedParts = _getParts(expected);

        return [
            expectedParts.normalizedMagnitude,
            expectedParts.normalizedUnits,
            expectedParts.significantFigures,
            expectedParts.normalizedMagnitude,
            expectedParts.normalizedUnits,
            expectedParts.significantFigures];
      })();

  const observedParts = _getParts(observed);
  const observedNormalizedMagnitude = observedParts.normalizedMagnitude;
  const observedNormalizedUnits = observedParts.normalizedUnits;
  const observedSignificantFigures = observedParts.significantFigures;

  if (minExpectedNormalizedUnits !== maxExpectedNormalizedUnits) {
    throw new Error(`Normalized expected units must be the same but were '${minExpectedNormalizedUnits}' and '${maxExpectedNormalizedUnits}'.`);
  }

  const expectedNormalizedUnits = minExpectedNormalizedUnits;

  const closestExpectedNormalizedMagnitude = Math.abs(observedNormalizedMagnitude - minExpectedNormalizedMagnitude) < Math.abs(observedNormalizedMagnitude - maxExpectedNormalizedMagnitude)
      ? minExpectedNormalizedMagnitude
      : maxExpectedNormalizedMagnitude;

  const minExpectedNormalizedOrderOfMagnitude = __Number__._orderOfMagnitude(minExpectedNormalizedMagnitude);
  const maxExpectedNormalizedOrderOfMagnitude = __Number__._orderOfMagnitude(maxExpectedNormalizedMagnitude);
  const observedNormalizedOrderOfMagnitude = __Number__._orderOfMagnitude(observedNormalizedMagnitude);

  const minExpectedNormalizedMagnitudeAdjusted = _adjustOrderOfMagnitude(minExpectedNormalizedMagnitude, minExpectedNormalizedOrderOfMagnitude);
  const maxExpectedNormalizedMagnitudeAdjusted = _adjustOrderOfMagnitude(maxExpectedNormalizedMagnitude, maxExpectedNormalizedOrderOfMagnitude);
  const observedNormalizedMagnitudeAdjusted = _adjustOrderOfMagnitude(observedNormalizedMagnitude, observedNormalizedOrderOfMagnitude);

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
  const magnitudeCredit = __Number__._isNaN(observedNormalizedMagnitude)
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

  const noExpectedMagnitude = __Number__._isNaN(minExpectedNormalizedMagnitudeAdjusted) && __Number__._isNaN(maxExpectedNormalizedMagnitudeAdjusted);
  const noExpectedUnits = expectedNormalizedUnits === '';
  const result = []
      .concat(noExpectedMagnitude ? [] : magnitudeCredit)
      .concat(noExpectedUnits ? [] : unitsCredit)
      .filter((elt) => {
        return elt[1] !== undefined;
      }).reduce((accum, elt) => {
        return [accum[0] + elt[0], [ accum[1], elt[1] ].join(' ')];
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

function _getParts(expression) {
  try {
    const siParser = new SIParser;
    const normalizeExpressionResult = siParser._normalizeUnits(expression);
    console.log(`_getParts: expression = ${expression}, normalized = ${normalizeExpressionResult}`);
    
    if (normalizeExpressionResult.success) {
      const magnitudeProvided = '0' <= expression.charAt(0) && expression.charAt(0) <= '9' || expression.charAt(0) === '.';
      const normalizedMagnitude = magnitudeProvided
          ? __ScientificNotation__._sciToNum(normalizeExpressionResult.result.magnitude)
          : NaN;
      const normalizedUnits = normalizeExpressionResult.result.units;
      const significantFigures = magnitudeProvided
          ? __Number__._numberOfSignificantFigures(expression)
          : NaN;
      
      console.log(`_getParts: normalizedMagnitude = ${normalizedMagnitude}`);
      console.log(`_getParts: normalizedUnits = ${normalizedUnits}`);
      console.log(`_getParts: significantFigures = ${significantFigures}`);
      
      return {
        significantFigures: significantFigures,
        normalizedMagnitude: normalizedMagnitude,
        normalizedUnits: normalizedUnits
      };
    } else {
      throw new Error(`Unable to parse after '${normalizeExpressionResult.consumed}' in '${expression}'. Non-metric units might be being used.`);
    }
  } catch (e) {
    if (e.message.indexOf('must be of type string') !== -1) {
      throw new Error(`${expression}' must be entered in as text (ie by starting it with \`'\`)`);
    } else {
      throw e;
    }
  }
}

function _adjustOrderOfMagnitude(number, adjustBy) {
  const numberOfSignificantFigures = __Number__._numberOfSignificantFigures(number.toString());
  const orderOfMagnitude = __Number__._orderOfMagnitude(number);
  console.log(`_adjustOrderOfMagnitude: adjustBy = ${adjustBy}, numberOfSignificantFigures = ${numberOfSignificantFigures}, orderOfMagnitude = ${orderOfMagnitude}`);

  return __Number__._round(number * Math.pow(10, -adjustBy), -adjustBy - (numberOfSignificantFigures - orderOfMagnitude));
}

function _roundToSignificantFigure(fewerSignificantFigures, moreSignificantFigures) {
  console.log(`_roundToSignificantFigure: fewerSignificantFigures = ${fewerSignificantFigures}, moreSignificantFigures = ${moreSignificantFigures}`);

  return fewerSignificantFigures === moreSignificantFigures ||
      __Number__._round(moreSignificantFigures, Math.floor(Math.log(Math.abs(moreSignificantFigures - fewerSignificantFigures))/Math.log(10)) + 1) === fewerSignificantFigures;
}

function __require(file, otherwise) {
  try {
    return require(file);
  } catch (e) {
    return otherwise();
  }
}

module.exports = {
  _grade: _grade,
  _getParts: _getParts,
  _adjustOrderOfMagnitude: _adjustOrderOfMagnitude
};
