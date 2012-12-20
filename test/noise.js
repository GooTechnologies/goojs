require({ paths: { goo: '../src/goo' } });
require([
	'noise/Noise'
], function() {
  'use strict';

   var env = jasmine.getEnv();

   env.addReporter(new jasmine.HtmlReporter());
   env.execute();
});
