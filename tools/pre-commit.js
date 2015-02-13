// jshint node:true
'use strict';

var exec = require('child_process').exec;
var path = require('path');
var getAverageLength = require('./function-length').getAverageLength;

function fail(message) {
	process.stdout.write(message);
	process.exit(1);
}

function getModifiedFiles(callback) {
	exec('git diff --staged --name-status', function (error, stdout, stderr) {
		if (error) {
			fail(stderr + '\nCould not get list of modified files: ' + error);
		}

		var expression = /^[MA]\s+([\w\\\/-]+\.js)$/gm;
		var files = [];
		var match;

		while (match = expression.exec(stdout)) {
			files.push(match[1]);
		}
		if (files.length === 0) {
			process.exit(0);
		}

		callback(files);
	});
}

function runJSHint(files) {
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
}

function readdModifiedFiles(files, callback) {
	exec('git add ' + files.join(' '), function (error, stdout, stderr) {
		callback(files);
	});
}

exec('node ./tools/cycleDetector.js', function (error, stdout, stderr) {
	process.stdout.write(stdout + '\n');

	if (error) { fail('Fix the cycle before committing!\n'); }

	getModifiedFiles(function (files) {
		exec('git stash', function (error, stdout, stderr) {
			var oldAverageLength = getAverageLength();

			exec('git stash pop', function (error, stdout, stderr) {
				var currentAverageLength = getAverageLength();

				var delta = currentAverageLength - oldAverageLength;
				var ratio = delta / oldAverageLength;
				var percent = (ratio * 100).toFixed(2);

				console.log(
					'You have ' + (delta > 0 ? 'increased' : 'decreased') +
					' the average function length of the engine by ' + Math.abs(percent) + '%\n'
				);

				if (delta > 0) {
					fail(
						'Consider refactoring your code before committing!\n' +
						'If you still wish to commit your code, run git commit -n to skip this check.\n'
					);
				}

				readdModifiedFiles(files, runJSHint);
			});
		});
	});
});