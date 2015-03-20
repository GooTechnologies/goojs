module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var glob = require('glob');
	var _ = require('underscore');

	function extractFilename(path) {
		var index = path.lastIndexOf('/');
		return index === -1 ? path : path.substr(index + 1);
	}

	function getSafeIdentifier(name) {
		return name.replace(/\W/g, '');
	}

	grunt.registerTask('main-file', 'Generates the "main-file" of goo, that requires every core module and installs it in the global window.goo', function () {
		var done = this.async();

		// prefiltering out files in packs on the 'ground' level
		var sourceFiles = glob.sync('!(*pack)/**/*.js', { cwd: 'src/goo/', nonegate: true });

		// filtering files in packs that are not on the 'ground' level
		var regexp = /.+pack\/.+/;
		sourceFiles = sourceFiles.filter(function (sourceFile) {
			return !regexp.test(sourceFile);
		});

		var allModules = _.map(sourceFiles, function (f) {
			return 'goo/' + f.replace(/\.js/, '');
		});

		var lines = [];
		lines.push('require([');
		lines.push(_.map(allModules, function (m) {
			return "\t'" + m + "'";
		}).join(',\n'));
		lines.push('], function (');

		var fileNames = allModules.map(extractFilename);

		lines.push('\t' + fileNames.map(getSafeIdentifier).join(',\n\t'));
		lines.push(') {');
		lines.push('\tvar goo = window.goo;');
		fileNames.forEach(function (fileName) {
			var safeIdentifier = getSafeIdentifier(fileName);
			lines.push('\tgoo.' + safeIdentifier + ' = ' + safeIdentifier + ';');
		});

		lines.push('});');

		fs.writeFileSync('src/goo.js', lines.join('\n'));
		done();
	});
};