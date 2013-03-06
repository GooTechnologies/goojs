'use strict';

var exec = require('child_process').exec;
/* REVIEW: how about using git diff --staged --name-status instead? Then

	rx = /^[MA]\s+([\w-\\\/]+\.js)$/gm;
	files = [];
	while(m = rx.exec(stdout)) {
		files.push(m[1]);
	}
*/

exec('git status', function (error, stdout, stderr) {
	var lines = stdout.split('\n');

	if (lines.length > 0) {
		var files = [];
		var expression = /(new file|modified)\:\s*(\S+\.js)\s*/;

		lines.forEach(function (line) {
			var match = expression.exec(line);

			if (match) {
				files[files.length] = match[2];
			}
		});

		var child = exec('jshint --reporter=tools/jshint-reporter.js ' + files.join(' '));

		child.stdout.on('data', function (data) {
			process.stdout.write(data);
		});

		child.on('exit', function (code) {
			if (code !== 0) {
				process.stdout.write('One or more of the files you are trying to commit have style errors (see the above output). Are you sure you want to commit? [y/n] ');

				var stdin = process.stdin;

				//stdin.setRawMode(true);
				stdin.resume();
				//stdin.setEncoding('utf8');

				stdin.on('data', function (key) {
					if (key === 'y' || key === 'Y') {
						process.stdout.write(key);
						process.exit(0);
					} else if (key === 'n' || key === 'N') {
						process.stdout.write(key);
						process.exit(1);
					}
				});
			} else {
				process.exit(0);
			}
		});
	}
});
