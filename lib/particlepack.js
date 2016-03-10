/*
 Configures require.js to load the particlepack from unconcatenated module files.
 Used during development.
 */
(function () {
	'use strict';

	// If the page is one of the visual tests,
	// find the URL of src/particlepack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location !== window.location) {
		var path = location + 'src/addons/particlepack';
		console.log('Configuring require to load particlepack modules from', path);
		require.config({
			paths: {
				'particlepack': path
			}
		});
	}
})();
