module.exports = function (grunt) {
	'use strict';

	var requirejs = require('requirejs');
	var madge = require('madge');
	var fs = require('fs');
	var colors = require('colors');
	var filesize = require('filesize');

	function wrap(fileName, head, tail, callback) {
		fs.readFile(fileName, function (err, data) {
			if (err) { throw err; }
			var wrapped = head + data + tail;
			fs.writeFile(fileName, wrapped, function (err) {
				if (err) { throw err; }
				grunt.log.ok('Done wrapping');
				callback();
			});
		});
	}

	function getHeadWrapping(packName, version) {
		return '/* Goo Engine ' + packName + ' ' + version + '\n' +
			' * Copyright 2014 Goo Technologies AB\n' +
			' */\n' +
			'(function(window){function f(){\n';
	}

	function getTailWrapping() {
		return ['',
			'}try{',
				'if(window.localStorage&&window.localStorage.gooPath){',
					'window.require.config({',
						'paths:{goo:localStorage.gooPath}',
					'});',
				'}else f()',
			'}catch(e){f()}',
			'})(window,undefined)'
		].join('\n');
	}

	/**
	 * Extracts the name of a file from a complete path
	 * @param path
	 * @returns {string}
	 */
	function extractFilename(path) {
		var index = path.lastIndexOf('/');
		return index === -1 ? path : path.substr(index + 1);
	}


	function getModulesAndDependencies(tree, folder) {
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

	function buildPack(moduleList, packPath, packName) {
		var lines = [];

		lines.push('require([');

		moduleList.forEach(function (moduleName) {
			if (packName !== moduleName) { // packPath ?
				lines.push('\t"' + moduleName + '",');
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

	function getModulesAndDependencies2(baseUrl, modules, moduleList, printDebug){
		for(var i=0; i<modules.length; i++){
			// Madge only takes folders as arguments for some reason
			var idx = modules[i].lastIndexOf('/');
			var parentPath = modules[i].substr(0, idx);
			var moduleName = modules[i].substr(idx + 1);
			var folder = baseUrl + parentPath;
			var tree = madge(folder, { format: 'amd' }).tree;

			var module = parentPath + '/' + moduleName;
			var dependencies = tree[moduleName];

			if(moduleList.indexOf(module) === -1){
				moduleList.push(module);
			}
			dependencies.forEach(function (dependency) {
				if(moduleList.indexOf(dependency) === -1){
					moduleList.push(dependency);
					getModulesAndDependencies2(baseUrl, [dependency], moduleList);

					if(printDebug){
						grunt.log.writeln(module,'--->',dependency)
					}
				}
			});
		}

		return moduleList;
	}

	grunt.registerMultiTask('build-custom', 'Builds a custom bundle', function () {
		var modules = grunt.option('modules');
		if (!modules) {
			throw new Error('Please provide --modules=module1,module2,...');
		}
		var baseUrl = 'src/';
		modules = modules.split(',');
		var version = grunt.option('goo-version') || grunt.config.data.pkg.version;
		var outFile = grunt.option('outFile') || 'bundle.js';
		var done = this.async();

		// get modules and dependencies
		grunt.log.writeln('get modules and dependencies');
		var modulesAndDependencies = [];
		getModulesAndDependencies2(baseUrl, modules, modulesAndDependencies);
		modulesAndDependencies.sort();

		// get the source for the pack
		grunt.log.writeln('get the source');
		var packStr = buildPack(modulesAndDependencies, 'custombuild', 'custombuild');

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
				baseUrl: baseUrl,
				name: 'goo/custombuild/' + outFile.replace('.js',''),
				out: outFile,
				paths: {
					'goo/custombuild': '../'
				}
			};
			var optimizeOption = grunt.option('optimize');
			if(optimizeOption){
				optimizerConfig.optimize = optimizeOption;
			}

			// optimize!
			grunt.log.writeln('Optimizing...');
			requirejs.optimize(optimizerConfig, function (buildResponse) {
				// buildResponse is just a text output of the modules included.
				grunt.log.ok('Done optimizing');

				grunt.log.writeln(modulesAndDependencies.join('\n'));

				var head = getHeadWrapping('custom build', version);
				var tail = getTailWrapping();
				wrap(outFile, head, tail, done);

				var bytes = fs.statSync(outFile)["size"];

				grunt.log.ok(outFile + ' written (' + filesize(bytes, {unix: true}) + ')');

			}, function (err) {
				grunt.log.error(err);
				done(false);
			});
		});
	});
};