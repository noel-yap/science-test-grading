/**
 * Converts a string similar to "23.456*10^789" to a number.
 **/
function sciToNum(formula) {
  Logger.log("sciToNum: %s, %s", formula, Array.prototype.slice.call(arguments));
  return _throttle(_sciToNum, [ formula ]);
}

function _sciToNum(formula) {
  Logger.log("_sciToNum: formula = %s", formula);
  formula = formula.toString();
  Logger.log("_sciToNum: formula = %s", formula);
  
  // Strip leading "=" if there
  if (formula.charAt(0) === '=') {
    formula = formula.substring(1);
  }
  
  const indexOfPercent = formula.indexOf('%');
  if (indexOfPercent !== -1) {
    formula = formula.substring(0, indexOfPercent);
  }
  
  formula = formula.replace(/\*10\^([-+0-9]+)/, "E$1");
  formula = formula.replace(/([-+0-9]+)\^([-+0-9]+)/, "Math.pow($1, $2)");
  Logger.log("_sciToNum: formula = %s", formula);
  
  return eval(formula);
}

function numToSci(number, numberOfSignificantFigures) {
  return _throttle(_numToSci, Array.prototype.slice.call(arguments, 0));
}

function _numToSci(number, numberOfSignificantFigures) {
  --numberOfSignificantFigures;
  
  const exponent = Math.floor(Math.log(number)/Math.log(10));
  const significand = Math.round(number / Math.pow(10, exponent - numberOfSignificantFigures)) / Math.pow(10, numberOfSignificantFigures);
  
  return significand.toString().concat("*10^", exponent.toString());
}