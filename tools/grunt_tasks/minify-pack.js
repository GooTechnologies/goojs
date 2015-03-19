// jshint node:true
'use strict';

var minifier = require('../minifier');

module.exports = function (grunt) {
	grunt.registerMultiTask('minify-pack', function () {
		var done = this.async();

		minifier.run(
			this.data.rootPath,
			this.data.packPath,
			'out/' + this.data.packName + '.js',
			{ minifyLevel: this.data.minifyLevel },
			done
		);
	});
};
