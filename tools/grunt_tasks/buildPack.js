// jshint node:true

module.exports = function (grunt) {
	'use strict';

	var exec = require('child_process').exec;

	var minifyDir = require('../minifyDir');

	/**
	 * Extracts the name of a file from a complete path
	 * @param path
	 * @returns {string}
	 */
	function extractFilename(path) {
		var index = path.lastIndexOf('/');
		return index === -1 ? path : path.substr(index + 1);
	}

	grunt.registerMultiTask('build-pack', 'Minifies a pack', function () {
		var packPath = this.data.packPath;
		var packName = extractFilename(this.data.packPath);
		var version = grunt.option('goo-version') || '';
		var outBaseDir = this.data.outBaseDir || 'out';
		var options = {
			mangle: !!this.data.mangle
		};
		var done = this.async();

		minifyDir.run(packPath, null, options, function (err) {
			exec('node tools/derequire.js ' +
				outBaseDir + '/' + packName + '.js ' +
				outBaseDir + '/' + packName + '.js', function () {
				done();
			});
		});
	});
};
