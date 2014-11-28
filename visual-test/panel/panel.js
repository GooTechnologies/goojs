(function () {
	'use strict';
	
	var tests = window.vtUrls.short;
	var len = Math.min(16, tests.length);
	for (var i = 0; i < len; i++) {
		var iframe = document.createElement('iframe');
		iframe.src = tests[i];
		iframe.width = 384;
		iframe.height = 384;
		document.body.appendChild(iframe);
	}
})();