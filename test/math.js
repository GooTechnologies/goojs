require({
    paths: {
        goo: "../src/goo",
    }
});
require([
  'mathTest.js'
],
function() {
  'use strict';
   var env = jasmine.getEnv();

   env.addReporter(new jasmine.HtmlReporter());
   env.execute();
});
