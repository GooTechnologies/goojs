(function () {
	'use strict';

	window.__touched = new Map();

	window.__touch = function (id) {
		if (__touched.has(id)) {
			__touched.set(id, __touched.get(id) + 1);
		} else {
			__touched.set(id, 1);
		}
	}
})();