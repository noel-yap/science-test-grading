function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu("Science Test")
      .addItem("Recalculate Points", "recalculatePoints")
      .addSeparator()
      .addItem("Activate Create Mode", "activateCreateMode")
      .addItem("Activate Grade Mode", "activateGradeMode")
      .addToUi();
}

function recalculatePoints() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  _recalculatePoints(spreadsheet.getSheetByName("Ana Graders Entries"));
  _recalculatePoints(spreadsheet.getSheetByName("Kata Graders Entries"));
}

function _recalculatePoints(gradersEntriesSheet) {
  const takerAnswersStartRow = _getGradingProperties(_getGradingProperties.getParent())["taker-answers-start-row"];
  const answersHeaderRow = takerAnswersStartRow - 2;
  
  const dataRange = gradersEntriesSheet.getDataRange();
  const width = dataRange.getWidth();
  const height = dataRange.getHeight();

  const pointFormulaRanges = Array.apply(null, Array(width))
      .map(function (_, i) {
        return i + 1;
      }).filter(function (c) {
        return gradersEntriesSheet.getRange(answersHeaderRow, c).getValue().indexOf("Points") !== -1;
      })
      .map(function (c) {
        return gradersEntriesSheet.getRange(takerAnswersStartRow, c, height - takerAnswersStartRow + 1, 1);
      });
  pointFormulaRanges.forEach(function (pointFormulaRange) {
    Logger.log("_recalculatePoints: pointFormulaRange = %s", pointFormulaRange);
    
    const pointFormulae = pointFormulaRange.getFormulas();
    Logger.log("_recalculatePoints: pointFormulae = %s", pointFormulae);
    
    pointFormulaRange.setFormulas(pointFormulae);
  });
}

function activateCreateMode() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  _showSheetsNotUsedDirectlyByGraders(spreadsheet);
}

function activateGradeMode() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  const anaGradersEntriesSheet = spreadsheet.getSheetByName("Ana Graders Entries");

  const kataGradersEntriesSheet = _createKataGradersEntriesSheetFrom(anaGradersEntriesSheet);
  _protectNonDataEntryCells(anaGradersEntriesSheet);
  _updateGradesVerificationSheetFrom(anaGradersEntriesSheet, kataGradersEntriesSheet);
  
  _reorderSheets(spreadsheet);
  _hideSheetsNotUsedDirectlyByGraders(spreadsheet);

  recalculatePoints();
  
  SpreadsheetApp.flush();
}

function _createKataGradersEntriesSheetFrom(fromSheet) {
  const takerAnswersStartRow = _getGradingProperties(_getGradingProperties.getParent())["taker-answers-start-row"];
  const creatorAnswersRow = takerAnswersStartRow - 1;

  const spreadsheet = fromSheet.getParent();
  const fromSheetName = fromSheet.getName();
  
  const kataGradersEntriesName = "Kata Graders Entries";

  // Before cloning the sheet, delete any previous copy.
  const old = spreadsheet.getSheetByName(kataGradersEntriesName);
  if (old) {
    old.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (protection) {
      protection.remove();
    });
    
    spreadsheet.deleteSheet(old);
  }
  
  const kataGradersEntriesSheet = fromSheet.copyTo(spreadsheet);
  const kataDataRange = kataGradersEntriesSheet.getDataRange();
  const kataWidth = kataDataRange.getWidth();
  const kataHeight = kataDataRange.getHeight();

  kataGradersEntriesSheet.setName(kataGradersEntriesName);
  kataGradersEntriesSheet.getRange('$A$1').setValue('Kata');
  kataGradersEntriesSheet
      .getRange(creatorAnswersRow, 1, 1, kataWidth)
      .setFormulaR1C1([ "'", fromSheetName, "'!R[0]C[0]" ].join(""));
  kataGradersEntriesSheet
      .getRange(takerAnswersStartRow, 2, kataHeight - takerAnswersStartRow + 1, 1)
      .setFormulaR1C1([ "'", fromSheetName, "'!R[0]C[0]" ].join(""));

  _protectNonDataEntryCells(kataGradersEntriesSheet);
  
  return kataGradersEntriesSheet;
}

