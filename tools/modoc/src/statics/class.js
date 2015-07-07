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
				window.parent.history.replaceState('Object', 'Title', 'index.html?c=' + id);
			}
		}, false);
	} else {
		if (window.location.hash) {
			window.location.href = 'index.html?h=' + window.location.hash.slice(1);
		}
	}
})();