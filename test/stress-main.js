require.config({
	paths: {
		"goo": "../src/goo",
		"test": "../test",
		"lib": "../lib",
		"goo/lib": "../lib"
	},
	waitSeconds: 5
});

require(['test/stress/EntityManager-stress'], function() {
	'use strict';


});
