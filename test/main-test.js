require.config({
    paths: {
        "goo": "src/goo",
        "test": "test"
    },
    waitSeconds: 5
  });
require(['test/mathTest'], function(mathTest) {
  window.__testacular__.start();
});
