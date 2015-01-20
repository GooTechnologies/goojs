(function () {
	'use strict';

	if (window.frameElement) {
		$('a[class-name]').click(function () {
			var className = $(this).attr('class-name');
			window.parent.history.replaceState('Object', 'Title', 'index.html?c=' + className);
		});
	} else {
		var className = window.location.pathname.match(/\/(\w+)-doc\.html$/)[1];
		window.location.href = 'index.html?c=' + className;
	}
})();