/*
 Configures require.js to load the gamepadPack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/gamepadpack and configure require.js.
	//! AT: ???
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/addons/gamepadpack';
		console.log('Configuring require to load gamepadpack modules from', path);
		require.config({
			paths: {
				'addons/gamepadpack': path
			}
		});
	}
})();
