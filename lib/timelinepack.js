/*
 Configures require.js to load the timelinepack from unconcatenated module files.
 Used during development.
 */
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/timelinepack and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/timelinepack';
		console.log('Configuring require to load timelinepack modules from', path);
		require.config({
			paths: {
				'timelinepack': path
			}
		});
	}
})();
