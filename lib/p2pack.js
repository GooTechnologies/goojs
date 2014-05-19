/*
 Configures require.js to load the p2Pack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/fsmpack and configure require.js.
	//! AT: ???
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/addons/p2pack';
		console.log('Configuring require to load p2pack modules from', path);
		require.config({
			paths: {
				'addons/p2pack': path
			}
		});
	}
})();
