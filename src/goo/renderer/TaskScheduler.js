define([], function () {
	'use strict';

	// REVIEW: Use a function instead? Anynomous objects are not very debug friendly
	// REVIEW: function TaskScheduler(){}
	var TaskScheduler = {};

	TaskScheduler.maxTimePerFrame = 50;

	// Engine loop must be disabled while running this
	TaskScheduler.each = function (queue, onComplete) {
		// REVIEW: Replace onComplete callback for promise? Looks kinda weird to mix promises and callbacks in the loadScene.js template file
		var i = 0;

		function process() {
			// REVIEW: I dont think performance.now is supported in all browsers, particularly on mobile. Shim?
			var startTime = performance.now();
			while (i < queue.length && performance.now() - startTime < TaskScheduler.maxTimePerFrame) {
				queue[i]();
				i++;
			}

			if (i < queue.length) {
				// REVIEW: 4ms is 'lagom'? Should this number be hard-coded?
				setTimeout(process, 4);
			} else {
				onComplete();
			}
		}

		process();
	};

	return TaskScheduler;
});