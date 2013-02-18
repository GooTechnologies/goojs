// Main module for Jasmine HTML test runner
/*global jasmine:true */
require.config({
	paths: {
		"goo": "../src/goo",
		"test": "../test",
		"lib": "../lib"
	},
	waitSeconds: 5
});

require(['test/all-tests'], function() {
	'use strict';

	var env = jasmine.getEnv();
	env.addReporter(new jasmine.HtmlReporter());
	env.execute();
});
