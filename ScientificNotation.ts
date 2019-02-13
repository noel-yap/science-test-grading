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
