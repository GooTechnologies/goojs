// jshint node:true
'use strict';

var dependency = require('./dependency');
var util = require('./util');

function pathToIdentifier(modulePath) {
	return util.safenIdentifier(util.extractModuleName(modulePath));
}

function transform(modulePath, source) {
	var funcStart = source.indexOf('function');
	var funcEnd = source.lastIndexOf('}');
	var func = source.slice(funcStart, funcEnd + 1);

	var paths = dependency.parseModulePaths(source);
	var moduleRefs = paths.map(function (path) {
		return 'goo.' + pathToIdentifier(path);
	});

	return 'goo.' + pathToIdentifier(modulePath) + ' = (' +
		func +
		')(' + moduleRefs.join(',') + ');';
}

exports.transform = transform;