'use strict';

var exec = require('child_process').exec;

exec('git diff --staged --name-status', function (error, stdout, stderr) {
	var expression = /^[MA]\s+([\w-\\\/]+\.js)$/gm;
	var files = [];
	var match;

	while (match = expression.exec(stdout)) {
		files[files.length] = match[1];
	}

	var child = exec('jshint --reporter=tools/jshint-reporter.js ' + files.join(' '));

	child.stdout.on('data', function (data) {
		process.stdout.write(data);
	});

	child.on('exit', function (code) {
		if (code !== 0) {
			process.stdout.write('At least one of the files you are trying to commit have style errors (see the above output). If you still wish to commit your code, run git commit -n to skip this check.');
			process.exit(1);
		} else {
			process.exit(0);
		}
	});
});
