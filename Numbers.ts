export module Numbers {
  export function _numberOfSignificantFigures(input: string): number {
    input = input.toString();
    input = input.replace(/^0+|([^.0-9].*)/g, '');

    const digits = (input.indexOf('.') >= 0
        ? input.replace(/\./, '')
        : input.replace(/0+$/, ''));

    return digits.length;
  }

  export function _round(input: number, powerOfTen: number): number {
    const tenToTheNegativePower = Math.pow(10, -powerOfTen);
    const result = Math.round(input * tenToTheNegativePower) / tenToTheNegativePower;
    console.log(`_round: number = ${input}, powerOfTen = ${powerOfTen}, result = ${result}`);

    return result;
  }

  export function _orderOfMagnitude(input: number): number {
    return Math.round(Math.log(Math.abs(input)) / Math.log(10));
  }

  export function _isNaN(input: number): boolean {
    return input !== input;
  }
}
