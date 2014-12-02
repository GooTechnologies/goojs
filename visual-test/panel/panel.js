(function () {
	'use strict';

	var IFRAME_WIDTH = 384;
	var IFRAME_HEIGHT = 256;
	var MAX_IFRAMES = 16;

	var tests = window.vtUrls.short.slice(0, MAX_IFRAMES);

	tests = tests.map(function (url) {
		return url.replace('http://127.0.0.1:8003', window.location.origin) + '?minimal=t';
	});

	for (var i = 0; i < tests.length; i++) {
		var iframe = document.createElement('iframe');
		iframe.src = tests[i];
		iframe.width = IFRAME_WIDTH;
		iframe.height = IFRAME_HEIGHT;
		document.body.appendChild(iframe);
	}
})();