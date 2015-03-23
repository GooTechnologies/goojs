'use strict';

function preprocess(source, defines) {
	var lines = source.split('\n');

	// stack of accumulated write states
	var stack = [true];

	var regex = /^\s*\/\/\s*#(.+)/;

	// current state is whatever the top of the stack is
	var getState = function () {
		return stack[stack.length - 1];
	};

	var filtered = lines.filter(function (line) {
		var match = line.match(regex);
		if (match) {
			if (match[1].slice(0, 5) === 'ifdef') {
				var label = match[1].slice(match[1].indexOf(' ') + 1);
				var newState = getState() && !!defines[label];
				stack.push(newState);
			} else if (match[1] === 'endif') {
				if (stack.length <= 1) {
					console.error('Stack underflow! Encountered too many #endif');
				}
				stack.pop();
			}
			return false;
		}
		return getState();
	});

	if (stack.length > 1) {
		console.error('Missing #endif');
	}

	return filtered.join('\n');
}

exports.preprocess = preprocess;