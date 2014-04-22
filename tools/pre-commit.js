// jshint node:true
'use strict';

var exec = require('child_process').exec;
var path = require('path');

function fail(message) {
	process.stdout.write(message);
	process.exit(1);
}

exec('node ./tools/cycleDetector.js', null, function (error, stdout, stderr) {
	process.stdout.write(stdout + '\n');

	if (error) {
		fail('Fix the cycle before committing!\n');
	} else {
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
			var child1 = exec(command + ' --reporter=tools/jshint-reporter.js ' + files.join(' '));

			child1.stdout.on('data', function (data) {
				process.stdout.write(data);
			});
			child1.stderr.on('data', function (data) {
				process.stderr.write(data);
			});

			child1.on('exit', function (code) {
				if (code !== 0) {
					fail(
							'Style check failed (see the above output).\n' +
							'If you still wish to commit your code, run git commit -n to skip this check.\n'
					);
				} else {
					process.exit(0);
				}
			});
		});
	}
});