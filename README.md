GooJS
=====

Goo Engine in JavaScript


Tests
-----

The tests use Jasmin (http://pivotal.github.com/jasmine/) and Testacular (http://vojtajina.github.com/testacular/).

For testacular, the latest version is need (0.5.X) unless version >=0.6.0 has been released, install the canary build

    npm install testacular@canary

(or `npm install -g testacular@canary`, to install globally.)

To run testacular

     ./node_modules/.bin/testacular start test/testacular.conf.js

which will start the testacular server, execute one test run on Chrome and remain idle watching for code or test changes.


### Code Coverage

Code coverage can be run using istanbul (https://github.com/gotwarlost/istanbul), which is built in to testacular. Every time the tests are run a code coverage result is saved into the folder `test-out/coverage/`, e.g. `test-out/coverage/Chrome\ 23.0\ \(Mac\)/lcov-report/index.html`.

In order to use the output in Jenkins, convert the `lcov.info` file using the `lcov_cobertura.py` (https://github.com/eriwen/lcov-to-cobertura-xml) in the `tools` directory.

JS Doc
------
The jsdoc requires you install JSDoc 3, https://github.com/jsdoc3/jsdoc

One way is to install jsdoc using the package.json file and running `npm install`. Generate the docs

    tools/generate-jsdoc.sh

The resulting documentation will be generated in the goojs-jsdoc directory and also packaged in a tar.gz file.
