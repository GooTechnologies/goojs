// jshint node:true

module.exports = function (grunt) {
	'use strict';

	var toc = require('../table-of-contents');

	grunt.registerMultiTask('generate-toc', 'Minifies a pack', function () {
		var path = this.data.path;
		var title = this.data.title;

		toc.run(path, title);
	});
};
