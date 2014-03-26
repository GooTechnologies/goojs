/*
 Configures require.js to load the gizmopack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/gizmopack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/gizmopack';
		console.log('Configuring require to load gizmopack modules from', path);
		require.config({
			paths: {
				'gizmopack': path
			}
		});
	}
})();
