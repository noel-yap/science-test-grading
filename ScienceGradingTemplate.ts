import {Functions} from './Functions';
import {ScientificNotation} from './ScientificNotation';
import {SIParser} from './SIParser';
import {Throttle} from './Throttle';

/**
 * Normalizes SI units into fundamental SI units (eg g, m, s) so it's easier to compare different representations (eg '50 kPa',
 * '50*10^3 kg/(m*s^2)', '5.0*10^4 kg*m^-1*s^-2').
 **/
function normalizeUnits(input): string {
  const normalizeUnitsResult = Throttle._throttle(
      Functions.bindLeft(SIParser._normalizeUnits, input));
 
  return (normalizeUnitsResult instanceof SIParser.SuccessResult
      ? (): string => {
        console.log(`_normalizeUnits: normalizeUnitsResult = ${JSON.stringify(normalizeUnitsResult)}`);

        const magnitudeString = normalizeUnitsResult.result.magnitude;
        const unitsString = normalizeUnitsResult.result.units;

        return `${magnitudeString} ${unitsString}`.trim();
      }
      : (): string => {
        throw new Error(`Unable to parse after '${normalizeUnitsResult.consumed}' in '${input}'. Are you sure metric units are being used?`);
      })();
}

/**
 * Converts a string similar to '234.567*10^89' to a number.
 **/
function sciToNum(formula: string): number {
  console.log(`sciToNum: ${formula}`);
  return Throttle._throttle(
      Functions.bindLeft(ScientificNotation._sciToNum, formula));
}

function numToSci(input: number, numberOfSignificantFigures: number): string {
  return Throttle._throttle(
      Functions.bindLeft(ScientificNotation._numToSci, input, numberOfSignificantFigures));
}
