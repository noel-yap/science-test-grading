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

class ScientificNotation {
  static _sciToNum(formula) {
    console.log(`_sciToNum: formula = ${formula}`);
    formula = formula.toString();
    console.log(`_sciToNum: formula = ${formula}`);

    formula = formula.replace(/\*10\^([-+0-9]+)/, 'E$1');
    formula = formula.replace(/([-+0-9]+)\^([-+0-9]+)/, 'Math.pow($1, $2)');
    console.log(`_sciToNum: formula = ${formula}`);

    return eval(formula);
  }

  static _numToSci(number, numberOfSignificantFigures) {
    --numberOfSignificantFigures;

    const exponent = Math.floor(Math.log(number) / Math.log(10));
    const significand = Math.round(number / Math.pow(10, exponent - numberOfSignificantFigures)) / Math.pow(10, numberOfSignificantFigures);

    return significand.toString().concat('*10^', exponent.toString());
  }
}

module.exports = ScientificNotation;
