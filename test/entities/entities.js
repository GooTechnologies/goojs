require({
    paths: {
        goo: "../../src/goo",
    }
});
require([
  'entities-test.js'
],
function() {
  'use strict';
   var env = jasmine.getEnv();

   env.addReporter(new jasmine.HtmlReporter());
   env.execute();
});
