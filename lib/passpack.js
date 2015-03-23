/*
 Configures require.js to load the passpack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/passpack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/passpack';
		console.log('Configuring require to load passpack modules from', path);
		require.config({
			paths: {
				'passpack': path
			}
		});
	}
})();
