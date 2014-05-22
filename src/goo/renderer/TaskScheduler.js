define([], function () {
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
	TaskScheduler.each = function (queue, onComplete) {
		// REVIEW: Replace onComplete callback for promise? Looks kinda weird to mix promises and callbacks in the loadScene.js template file
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
				onComplete();
			}
		}

		process();
	};

	return TaskScheduler;
});