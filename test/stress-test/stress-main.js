require.config({
	paths: {
		'goo': '../src/goo',
		'lib': '../lib',
		'goo/lib': '../lib'
	},
	waitSeconds: 5
});

require([
	'trials/Vector3-vs-Vector',
	'trials/EntityManager-stress'
], function () {
	stress();
});
