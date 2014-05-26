define([
	'goo/util/rsvp'
], function (
	RSVP
	) {
	'use strict';

	(function performanceShim() {
		window.performance = window.performance || {};
		performance.now = (function () {
			return performance.now ||
				performance.mozNow ||
				performance.msNow ||
				performance.oNow ||
				performance.webkitNow ||
				function () {
					return Date.now();
				};
		})();
	})();

	function TaskScheduler() {}

	TaskScheduler.maxTimePerFrame = 50;

	// Engine loop must be disabled while running this
	TaskScheduler.each = function (queue) {
		var promise = new RSVP.Promise();
		var i = 0;

		function process() {
			var startTime = performance.now();
			while (i < queue.length && performance.now() - startTime < TaskScheduler.maxTimePerFrame) {
				queue[i]();
				i++;
			}

			if (i < queue.length) {
				// REVIEW: 4ms is 'lagom'? Should this number be hard-coded?
				//! AT: 4 ms is the minimum amount as specified by the HTML standard
				setTimeout(process, 4);
			} else {
				promise.resolve();
			}
		}

		process();

		return promise;
	};

	return TaskScheduler;
});