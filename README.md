GooJS
=====

Goo Engine in JavaScript


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


Tests
-----

The tests use Jasmine (http://pivotal.github.com/jasmine/) and Karma (http://karma-runner.github.io/).


### Karma

Open up a server and the open [http://localhost:your-fav-port/goojs/test/test.html]()

OR

Run `grunt test`

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

    coffee ../simple-node-server/app.coffee --goo-path .

And then open http://localhost:8000/test/test.html

### Code Coverage

Code coverage can be run using istanbul (https://github.com/gotwarlost/istanbul), which is built in to Karma. Every time the tests are run a code coverage result is saved into the folder `coverage/`, e.g. `coverage/Chrome 33.0.1750 (Mac OS X 10.9.2)/index.html`.

JS Doc
------

The jsdoc requires you install JSDoc 3, https://github.com/jsdoc3/jsdoc

One way is to install jsdoc using the package.json file and running `npm install`. Generate the docs

    tools/generate-jsdoc.sh

The resulting documentation will be generated in the goojs-jsdoc directory and also packaged in a tar.gz file.

## Releasing

See [https://bitbucket.org/gootech/goonguide/wiki/release-engine.md]()
soon not needed

## Building

To build a regular goo minified version, run

	grunt

This will build the engine and all registered packs. The output is in the *out* folder. To build individual packs run

    node tools/buildPack.js packName

Where `packname` is any "pack folder" from `src/` (*fsmpack*, *geometrypack*, ...)
