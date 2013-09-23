/*
Configures require.js to load Goo Engine from unconcatenated module files.
Used during development.
*/
(function() {
	// If the page is one of the visual tests,
	// find the relative URL to src/goo and configure require.js.
	var match = /visual-test\/.*$/.exec(window.location);
	if (match) {
		var path = [];
		var depth = match[0].split(/\/+/).length - 1
		for(var i = 0; i < depth; ++i) {
			path.push('..')
		}
		path.push('src/goo');
		path = path.join('/');
		console.log('Configuring require to load goo from URL', path);
		require.config({
			paths: {
				'goo': path
			}
		});
	}
})();
