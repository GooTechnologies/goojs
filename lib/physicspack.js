/*
 Configures require.js to load the physicspack from unconcatenated module files.
 Used during development.
 */
(function () {
	'use strict';

	// If the page is one of the visual tests,
	// find the URL of src/physicspack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location !== window.location) {
		var path = location + 'src/physicspack';
		console.log('Configuring require to load physicspack modules from', path);
		require.config({
			paths: {
				'physicspack': path
			}
		});
	}
})();
