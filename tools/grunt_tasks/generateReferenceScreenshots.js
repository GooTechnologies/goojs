module.exports = function (grunt) {
	'use strict';

	grunt.registerTask('refs', function () {
		var done = this.async();
		require('child_process')
			.exec('node test/e2etesting/generate-reference-screenshots', function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			done();
		});
	});
};