/*
 Configures require.js to load the terrainpack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/terrainpack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/terrainpack';
		console.log('Configuring require to load terrainpack modules from', path);
		require.config({
			paths: {
				'terrainpack': path
			}
		});
	}
})();
