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
});

require(['test/all-tests'], function() {
    window.__karma__.externalResourceRootPath = "/base/test";
    window.__karma__.start();
});
