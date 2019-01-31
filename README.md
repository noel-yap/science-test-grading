# science-test-grading

## Summary

Custom Google Sheets functions for scientific number conversions and SI unit conversions. See https://docs.google.com/spreadsheets/d/1KlylW4MLiG8flNstY7XL4-GaCLdxAH_zyPRC4FfjS7M/edit?usp=sharing for example usage.

## How to Customize the Grading Algorithm

1. Fork and clone the https://github.com/november-yankee/science-test-grading. Instructions for this can be found at https://help.github.com/articles/fork-a-repo/.
2. Write tests in `test/grade-test.js`. `ava` is used for the tests. Instructions for using `ava` can be found at https://github.com/avajs/ava/blob/master/readme.md.
3. Modify the function `_grade` in the file `Grade.ts` so that it passes the test you've written.
