/*
	Checks whether require.js was configured to load
	the path 'lib/*'. If not, it will find goojs/visual-test/lib/
	and reconfigure require.
 */
(function(){
	if(require && require.toUrl('lib/V') === './lib/V.js'){
		// lib/ path was not added!

		// Find the root path.
		var root = window.location.href.replace(/visual-test\/.*$/, '');

		var path = root + 'visual-test/lib';
		console.log('Configuring require to load visual-test modules from', path);
		require.config({
			paths: {
				'lib': path
			}
		});
	}
})();