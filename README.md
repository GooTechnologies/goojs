GooJS
=====

Goo Engine in JavaScript.
This document should answer quick questions about setting up a dev environment for working on the engine.
Every major component and external tools have their own `README.md` files in their respective directory.


TL;DR
-----

    npm install
    npm install -g grunt-cli
    grunt init-git


Install dependencies
--------------------

First install dependencies:

    npm install

Optionally, if you want to runt Grunt using just the `grunt` command,
install Grunt globally (may need to be run as root):

    npm install -g grunt-cli


Style checks
------------

To make sure that no incorrectly styled content appears, install the pre-commit hook:

    grunt init-git

This makes Git check whether all added and modified files pass the style check
before allowing a commit.

Note: The pre-commit hook checks the content of the files in the workspace, not the staged files. This means that if you are committing files that are correct in the staging area, but incorrect in the workspace, you'll get an error anyway.

This also means that `git commit file.js` may not actually check file.js.

Note: If you get a TypeError on Windows when running the JSHint script, try doing a SET HOME=%HOMEPATH% before running it.


## Tests

The tests use [http://pivotal.github.com/jasmine/](Jasmine) and are invoked by the build script (`CI`) through [http://karma-runner.github.io/](Karma).


### Karma

Open up a server and the open [http://localhost:your-fav-port/goojs/test/test.html]()

OR

Run `grunt unittest`

This will start a browser and run all tests with Karma once. If you want to use the more convenient Karma server, continue with the following steps.

Install Karma by running

    npm install karma -g

To start the karma server, run

    karma start test/karma.conf.js

which will start the karma server and remain idle watching for code or test changes.
You need to touch a file in src/ or test/ to trigger the tests.

If you get the following error, Karma didn't manage to start Chrome by itself.

    error (launcher): Cannot start Chrome
            CreateProcessW: The system cannot find the path specified.

    info (launcher): Trying to start Chrome again.
    Makefile:2: recipe for target `test' failed
    make: *** [test] Error 127

EITHER just open http://localhost:8080 manually in your browser.

OR use the following command instead (adjusting the path if necessary):

    karma start --browsers="c:\Program Files (x86)\Google\Chrome\Application\chrome.exe" test/karma.conf.js

### Jasmine

To run the tests using Jasmine's test runner in the browser, start a server, e.g. using:

    python -m SimpleHTTPServer 8000

And then open http://localhost:8000/test/test.html

### Code Coverage

Code coverage can be run using istanbul (https://github.com/gotwarlost/istanbul), which is built in to Karma. Every time the tests are run a code coverage result is saved into the folder `coverage/`, e.g. `coverage/Chrome 33.0.1750 (Mac OS X 10.9.2)/index.html`.


## Visual tests

`grunt e2e` to launch the visual test comparison tool

Visual tests serve both as documentation and to check that features (still) work. Every new feature should be accompanied by a visual test. See `visual-test/README.md` for more details.


## JS Doc

`grunt jsdoc` - outputs to `out-doc`

GooJS uses a custom documentation compiler, *modoc*; see `tools/modoc/README.md` for more details.


## Tern type expressions
 
`grunt tern` - outputs to `out-tern`

See `tools/modoc/README.md` for details about type expressions. The code relevant for tern is in `tools/modoc`.


## Releasing

See [https://bitbucket.org/gootech/goonguide/wiki/release-engine.md]()


## Building

+ Minified and mangled: `grunt`
+ Minified: `grunt minify-no-mangle`
+ Concatenated: `grunt minify-dev`