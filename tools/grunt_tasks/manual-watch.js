// jshint node:true
'use strict';

var buildWatch = require('../build-watch.js');

module.exports = function (grunt) {
	grunt.registerTask('manual-watch', function () {
		buildWatch.run();
	});
};
