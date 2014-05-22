/*
 Configures require.js to load the gizmoPack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/fsmpack and configure require.js.
	//! AT: ???
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/util/gizmopack';
		console.log('Configuring require to load gizmopack modules from', path);
		require.config({
			paths: {
				'util/gizmopack': path
			}
		});
	}
})();
