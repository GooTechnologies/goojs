/*
 Configures require.js to load the scriptpack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/scriptpack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/scriptpack';
		console.log('Configuring require to load scriptpack modules from', path);
		require.config({
			paths: {
				'scriptpack': path
			}
		});
	}
})();
