GooJS
=====

Goo Engine in JavaScript

TL;DR
-----

    npm install
    npm install -g coffee-script  # On Unixy systems prefix with sudo
    cake init-git

Install dependencies
--------------------

First install dependencies:

    npm install

Optionally, if you want to runt Grunt using just the `grunt` command,
install Grunt globally (may need to be run as root):

    npm install -g grunt-cli

To be able to run Cake directly from the command-line, install it globally:

    npm install -g coffee-script

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

Note: If you get a TypeError on Windows when running the JSHint script, try doing a SET HOME=%HOMEPATH% before running it.


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

If this is a new major or minor release (i.e. the first or second number in the version number changed),
create a new branch:

    git checkout -b release-x.y  # replace x.y with major and minor version number

Otherwise just check out the existing branch:

    git checkout release-x.y  # replace x.y with major and minor version number

Then create a release (the GOO_VERSION variable is just there to make the commands below work):

    export GOO_VERSION=0.5.0
    build/release.py $GOO_VERSION

This creates the directory out/release/goo-$GOO_VERSION.

Create a zip file:

    (cd out/release && zip -r goo-$GOO_VERSION.zip goo-$GOO_VERSION)

Copy goo.js and goo-require.js to the tool and examples,
assuming those ../tool and ../examples exist:

    cp out/release/goo-$GOO_VERSION/lib/goo-require.js ../tool/template/lib/goo-require.js
    cp out/release/goo-$GOO_VERSION/lib/goo-require.js ../tool/content/libs/goo-require.js
    cp out/release/goo-$GOO_VERSION/lib/goo.js ../examples/lib/goo.js

Make sure the examples and the tool work with the new version.

Tag the release:

    git tag v$GOO_VERSION
    git push --tags

Copy the release to Dropbox:

    cp goo-$GOO_VERSION.zip ~/Dropbox/Goo\ Technologies\ AB/2.\ Research\ \&\ Development/Releases/

## Building
To build a regular goo minified version, run

	grunt

To build a combined require and goo minified version , run

	grunt -bundle-require -minify