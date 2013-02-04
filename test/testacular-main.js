// Main module for testacular tests
require.config({
    paths: {
        "goo": "src/goo",
        "test": "test"
    },
    waitSeconds: 5
  });
require(['test/all-tests'], function() {
  window.__testacular__.start();
});
