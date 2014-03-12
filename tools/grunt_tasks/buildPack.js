module.exports = function (grunt) {
	var requirejs = require('requirejs');
	var madge = require('madge');
	var fs = require('fs');
	var colors = require('colors');

	/**
	 * Converts all backslashes to slashes
	 * @param str
	 * @returns {*}
	 */
	function slash(str) {
		return str.replace(/\\/g, '/');
	}

	/**
	 * Gathers a list of modules and one of dependencies
	 * @param tree
	 * @returns {{moduleList: Array, ignoreList: Array}}
	 */
	function getModulesAndDependencies(tree) {
		var moduleList = [];
		var ignoreList = [];

		for (var module in tree) {
			var dependencies = tree[module];

			moduleList.push(slash(module));

			var re = /goo\/[^\/]+pack\//
			dependencies.forEach(function(dependency) {
				if (!re.test(dependency)) {
					if (ignoreList.indexOf(dependency) === -1) {
						ignoreList.push(dependency);
					}
				}
			});
		}

		return {
			moduleList: moduleList,
			ignoreList: ignoreList
		};
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

	/**
	 * Builds an empty module that requires every other module in the pack
	 * @param moduleList
	 * @param packName
	 * @returns {string}
	 */
	function buildPack(moduleList, packName) {
		var lines = [];

		lines.push('require([');

		moduleList.forEach(function (moduleName) {
			if (packName !== moduleName) {
				lines.push('\t"goo/' + packName + '/' + moduleName + '",');
			}
		});

		if (global) {
			lines.push('], function (');

			var fileNames = moduleList.filter(function (moduleName) { return packName !== moduleName; })
				.map(extractFilename);

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

	/**
	 * Create the optimizer configuration
	 * @param {string} packName
	 * @param {string} ignoreList
	 * @returns {{baseUrl: string, out: string, name: string, paths: {}}}
	 */
	function getOptimizerConfig(packName, ignoreList, outBaseDir) {
		var paths = {};

		ignoreList.forEach(function (ignoreItem) {
			paths[ignoreItem] = 'empty:';
		});

		var config = {
			baseUrl: 'src/',
			name: 'goo/' + packName + '/' + packName,
			out: outBaseDir + '/' + packName + '.js',
			paths: paths
		};

		return config;
	}

	function wrap(fileName, head, tail) {
		fs.readFile(fileName, function (err, data) {
			if (err) { throw err; }
			var wrapped = head + data + tail;
			fs.writeFile(fileName, wrapped, function (err) {
				if (err) { throw err; }
				console.log('Done wrapping'.green);
			});
		});
	}

	function getHeadWrapping(packName, version) {
		return '/* Goo Engine ' + packName + ' ' + version + '\n' +
			' * Copyright 2014 Goo Technologies AB\n' +
			' */\n' +
			'(function(window){function f(){\n';
	}

	function getTailWrapping(packName) {
		return '\n' +
			'}if(window.localStorage&&window.localStorage.gooPath){\n' +
				'window.require.config({\n' +
					'paths:{goo:localStorage.gooPath}\n' +
				'});\n' +
			'}else f()\n' +
			'})(window,undefined)';
	}

	grunt.registerMultiTask('build-pack', 'Minifies a pack', function () {
		var packName = this.data.packName;
		var version = grunt.option('goo-version') || '';
		var outBaseDir = this.data.outBaseDir || 'out';
		var done = this.async();

		// get all dependencies
		console.log('get all dependencies'.grey);
		var tree = madge('src/goo/' + packName + '/', { format: 'amd' }).tree;

		// get modules and dependencies
		console.log('get modules and engine dependencies'.grey);
		var modulesAndDependencies = getModulesAndDependencies(tree);

		// get the source for the pack
		console.log('get the source for the pack'.grey);
		var packStr = buildPack(modulesAndDependencies.moduleList, packName);

		// add the pack
		console.log('add the pack');
		fs.writeFile('src/goo/' + packName + '/' + packName + '.js', packStr, function (err) {
			if (err) {
				console.error('Error while writing the pack'.red);
				console.error(err);
				done(false);
			}

			// get the config for the optimizer
			console.log('get the config for the optimizer'.grey);
			var optimizerConfig = getOptimizerConfig(packName, modulesAndDependencies.ignoreList, outBaseDir);

			// optimize!
			console.log('optimize!');
			requirejs.optimize(optimizerConfig, function (buildResponse) {
				// buildResponse is just a text output of the modules included.

				console.log('Done optimizing'.green);

				console.log('Pack Name: '.grey, packName);

				console.log('Module List'.grey);
				console.log(modulesAndDependencies.moduleList);

				console.log('-----'.grey);
				console.log('Ignore List'.grey);
				console.log(modulesAndDependencies.ignoreList);

				wrap(outBaseDir + '/' + packName + '.js', getHeadWrapping(packName, version), getTailWrapping(packName));

				done();
			}, function(err) {
				// optimization err callback
				// :(
				console.error(err.red);
				done(false);
			});
		});
	});
};
