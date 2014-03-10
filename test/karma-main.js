var tests = [];
for (var file in window.__karma__.files) {
    //   /\-test\.js$/.test(file) ||
    //if (/\-tests\.js$/.test(file)) {
        tests.push(file);
    //}
}
//console.log("TESTS",tests)

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',

    paths: {
        'jquery': '../lib/jquery',
        'underscore': '../lib/underscore',

        'goo': 'src/goo',
        'fsmpack': 'src/fsmpack',
        'test': 'test',
        'lib': 'lib',
        'goo/lib': 'lib',
        'loaders': 'test/loaders',
        'loaders/res': 'test/loaders/res'
    },

    waitSeconds: 5,

    shim: {
        'underscore': {
            exports: '_'
        }
    },

    /*
    // ask Require.js to load these files (all our tests)
    deps: ['test/all-tests'],

    // start test run, once Require.js is done
    callback: window.__karma__.start
    */
});

require(['test/all-tests'], function() {
    //console.log("LOADED!")
    window.__karma__.externalResourceRootPath = "/base/test";
    window.__karma__.start();
});
