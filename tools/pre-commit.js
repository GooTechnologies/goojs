'use strict';

var exec = require('child_process').exec;
var path = require('path');

function fail() {
	process.stdout.write(
		'Style check failed (see the above output).\n' +
		'If you still wish to commit your code, run git commit -n to skip this check.\n'
	);
	process.exit(1);
}

exec('git diff --staged --name-status', function (error, stdout, stderr) {
	if (error) {
		process.stdout.write(stderr + '\nCould not get list of modified files: ' + error);
		fail();
	}
	var expression = /^[MA]\s+([\w-\\\/]+\.js)$/gm;
	var files = [];
	var match;

	while (match = expression.exec(stdout)) {
		files.push(match[1]);
	}
	if (files.length === 0) {
		process.exit(0);
	}

	var command = path.resolve('./node_modules/.bin/jshint');
	var child = exec(command + ' --reporter=tools/jshint-reporter.js ' + files.join(' '));

	child.stdout.on('data', function (data) {
		process.stdout.write(data);
	});
	child.stderr.on('data', function (data) {
		process.stderr.write(data);
	});

	child.on('exit', function (code) {
		if (code !== 0) {
			fail();
		} else {
			process.exit(0);
		}
	});
});

