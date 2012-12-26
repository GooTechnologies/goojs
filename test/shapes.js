require({ paths: { goo: '../src/goo' } });
require([
    'shapes/Box.js',
    'shapes/Quad.js',
    'shapes/Sphere.js',
    'shapes/Teapot.js',
    'shapes/Torus.js'
], function() {
  'use strict';

   var env = jasmine.getEnv();

   env.addReporter(new jasmine.HtmlReporter());
   env.execute();
});