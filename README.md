GooJS
=====

Goo Engine in JavaScript

Style checks
------------

To run JSHint on the code, run:

    cake checkstyle

To make sure that no incorrectly styled content appears, install the pre-commit hook:

    cake init-git

This makes Git check whether all added and modified files pass the style check
before allowing a commit.

Note: The pre-commit hook checks the content of the files in the workspace,
not the staged files. This means that if you are committing files that are
correct in the staging area, but incorrect in the workspace,
you'll get an error anyway.

This also means that `git commit file.js` may not actually check file.js.

Tests
-----

The tests use Jasmine (http://pivotal.github.com/jasmine/) and Testacular (http://vojtajina.github.com/testacular/).


### Testacular

For testacular, the latest version is need (0.5.X) unless version >=0.6.0 has been released, install the canary build

    npm install testacular@canary

(or `npm install -g testacular@canary`, to install globally.)

To run testacular

     ./node_modules/.bin/testacular start test/testacular.conf.js

or (if you have `make` installed) (DEPRECATED):

    make test

or (if you have 'cake' installed):

    cake testserver

which will start the testacular server and remain idle watching for code or test changes.
You need to touch a file in src/ or test/ to trigger the tests.

If you get the following error, Testacular didn't manage to start Chrome by itself.

    error (launcher): Cannot start Chrome
            CreateProcessW: The system cannot find the path specified.

    info (launcher): Trying to start Chrome again.
    Makefile:2: recipe for target `test' failed
    make: *** [test] Error 127

EITHER just open http://localhost:8080 manually in your browser.

OR use the following command instead (adjusting the path if necessary):

    testacular start --browsers="c:\Program Files (x86)\Google\Chrome\Application\chrome.exe" test/testacular.conf.js

### Jasmine

To run the tests using Jasmine's test runner in the browser, start a server, e.g. using:

    coffee ../simple-node-server/app.coffee --goo-path .

And then open http://localhost:8000/test/test.html

### Code Coverage

Code coverage can be run using istanbul (https://github.com/gotwarlost/istanbul), which is built in to testacular. Every time the tests are run a code coverage result is saved into the folder `test-out/coverage/`, e.g. `test-out/coverage/Chrome\ 23.0\ \(Mac\)/lcov-report/index.html`.

In order to use the output in Jenkins, convert the `lcov.info` file using the `lcov_cobertura.py` (https://github.com/eriwen/lcov-to-cobertura-xml) in the `tools` directory.

JS Doc
------
The jsdoc requires you install JSDoc 3, https://github.com/jsdoc3/jsdoc

One way is to install jsdoc using the package.json file and running `npm install`. Generate the docs

    tools/generate-jsdoc.sh

The resulting documentation will be generated in the goojs-jsdoc directory and also packaged in a tar.gz file.

## Releasing

First make sure you have a clean Git repository. Run `git status` to make sure you have no local edits.

Then create a release:

    build/release.py <version>

For example `build/release.py 0.5` which creates goo-0.5.zip.

Copy minified/goo/goo.js to the following locations:

    tool/template/lib/
    tool/content/libs/
    examples/lib/

Make sure the examples and the tool work with the new version.

Tag the release:

    git tag v<version>
    git push --tags

Upload goo-<version>.zip to the Download page: https://www.gooengine.com/download
