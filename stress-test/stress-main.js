require.config({
	paths: {
		'goo': '../src/goo',
		'lib': '../lib',
		'goo/lib': '../lib'
	},
	waitSeconds: 5
});

require([
	'trials/EntityManager-stress'
], function () {
	stress();
});
