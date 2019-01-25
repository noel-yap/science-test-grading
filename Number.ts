function _round(number, powerOfTen) {
  const tenToTheNegativePower = Math.pow(10, -powerOfTen);

  const result = Math.round(number * tenToTheNegativePower) / tenToTheNegativePower;
  
  console.log(`_round: number = ${number}, powerOfTen = ${powerOfTen}, result = ${result}`);
  
  return result;
}

function _isNaN(number) {
  return number !== number;
}

module.exports = {
  _round: _round,
  _isNaN: _isNaN
};
