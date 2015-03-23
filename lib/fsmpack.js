/*
 Configures require.js to load the FSMPack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/fsmpack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/fsmpack';
		console.log('Configuring require to load fsmpack modules from', path);
		require.config({
			paths: {
				'fsmpack': path
			}
		});
	}
})();
