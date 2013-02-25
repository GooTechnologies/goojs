// Main module for testacular tests
require.config({
	baseUrl: '/base',
	paths: {
		"goo": "src/goo",
		"test": "test",
		"goo/lib": "lib"
	},
	waitSeconds: 5
});


require(['test/all-tests'], function() {
	window.__testacular__.start();
});
