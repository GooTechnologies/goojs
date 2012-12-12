GooJS
=====

Goo Engine in JavaScript


Tests
-----

The tests use Jasmin (http://pivotal.github.com/jasmine/) and Testacular (http://vojtajina.github.com/testacular/).

For testacular, the latest version is need (0.5.X) unless version >=0.6.0 has been released, install the canary build

    npm install -g testacular@canary

To run testacular, enter the directory TestDynamic/WebContent and run

    testacular start test/testacular.conf.js

to start the testacular server watching for changes. This currently uses Chrome.


JS Doc
------
The jsdoc requires you install JSDoc 3, https://github.com/jsdoc3/jsdoc

One way is to install jsdoc using the package.json file and npm install

    ./node_modules/jsdoc/jsdoc -d jsdoc-out -r -p src/goo

The resulting documentation will be generated in the jsdoc-out directory.
