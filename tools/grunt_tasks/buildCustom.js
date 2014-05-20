module.exports = function (grunt) {
	'use strict';

	var requirejs = require('requirejs');
	var madge = require('madge');
	var fs = require('fs');
	var colors = require('colors');


	/**
	 * Extracts the name of a file from a complete path
	 * @param path
	 * @returns {string}
	 */
	function extractFilename(path) {
		var index = path.lastIndexOf('/');
		return index === -1 ? path : path.substr(index + 1);
	}


	function getModulesAndDependencies2(tree, folder) {
		var moduleList = [];
		var ignoreList = [];
		for (var module in tree) {
			var dependencies = tree[module];
			moduleList.push(folder + '/' + module);
			dependencies.forEach(function (dependency) {
				moduleList.push(dependency);
			});
		}

		return {
			moduleList: moduleList,
			ignoreList: ignoreList
		};
	}

	function buildPack2(moduleList, packPath, packName) {
		var lines = [];

		lines.push('require([');

		moduleList.forEach(function (moduleName) {
			if (packName !== moduleName) { // packPath ?
				lines.push('\t"'+moduleName+'",');
			}
		});

		// what is this?
		if (global) {
			lines.push('], function (');

			var fileNames = moduleList.filter(function (moduleName) {
				return packName !== moduleName;  // packPath ?
			}).map(extractFilename);

			lines.push('\t' + fileNames.join(',\n\t'));

			lines.push(') {');
			lines.push('\tvar goo = window.goo;\n\tif (!goo) { return; }');
			fileNames.forEach(function (fileName) {
				lines.push('\tgoo.' + fileName + ' = ' + fileName + ';');
			});
		} else {
			lines.push('], function () {');
		}

		lines.push('});');

		var str = lines.join('\n');
		return str;
	}


	grunt.registerMultiTask('build-custom', 'Builds a custom bundle', function () {
		var modules = grunt.option('modules');
		if (!modules) {
			throw new Error('Please provide --modules=module1,module2,...');
		}
		modules = modules.split(',');
		var version = grunt.option('goo-version') || grunt.config.data.pkg.version;
		var outFile = grunt.option('outFile') || 'bundle.js';
		var done = this.async();

		// get all dependencies
		var tree = madge('src/' + modules[0], { format: 'amd' }).tree;
		grunt.log.ok('Got dependencies');

		// get modules and dependencies
		grunt.log.writeln('get modules and dependencies');
		var modulesAndDependencies = getModulesAndDependencies2(tree, modules[0]);

		// get the source for the pack
		grunt.log.writeln('get the source');
		var packStr = buildPack2(modulesAndDependencies.moduleList, 'custombuild', 'custombuild');

		// add the pack
		grunt.log.writeln('add the pack');
		fs.writeFile(outFile, packStr, function (err) {
			if (err) {
				grunt.log.error('Error while writing the pack');
				grunt.log.error(err);
				done(false);
			}

			// get the config for the optimizer
			grunt.log.writeln('get the config for the optimizer');
			var optimizerConfig = {
				baseUrl: 'src/',
				name: 'goo/custombuild/bundle',
				out: outFile,
				paths: {
					'goo/custombuild': '../'
				}
			};

			// optimize!
			grunt.log.writeln('optimize!');
			requirejs.optimize(optimizerConfig, function (buildResponse) {
				// buildResponse is just a text output of the modules included.

				grunt.log.ok('Done optimizing');

				grunt.log.writeln('Pack Name: ', 'custombuild');

				grunt.log.writeln('Module List');
				grunt.log.writeln(modulesAndDependencies.moduleList);

				grunt.log.writeln('-----');
				grunt.log.writeln('Ignore List');
				grunt.log.writeln(modulesAndDependencies.ignoreList);

				wrap(outFile, getHeadWrapping('custombuild', 'custombuild', version), getTailWrapping('custombuild', 'custombuild'), done);
			}, function (err) {
				// optimization err callback
				// :(
				grunt.log.error(err);
				done(false);
			});
		});
	});
};