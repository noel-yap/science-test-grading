function _numberOfSignificantFigures(string) {
  string = string.toString();

  string = string.replace(/^0+|([^.0-9].*)/g, '');

  const digits = (string.indexOf('.') >= 0
      ? string.replace(/\./, '')
      : string.replace(/0+$/, ''));

  return digits.length;
}

function _round(number, powerOfTen) {
  const tenToTheNegativePower = Math.pow(10, -powerOfTen);

  const result = Math.round(number * tenToTheNegativePower) / tenToTheNegativePower;
  
  console.log(`_round: number = ${number}, powerOfTen = ${powerOfTen}, result = ${result}`);
  
  return result;
}

function _orderOfMagnitude(number) {
  return Math.round(Math.log(Math.abs(number))/Math.log(10));
}

function _isNaN(number) {
  return number !== number;
}

module.exports = {
  _numberOfSignificantFigures: _numberOfSignificantFigures,
  _round: _round,
  _orderOfMagnitude: _orderOfMagnitude,
  _isNaN: _isNaN
};
