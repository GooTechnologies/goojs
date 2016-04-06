var childProcess = require('child_process');
var path = require('path');

var exec = childProcess.exec;
var spawn = childProcess.spawn;

function fail(message) {
	process.stdout.write(message);
	process.exit(1);
}

exec('git diff --staged --name-status', function (error, stdout, stderr) {
	if (error) {
		fail(stderr + '\nCould not get list of modified files: ' + error);
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

	var args = [path.resolve('./node_modules/eslint/bin/eslint')].concat(files);
	var child1 = spawn('node', args, { stdio: 'inherit' });

	child1.on('exit', function (code) {
		if (code !== 0) {
			fail('Style check failed (see the above output). If you still wish to commit your code, run git commit -n to skip this check.\n');
		} else {
			process.exit(0);
		}
	});
});
