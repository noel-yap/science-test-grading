export module Numbers {
  export function _numberOfSignificantFigures(string) {
    string = string.toString();

    string = string.replace(/^0+|([^.0-9].*)/g, '');

    const digits = (string.indexOf('.') >= 0
        ? string.replace(/\./, '')
        : string.replace(/0+$/, ''));

    return digits.length;
  }

  export function _round(number, powerOfTen) {
    const tenToTheNegativePower = Math.pow(10, -powerOfTen);

    const result = Math.round(number * tenToTheNegativePower) / tenToTheNegativePower;

    console.log(`_round: number = ${number}, powerOfTen = ${powerOfTen}, result = ${result}`);

    return result;
  }

  export function _orderOfMagnitude(number) {
    return Math.round(Math.log(Math.abs(number)) / Math.log(10));
  }

  export function _isNaN(number) {
    return number !== number;
  }
}
