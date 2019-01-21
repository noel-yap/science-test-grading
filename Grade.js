/**
 * @param points    Number of full-credit points.
 * @param observed  Cell or matrix of student answers.
 * @param expected  Array of cell or matrix of expected answers. A matrix row is treated as a lower-bound, the first element, and upper-bound, the last element, interval.
 *
 * @return          Matrix of earned points along with rationales for points taken off.
 **/
function grade(points, observed, expected) {
  const gradingProperties = _getGradingProperties(SpreadsheetApp.getActiveSpreadsheet());

  // expected becomes an array of the rest of the arguments
  expected = Array.prototype.slice.call(arguments, 2);
  Logger.log("grade: expected = %s", expected);
  
  if (!Array.isArray(observed)) {
    observed = [[ observed ]];
  }

  return observed.map(function (row) {
    return row.map(function (cell) {
      return expected.map(function (e) {
        try {
          Logger.log("grade: points = %s, cell = %s, e = %s", points, cell, e);
          const result = _grade(gradingProperties, points, cell, e);
          Logger.log("grade: points = %s, cell = %s, e = %s, _grade = %s", points, cell, e, result);
          
          return result;
        } catch(e) {
          Logger.log("grade: e = %s", e);
          
          return [0.0, e.fileName + ":" + e.lineNumber + ": " + e.toString()];
        }
      }).reduce(function (accum, elt) {
        Logger.log("grade: accum = %s, elt = %s", accum, elt);
        return (accum[1] === undefined || accum[1].toString().indexOf("Error:") === 0 || elt[0] > accum[0])
            ? elt
            : accum;
      }, [ -points, undefined ]);
    });
  }).reduce(function (accum, elt) {
    return accum.concat(elt);
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
  
  Logger.log("_grade: observed = %s, expected = %s", observed, expected);
  
  var minExpectedNormalizedMagnitude;
  var minExpectedNormalizedUnits;
  var minExpectedSignificantFigures;
  var maxExpectedNormalizedMagnitude;
  var maxExpectedNormalizedUnits;
  var maxExpectedSignificantFigures;
  if (Array.isArray(expected)) {
    const minExpected = expected[0];
    const maxExpected = expected[expected.length - 1];
    
    Logger.log("_grade: minExpected = %s", minExpected);
    const minExpectedParts = _getParts(minExpected);
    minExpectedNormalizedMagnitude = minExpectedParts.normalizedMagnitude;
    minExpectedNormalizedUnits = minExpectedParts.normalizedUnits;
    minExpectedSignificantFigures = minExpectedParts.significantFigures;

    Logger.log("_grade: maxExpected = %s", maxExpected);
    const maxExpectedParts = _getParts(maxExpected);
    maxExpectedNormalizedMagnitude = maxExpectedParts.normalizedMagnitude;
    maxExpectedNormalizedUnits = maxExpectedParts.normalizedUnits;
    maxExpectedSignificantFigures = maxExpectedParts.significantFigures;
  } else {
    const expectedParts = _getParts(expected);
    
    minExpectedNormalizedMagnitude = expectedParts.normalizedMagnitude;
    minExpectedNormalizedUnits = expectedParts.normalizedUnits;
    minExpectedSignificantFigures = expectedParts.significantFigures;
    
    maxExpectedNormalizedMagnitude = expectedParts.normalizedMagnitude;
    maxExpectedNormalizedUnits = expectedParts.normalizedUnits;
    maxExpectedSignificantFigures = expectedParts.significantFigures;
  }
  
  const observedParts = _getParts(observed);
  const observedNormalizedMagnitude = observedParts.normalizedMagnitude;
  const observedNormalizedUnits = observedParts.normalizedUnits;
  const observedSignificantFigures = observedParts.significantFigures;
  
  if (minExpectedNormalizedUnits !== maxExpectedNormalizedUnits) {
    throw new Error("Normalized expected units must be the same.");
  }
  
  const expectedNormalizedUnits = minExpectedNormalizedUnits;
  
  const closestExpectedNormalizedMagnitude = Math.abs(observedNormalizedMagnitude - minExpectedNormalizedMagnitude) < Math.abs(observedNormalizedMagnitude - maxExpectedNormalizedMagnitude)
      ? minExpectedNormalizedMagnitude
      : maxExpectedNormalizedMagnitude;

  const minExpectedNormalizedOrderOfMagnitude = _orderOfMagnitude(minExpectedNormalizedMagnitude);
  const maxExpectedNormalizedOrderOfMagnitude = _orderOfMagnitude(maxExpectedNormalizedMagnitude);
  const observedNormalizedOrderOfMagnitude = _orderOfMagnitude(observedNormalizedMagnitude);
  
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
  
  Logger.log("_grade: expected = %s", expected);
  Logger.log("_grade: observed = %s", observed);

  Logger.log("_grade: minExpectedNormalizedMagnitude = %s", minExpectedNormalizedMagnitude);
  Logger.log("_grade: maxExpectedNormalizedMagnitude = %s", maxExpectedNormalizedMagnitude);
  Logger.log("_grade: closestExpectedNormalizedMagnitude = %s", closestExpectedNormalizedMagnitude);
  Logger.log("_grade: observedNormalizedMagnitude = %s", observedNormalizedMagnitude);
  
  Logger.log("_grade: minExpectedNormalizedOrderOfMagnitude = %s", minExpectedNormalizedOrderOfMagnitude);
  Logger.log("_grade: maxExpectedNormalizedOrderOfMagnitude = %s", maxExpectedNormalizedOrderOfMagnitude);
  Logger.log("_grade: observedNormalizedOrderOfMagnitude = %s", observedNormalizedOrderOfMagnitude);
  
  Logger.log("_grade: minExpectedNormalizedMagnitudeAdjusted = %s", minExpectedNormalizedMagnitudeAdjusted);
  Logger.log("_grade: maxExpectedNormalizedMagnitudeAdjusted = %s", maxExpectedNormalizedMagnitudeAdjusted);
  Logger.log("_grade: closestExpectedNormalizedMagnitudeAdjusted = %s", closestExpectedNormalizedMagnitudeAdjusted);
  Logger.log("_grade: observedNormalizedMagnitudeAdjusted = %s", observedNormalizedMagnitudeAdjusted);
  
  Logger.log("_grade: minExpectedSignificantFigures = %s", minExpectedSignificantFigures);
  Logger.log("_grade: maxExpectedSignificantFigures = %s", maxExpectedSignificantFigures);
  Logger.log("_grade: expectedSignificantFigures = %s", expectedSignificantFigures);
  Logger.log("_grade: observedSignificantFigures = %s", observedSignificantFigures);
  Logger.log("_grade: significantFiguresCmp = %s", significantFiguresCmp);
  
  Logger.log("_grade: minExpectedNormalizedUnits = %s", minExpectedNormalizedUnits);
  Logger.log("_grade: maxExpectedNormalizedUnits = %s", maxExpectedNormalizedUnits);
  Logger.log("_grade: expectedNormalizedUnits = %s", expectedNormalizedUnits);
  Logger.log("_grade: observedNormalizedUnits = %s", observedNormalizedUnits);
  
  const correctOrderOfMagnitude = minExpectedNormalizedOrderOfMagnitude <= observedNormalizedOrderOfMagnitude && observedNormalizedOrderOfMagnitude <= maxExpectedNormalizedOrderOfMagnitude;
  const withinAdjustedExpectedRange = minExpectedNormalizedMagnitudeAdjusted <= observedNormalizedMagnitudeAdjusted && observedNormalizedMagnitudeAdjusted <= maxExpectedNormalizedMagnitudeAdjusted;
  const closeToAdjustedExpected = Math.abs(observedNormalizedMagnitudeAdjusted - closestExpectedNormalizedMagnitudeAdjusted) / closestExpectedNormalizedMagnitudeAdjusted < .01;
  
  function roundToSignificantFigure(fewerSignificantFigures, moreSignificantFigures) {
    return fewerSignificantFigures === moreSignificantFigures || _round(moreSignificantFigures, Math.floor(Math.log(Math.abs(moreSignificantFigures - fewerSignificantFigures))/Math.log(10)) + 1) === fewerSignificantFigures;
  };
  const roundsToWithinSignificantFigure = roundToSignificantFigure(
      significantFiguresCmp < 0 ? observedNormalizedMagnitudeAdjusted : closestExpectedNormalizedMagnitudeAdjusted,
      significantFiguresCmp < 0 ? closestExpectedNormalizedMagnitudeAdjusted : observedNormalizedMagnitudeAdjusted);
  
  Logger.log("_grade: correctOrderOfMagnitude = %s", correctOrderOfMagnitude);
  Logger.log("_grade: withinAdjustedExpectedRange = %s", withinAdjustedExpectedRange);
  Logger.log("_grade: closeToAdjustedExpected = %s", closeToAdjustedExpected);
  Logger.log("_grade: roundsToWithinSignificantFigure = %s", roundsToWithinSignificantFigure);
  
  const magnitudePortion = gradingProperties["magnitude-portion"];
  const magnitudeCredit = _isNaN(observedNormalizedMagnitude)
      ? [[ gradingProperties["missing-magnitude"], "No magnitude." ]]
      : ((correctOrderOfMagnitude
          ? [[ 0.0, undefined ]]
          : [[ gradingProperties["incorrect-order-of-magnitude"], "Incorrect order of magnitude." ]])
          .concat(withinAdjustedExpectedRange || roundsToWithinSignificantFigure
              ? (significantFiguresCmp < 0
                  ? [[ gradingProperties["too-few-significant-figures"], "Too few significant figures." ]]
                  : significantFiguresCmp > 0
                  ? [[ gradingProperties["too-many-significant-figures"], "Too many significant figures." ]]
                  : [[ 0.0, undefined ]])
              : closeToAdjustedExpected
              ? [[ gradingProperties["order-adjusted-magnitude-off-by-less-than-one-percent"], "Magnitude close but not exactly correct." ]]
              : [[ gradingProperties["order-adjusted-magnitude-off-by-more-than-one-percent"], "Incorrect order-of-magnitude-adjusted magnitude." ]]));
  const unitsPortion = gradingProperties["units-portion"];
  const unitsCredit = observedNormalizedUnits === "" && expectedNormalizedUnits !== ""
      ? [[ gradingProperties["missing-units"], "No units." ]]
      : observedNormalizedUnits !== expectedNormalizedUnits
      ? [[ gradingProperties["incorrect-units"], "Incorrect units." ]]
      : [[ 0.0, undefined ]];
  
  Logger.log("_grade: magnitudeCredit = %s", magnitudeCredit);
  Logger.log("_grade: unitsCredit = %s", unitsCredit);

  const noExpectedMagnitude = _isNaN(minExpectedNormalizedMagnitudeAdjusted) && _isNaN(maxExpectedNormalizedMagnitudeAdjusted);
  const noExpectedUnits = expectedNormalizedUnits === "";
  const result = []
      .concat(noExpectedMagnitude ? [] : magnitudeCredit)
      .concat(noExpectedUnits ? [] : unitsCredit)
      .filter(function (elt) {
        return elt[1] !== undefined;
      }).reduce(function (accum, elt) {
        return [ accum[0] + elt[0], [ accum[1], elt[1] ].join(" ") ];
      }, [ 0.0, "" ]);
  Logger.log("_grade: result = %s", result);
  result[0] = points
      - points
          * result[0]
          / (noExpectedMagnitude ? unitsPortion : 1)
          / (noExpectedUnits ? magnitudePortion : 1);
  result[1] = result[1].trim();

  if (observed === "") {
    result[1] = "";
  }
  
  return result;
}

function _getParts(expression) {
  try {
    const normalizeExpressionResult = _normalizeUnits(expression);
    Logger.log("_getParts: expression = %s, normalized = %s", expression, normalizeExpressionResult);
    
    if (normalizeExpressionResult.success) {
      const normalizedMagnitude = _sciToNum(normalizeExpressionResult.result.magnitude);
      const normalizedUnits = normalizeExpressionResult.result.units;
      const significantFigures = _numberOfSignificantFigures(expression);
      
      Logger.log("_getParts: normalizedMagnitude = %s", normalizedMagnitude);
      Logger.log("_getParts: normalizedUnits = %s", normalizedUnits);
      Logger.log("_getParts: significantFigures = %s", significantFigures);
      
      return {
        significantFigures: significantFigures,
        normalizedMagnitude: normalizedMagnitude,
        normalizedUnits: normalizedUnits
      };
    } else {
      throw new Error("Unable to parse after `" + normalizeExpressionResult.consumed + "` in `" + expression + "`. Non-metric units might be being used.");
    }
  } catch (e) {
    if (e.message.indexOf("must be of type string") !== -1) {
      throw new Error("'" + expression + "' must be entered in as text (ie by starting it with `'`)");
    } else {
      throw e;
    }
  }
}
                   
function _numberOfSignificantFigures(string) {
  string = string.toString();
  
  string = string.replace(/^0+|([^.0-9].*)/g, "");
  
  const digits = (string.indexOf('.') >= 0
      ? string.replace(/\./, "")
      : string.replace(/0+$/, ""));
  
  return digits.length;
}

function _orderOfMagnitude(number) {
  return Math.round(Math.log(Math.abs(number))/Math.log(10) + .5);
}

function _adjustOrderOfMagnitude(number, orderOfMagnitude) {
  return number / Math.pow(10, orderOfMagnitude);
}

function _getGradingProperties(spreadsheet) {
  const properties = spreadsheet.getRangeByName("grading.properties").getValues().reduce(function (accum, elt) {
    accum[elt[0]] = elt[2];
    
    return accum;
  }, {
    "magnitude-portion": 0.75,
    "missing-magnitude": 0.75,
    "incorrect-order-of-magnitude": 0.3125,
    "too-few-significant-figures": 0.25,
    "too-many-significant-figures": 0.125,
    "order-adjusted-magnitude-off-by-less-than-one-percent": 0.0625,
    "order-adjusted-magnitude-off-by-more-than-one-percent": 0.4375,
    "units-portion": 0.25,
    "missing-units": 0.25,
    "incorrect-units": 0.1875
  });
  Logger.log(properties);

  return properties;
}
