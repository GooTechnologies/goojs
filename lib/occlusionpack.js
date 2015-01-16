/*
 Configures require.js to load the debugpack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/occlusionpack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/occlusionpack';
		console.log('Configuring require to load debugpack modules from', path);
		require.config({
			paths: {
				'occlusionpack': path
			}
		});
	}
})();
