require({
    paths: {
        goo: "../../src/goo",
    }
});
require([
  'entitiesTest.js'
],
function() {
  'use strict';
   var env = jasmine.getEnv();

   env.addReporter(new jasmine.HtmlReporter());
   env.execute();
});
