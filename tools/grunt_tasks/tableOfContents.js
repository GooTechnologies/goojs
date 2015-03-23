module.exports = function (grunt) {
	'use strict';

	var toc = require('../toc');

	grunt.registerMultiTask('generate-toc', 'Minifies a pack', function () {
//		var done = this.async(); // no need, toc does everything sync
		var path = this.data.path;
		var title = this.data.title;

		toc.run(path, title);
	});
};
