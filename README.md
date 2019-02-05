# science-test-grading

## Summary

Custom Google Sheets functions for scientific number conversions and SI unit conversions. See https://docs.google.com/spreadsheets/d/1KlylW4MLiG8flNstY7XL4-GaCLdxAH_zyPRC4FfjS7M/edit?usp=sharing for example usage.

## How to Customize the Grading Algorithm

0. Copy the spreadsheet https://docs.google.com/spreadsheets/d/1KlylW4MLiG8flNstY7XL4-GaCLdxAH_zyPRC4FfjS7M/edit?usp=sharing. Instructions for copying Google documents can be found at https://support.google.com/docs/answer/49114?co=GENIE.Platform%3DDesktop&hl=en.
1. Fork and clone the https://github.com/november-yankee/science-test-grading. Instructions for forking and cloning can be found at https://help.github.com/articles/fork-a-repo/.
2. Use `clasp` to have the clone point to the copy of the spreadsheet created in Step 0. Instructions for using `clasp` can be found at https://github.com/google/clasp/blob/master/README.md.
3. Write tests in `test/grade-test.js`. `ava` is used for the tests. Instructions for using `ava` can be found at https://github.com/avajs/ava/blob/master/readme.md.
4. Modify the function `_grade` in the file `Grade.ts` so that it passes the test you've written.
