/*
 Configures require.js to load the quadpack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/quadpack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/quadpack';
		console.log('Configuring require to load quadpack modules from', path);
		require.config({
			paths: {
				'quadpack': path
			}
		});
	}
})();
