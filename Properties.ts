class Properties {
  static _getGradingProperties(spreadsheet) {
    const defaultValues = {
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
    };
    const gradingPropertiesRange = spreadsheet.getRangeByName("grading.properties");

    const properties = gradingPropertiesRange === null
        ? defaultValues
        : gradingPropertiesRange.getValues().reduce((accum, elt) => {
          accum[elt[0]] = elt[2];

          return accum;
        }, defaultValues);
    console.log(`_getGradingProperties: properties = ${properties}`);

    return properties;
  }
}

module.exports = Properties;
