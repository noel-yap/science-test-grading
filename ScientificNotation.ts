export module ScientificNotation {
  export function _sciToNum(formula: string): number {
    console.log(`_sciToNum: formula = ${formula}`);

    formula = formula.replace(/\*10\^([-+0-9]+)/, 'E$1');
    console.log(`_sciToNum: formula = ${formula}`);

    return parseFloat(formula);
  }

  export function _numToSci(input: number, numberOfSignificantFigures: number): string {
    --numberOfSignificantFigures;

    const exponent = Math.floor(Math.log(input) / Math.log(10));
    const significand = Math.round(input / Math.pow(10, exponent - numberOfSignificantFigures)) / Math.pow(10, numberOfSignificantFigures);

    return significand.toString().concat('*10^', exponent.toString());
  }
}
