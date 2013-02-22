// Main module for testacular tests
require.config({
    paths: {
        "goo": "src/goo",
        "test": "test",
        "goo/lib": "lib"
    },
    waitSeconds: 5
  });
require(['minified/goo'], function() {
require(['test/all-tests'], function() {
  window.__testacular__.start();
});
});
