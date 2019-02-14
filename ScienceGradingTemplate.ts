/**
 * Normalizes SI units into fundamental SI units (eg g, m, s) so it's easier to compare different representations (eg '50 kPa',
 * '50*10^3 kg/(m*s^2)', '5.0*10^4 kg*m^-1*s^-2').
 **/
function normalizeUnits(string) {
  const normalizeUnitsResult = _throttle(
      (string) => SIParser._normalizeUnits(string),
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

/**
 * Converts a string similar to '234.567*10^89' to a number.
 **/
function sciToNum(formula) {
  console.log(`sciToNum: ${formula}, ${Array.prototype.slice.call(arguments)}`);
  return _throttle(ScientificNotation._sciToNum, [formula]);
}

function numToSci(number, numberOfSignificantFigures) {
  return _throttle(ScientificNotation._numToSci, Array.prototype.slice.call(arguments, 0));
}
