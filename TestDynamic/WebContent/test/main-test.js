require.config({
    paths: {
        "goo": "goo",
        "test": "test"
    },
    waitSeconds: 5
  });
require(['test/mathTest'], function(mathTest) {
  window.__testacular__.start();
});
