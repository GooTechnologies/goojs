define([], function () {
	'use strict';

	var TaskScheduler = {};

	TaskScheduler.maxTimePerFrame = 50;

	// Engine loop must be disabled while running this
	TaskScheduler.each = function (queue, onComplete) {
		var i = 0;

		function process() {
			var startTime = performance.now();
			while (i < queue.length && performance.now() - startTime < TaskScheduler.maxTimePerFrame) {
				queue[i]();
				i++;
			}

			if (i < queue.length) {
				setTimeout(process, 4);
			} else {
				onComplete();
			}
		}

		process();
	};

	return TaskScheduler;
});