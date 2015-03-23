e2e tests
=========

Generate reference screenshots with `grunt refs`.

Run the screenshot comparator with `grunt e2e`. The image diffs for failed tests are found in the 
*screenshot-tmp/<path-to-test>* folder.

The e2e test runner will take screenshots of all *.html* files under *visual-test*. To add filters (to exclude files 
from testing) edit *filterList.js* - some visual-tests may be problematic against e2e testing (sound-related tests 
for example).

To write or find more about visual tests please consult the appropriate *README.md*.