(function () {
	'use strict';

	// can be anything form console.log() to send via webstockets if launched on another computer, to an html reporter
	var ConsoleReporter = {
		post: function (description, measurement) {
			var message = description + ' took {' +
				' min: ' + measurement.min +
				', avg: ' + measurement.avg +
				', max: ' + measurement.max + ' } milliseconds to execute';
			console.log(message);
		}
	};

	var HtmlReporter = {
		post: function (description, measurement) {
			var entry = document.createElement('div');
			entry.classList.add('entry');

			// quick-n-dirty
			entry.innerHTML = description + ' <span class="entry-measurements">min: ' + measurement.min.toFixed(3) +
				' avg: ' + measurement.avg.toFixed(3) +
				' max: ' + measurement.max.toFixed(3) +
				'</span>';

			document.body.appendChild(entry);
		}
	};
// =====================================================================================================================
	var reporter = HtmlReporter;

	// keeps the list of tasks to execute
	var queue = [];

	// measures how much did it take for a function to execute
	function measureDuration(fun) {
		var startTime = window.performance.now();
		fun();
		var endTime = window.performance.now();
		var timeDiff = endTime - startTime;
		return timeDiff;
	}

	// repeatedly measures how much did a function take to execute
	function repeat(times, fun) {
		// run a couple of times to get the JIT to do its thing
		var preMeasureIterations = Math.min(times / 4, 101); // 101 (just in case 100 is the magic number to trigger the optimizer)
		for (var i = 0; i < times; i++) {
			fun();
		}

		// run to measure
		var min = Number.MAX_VALUE;
		var avg, sum = 0;
		var max = Number.MIN_VALUE;
		for (var i = 0; i < times; i++) {
			var duration = measureDuration(fun);
			if (duration > max) {
				max = duration;
			}
			if (duration < min) {
				min = duration;
			}
			sum += duration;
		}
		avg = sum / times;
		return { min: min, avg: avg, max: max };
	}

	// schedules a measurement
	function responseTime(description, times, fun) {
		queue.push(function () {
			var measurement = repeat(times, fun);
			reporter.post(description, measurement);
		});
	}

	// releases the kraken; also starts the tests
	function stress() {
		if (queue.length) {
			var task = queue.pop();
			task();
			setTimeout(stress, 4);
		}
	}

	// can taint window; this will only be used while stress-testing
	window.responseTime = responseTime;
	window.stress = stress;
})();