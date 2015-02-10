module.exports = function (grunt) {
	'use strict';

	var glob = require('glob');
	var fs = require('fs');
	var exec = require('child_process').exec;

	var preprocess = require('../preprocessor').preprocess;

	grunt.registerMultiTask('preprocess', function () {
		var done = this.async();

		var defines = this.data.defines || {};

		exec('rm -rf src-preprocessed', function () {
			exec('mkdir src-preprocessed && cp -r src/* src-preprocessed', function (error, stdout, stderr) {
				var files = glob.sync('src-preprocessed/**/*.js');

				files.forEach(function (file) {
					var source = fs.readFileSync(file, { encoding: 'utf8' });
					var preprocessed = preprocess(source, defines);

					fs.writeFileSync(file, preprocessed);
				});

				done();
			});
		});
	});
};
