function _getGradingProperties(spreadsheet) {
  const properties = spreadsheet.getRangeByName("grading.properties").getValues().reduce(function (accum, elt) {
    accum[elt[0]] = elt[2];
    
    return accum;
  }, {
    "taker-answers-start-row": 6,
    "magnitude-portion": 0.75,
    "missing-magnitude": 0.75,
    "incorrect-order-of-magnitude": 0.3125,
    "too-few-significant-figures": 0.25,
    "too-many-significant-figures": 0.125,
    "order-adjusted-magnitude-off-by-less-than-one-percent": 0.0625,
    "order-adjusted-magnitude-off-by-more-than-one-percent": 0.4375,
    "units-portion": 0.25,
    "missing-units": 0.25,
    "incorrect-units": 0.1875
  });
  Logger.log(properties);

  return properties;
}
