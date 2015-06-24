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
	/* Google analytics */
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-55739361-8', 'auto', {
		'allowLinker': true
	});
	ga('require', 'linker');
	ga('linker:autoLink', ['goocreate.com', 'gooengine.com']);
	ga('send', 'pageview');
	/* End google analytics */
})();