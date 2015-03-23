/*
 Configures require.js to load the animationPack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/fsmpacck and configure require.js.
	//! AT: ???
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/addons/animationpack';
		console.log('Configuring require to load animationpack modules from', path);
		require.config({
			paths: {
				'addons/animationpack': path
			}
		});
	}
})();