function _updateGradesVerificationSheetFrom(anaGradersEntriesSheet, kataGradersEntriesSheet) {
  const anaGradersEntriesSheetName = anaGradersEntriesSheet.getName();
  const kataGradersEntriesSheetName = kataGradersEntriesSheet.getName();

  const spreadsheet = anaGradersEntriesSheet.getParent();
  const gradesVerificationSheet = spreadsheet.getSheetByName("Grades Verification");

  const startRowOfGivenAnswers = 6;
  const numberOfRowsToDelete = gradesVerificationSheet.getMaxRows() - startRowOfGivenAnswers + 1;
  if (numberOfRowsToDelete > 0) {
    gradesVerificationSheet.deleteRows(startRowOfGivenAnswers, numberOfRowsToDelete);
  }

  const numberOfRowsToAdd = anaGradersEntriesSheet.getMaxRows() - startRowOfGivenAnswers;
  gradesVerificationSheet.insertRowsAfter(startRowOfGivenAnswers - 1, numberOfRowsToAdd);
  gradesVerificationSheet
      .getRange(4, 3)
      .setFormula([ "'", anaGradersEntriesSheetName, "'!$A$1" ].join(""));
  gradesVerificationSheet
      .getRange(5, 1, numberOfRowsToAdd + 2, 1)
      .setFormulaR1C1([ "'", anaGradersEntriesSheetName, "'!R[0]C[1]" ].join(""));
  gradesVerificationSheet
      .getRange(5, 2, numberOfRowsToAdd + 2, 1)
      .setFormulaR1C1([ "'", anaGradersEntriesSheetName, "'!R[0]C[-1]" ].join(""));
  gradesVerificationSheet
      .getRange(5, 3, numberOfRowsToAdd + 2, 1)
      .setFormulaR1C1([ "'", anaGradersEntriesSheetName, "'!R[0]C[0]" ].join(""));
  gradesVerificationSheet
      .getRange(4, 4)
      .setFormula([ "'", kataGradersEntriesSheetName, "'!$A$1" ].join(""));
  gradesVerificationSheet
      .getRange(5, 4, numberOfRowsToAdd + 2, 1)
      .setFormulaR1C1([ "'", kataGradersEntriesSheetName, "'!R[0]C[-3]" ].join(""));
  gradesVerificationSheet
      .getRange(5, 5, numberOfRowsToAdd + 2, 1)
      .setFormulaR1C1([ "'", kataGradersEntriesSheetName, "'!R[0]C[-2]" ].join(""));
  
  gradesVerificationSheet
      .getRange(6, 1, numberOfRowsToAdd + 1, 1)
      .setHorizontalAlignment("center")
      .setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.DOUBLE);
  gradesVerificationSheet
      .getRange(6, 2, numberOfRowsToAdd, 4)
      .setHorizontalAlignment("normal");
  gradesVerificationSheet
      .getRange(6, 3, numberOfRowsToAdd, 1)
      .setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.DASHED);
  gradesVerificationSheet
      .getRange(6, 5, numberOfRowsToAdd, 1)
      .setBorder(null, null, null, true, null, null, "black", SpreadsheetApp.BorderStyle.SOLID);
}

function _hideSheetsNotUsedDirectlyByGraders(spreadsheet) {
  const sheetNames = _getGradingProperties(spreadsheet)["sheets-to-hide-from-graders"];
  
  sheetNames.split(',')
      .forEach(function (sheetName) {
        const sheet = spreadsheet.getSheetByName(sheetName);
        
        if (sheet !== null) {
          sheet.hideSheet();
        }
      });
}

function _showSheetsNotUsedDirectlyByGraders(spreadsheet) {
  const sheetNames = _getGradingProperties(spreadsheet)["sheets-to-hide-from-graders"];
  
  sheetNames.split(',')
      .forEach(function (sheetName) {
        const sheet = spreadsheet.getSheetByName(sheetName);
        
        if (sheet !== null) {
          sheet.showSheet();
        }
      });
}

function _reorderSheets(spreadsheet) {
  const sheetNames = [
      "examples",
      "grading.properties",
      "Grades -- scratch",
      "Kata Graders Entries",
      "Grades Verification", 
      "Ana Graders Entries",
      "Grader Instructions",
      "Creator Instructions" ];
  sheetNames.forEach(function (sheetName) {
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (sheet !== null) {
      spreadsheet.setActiveSheet(sheet);
      spreadsheet.moveActiveSheet(1);
      
      Utilities.sleep(200);
    }
  });
}

function _protectNonDataEntryCells(gradersEntriesSheet) {
  const dataRange = gradersEntriesSheet.getDataRange();
  const width = dataRange.getWidth();
  const height = dataRange.getHeight();

  const unprotectedRanges = _sequence(1, width)
      .filter(function (c) {
        return gradersEntriesSheet.getRange(4, c).getValue().indexOf("Answer") !== -1;
      }).concat([ 1 ])
      .map(function (c) {
        return gradersEntriesSheet.getRange(6, c, height - 5, 1);
      });
  gradersEntriesSheet
      .protect()
      .setUnprotectedRanges(unprotectedRanges)
      .setWarningOnly(true);
  
  unprotectedRanges.forEach(function (unprotectedRange) {
    const validationRules = _sequence(1, unprotectedRange.getHeight())
        .map(function (r) {
          const unprotectedCell = unprotectedRange.getCell(r, 1);
          
          return [ SpreadsheetApp.newDataValidation()
              .requireFormulaSatisfied([ "=istext(", unprotectedCell.getA1Notation(), ")" ].join(''))
              .setAllowInvalid(false)
              .setHelpText("Provided answers must be text (ie starting with `'`).")
              .build() ];
        });
    
    unprotectedRange.setDataValidations(validationRules);
  });
}

function _sequence(start, end) {
  return Array.apply(null, Array(end - start + 1))
      .map(function (_, i) {
        return start + i;
      });
}
