/*
Configures require.js to load Goo Engine from unconcatenated module files.
Used during development.
*/
(function() {
	// If the page is one of the visual tests,
	// find the URL of src/goo and configure require.js.
	var location = window.location.href.replace(/visual-test\/.*$/, '');
	location = location.replace(/examples\/.*$/, '');
	if (location != window.location) {
		var path = location + 'src/goo';
		console.log('Configuring require to load goo modules from', path);
		require.config({
			paths: {
				'goo': path,
				'lib': location + 'visual-test/lib'
			}
		});
	}
})();
