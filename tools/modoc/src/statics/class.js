(function () {
	'use strict';

	if (window.frameElement) {
		$('a[class-name]').click(function () {
			var className = $(this).attr('class-name');
			window.parent.history.replaceState('Object', 'Title', 'index.html?c=' + className);
			window.parent.postMessage(className, '*');
		});

		window.addEventListener('message', function (event) {
			var id = event.data;
			var element = document.getElementById(id);
			if (element) {
				element.scrollIntoView();
			}
		}, false);
	} else {
		var className = window.location.pathname.match(/\/(\w+)-doc\.html$/)[1];
		window.location.href = 'index.html?c=' + className;
	}
})();