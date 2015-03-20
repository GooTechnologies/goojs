// jshint node:true

/**
 * Minifies and require-ifies a subdir of src/goo - will exclude any external dependencies (anything outside of this dir) from the resulting 'pack'.
 * Usage:
 *
 * node tools/minifyDir.js sourceDirectory [outFileName='out/directoryName.js']
 * sourceDirectory must be under 'src/goo'
 *
 * Ex: if you want to minify only the contents of 'src/goo/math' then sourceDirectory is 'math'
 */

'use strict';

var requirejs = require('requirejs');
var madge = require('madge'); //! AT: this library returns false negatives
var fs = require('fs');
require('colors');

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
 * @param packPath
 * @returns {{moduleList: Array, ignoreList: Array}}
 */
function getModulesAndDependencies(tree, packPath) {
	var moduleList = [];
	var ignoreList = [];

	// var re = /goo\/[^\/]+pack\//;

	//! AT: not sure if nested '+)+' here will do a combinatorial explosion here
	// {1,3} should be enough for everyone
	// var regexp = new RegExp('goo(?:\\\/[^\\\/]+){0,2}\\\/' + packName + '\\/');

	for (var module in tree) {
		var dependencies = tree[module];

		moduleList.push(slash(module));

		dependencies.forEach(function (dependency) {
			if (dependency.indexOf(packPath) === -1 && ignoreList.indexOf(dependency) === -1) {
				ignoreList.push(dependency);
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
 * @param packPath
 * @param packName
 * @returns {string}
 */
function buildPack(moduleList, packPath, packName) {
	var lines = [];

	lines.push('require([');

	var filteredModuleList = moduleList.filter(function (moduleName) {
		return packName !== moduleName;  // packPath ?
	});

	//! AT: use map & join to not get that last comma
	filteredModuleList.forEach(function (moduleName) {
		lines.push('\t"goo/' + packPath + '/' + moduleName + '",');
	});

	// what is this?
	if (global) {
		lines.push('], function (');

		var fileNames = filteredModuleList.map(extractFilename);

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
 * @param {string} packPath
 * @param {string} packName
 * @param {string} ignoreList
 * @param {string} outFileName
 * @returns {{baseUrl: string, out: string, name: string, paths: {}}}
 */
function getOptimizerConfig(packPath, packName, ignoreList, outFileName) {
	var paths = {};

	ignoreList.forEach(function (ignoreItem) {
		paths[ignoreItem] = 'empty:';
	});

	var config = {
		baseUrl: 'src/',
		name: 'goo/' + packPath + '/' + packName,
		out: outFileName,
		paths: paths
	};

	return config;
}

function wrap(fileName, head, tail, callback) {
	fs.readFile(fileName, function (err, data) {
		if (err) { throw err; }
		var wrapped = head + data + tail;
		fs.writeFile(fileName, wrapped, function (err) {
			if (err) { throw err; }
			console.log('Done wrapping'.green);
			callback();
		});
	});
}

function getHeadWrapping(packName, version) {
	return '/* Goo Engine ' + packName + ' ' + version + '\n' +
		' * Copyright 2015 Goo Technologies AB\n' +
		' */';
}

function getTailWrapping(packName) {
	return '';
}

if (process.argv.length < 3) {
	console.error('Invalid parameters; consult the top-level jsdoc');
	return;
}

var packPath = process.argv[2];
var packName = extractFilename(packPath);
var version = '';
var outFileName = process.argv[3] || 'out/' + packName + '.js';

// get all dependencies
console.log('get all dependencies'.grey);
var tree = madge('src/goo/' + packPath + '/', { format: 'amd' }).tree;

// get modules and dependencies
console.log('get modules and engine dependencies'.grey);
var modulesAndDependencies = getModulesAndDependencies(tree, packPath);

// get the source for the pack
console.log('get the source for the pack'.grey);
var packStr = buildPack(modulesAndDependencies.moduleList, packPath, packName);

// add the pack
console.log('add the pack');
fs.writeFile('src/goo/' + packPath + '/' + packName + '.js', packStr, function (err) {
	if (err) {
		console.error('Error while writing the pack'.red);
		console.error(err);
		process.exit(1);
	}

	// get the config for the optimizer
	console.log('get the config for the optimizer'.grey);
	var optimizerConfig = getOptimizerConfig(packPath, packName, modulesAndDependencies.ignoreList, outFileName);

	// optimize!
	console.log('optimize!');
	requirejs.optimize(optimizerConfig, function (buildResponse) {
		// buildResponse is just a text output of the modules included.

		console.log('Done optimizing'.green);

		console.log('Pack Name: '.grey, packPath);

		console.log('Module List'.grey);
		console.log(modulesAndDependencies.moduleList);

		console.log('-----'.grey);
		console.log('Ignore List'.grey);
		console.log(modulesAndDependencies.ignoreList);

		wrap(outFileName, getHeadWrapping(packName, version), getTailWrapping(packName), function () {
			console.log(('Done minifying directory ' + packPath).green);
		});
	}, function (err) {
		// optimization err callback
		// :(
		console.error(err);
		process.exit(1);
	});
});
