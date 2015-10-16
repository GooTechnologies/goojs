// jshint node:true
/* jshint strict: false, evil: true */
var fs = require('graceful-fs');
var file = require('file');

var tree;
var countdown;

// ===
function Countdown(value, callback) {
	this.value = value;
	this.callback = callback;
}

Countdown.prototype.solve = function (n) {
	n = typeof n === 'undefined' ? 1 : n;

	this.value -= n;

	if (this.value < 0) { console.warn('Solved too many pending items'); }
	if (this.value <= 0) {
		this.callback();
	}
};

Countdown.prototype.enqueue = function (n) {
	n = typeof n === 'undefined' ? 1 : n;

	this.value += n;
};
// ===

function trimPrefix(string, prefix) {
	if (string.substr(0, prefix.length) === prefix) {
		return string.substr(prefix.length);
	} else {
		return string;
	}
}

function trimSuffix(string, suffix) {
	if (string.substr(string.length - suffix.length) === suffix) {
		return string.substr(0, string.length - suffix.length);
	} else {
		return string;
	}
}

function getProperFileName(fileName) {
	return fileName.replace(/\\/g, '/');
}

function parseModulePaths(source) {
	var startArray = source.indexOf('[');
	var endArray = source.indexOf(']');
	var firstFunction = source.indexOf('function');

	var arrayStr = source.substring(startArray, endArray + 1);

	if (endArray === -1 || (endArray > -1 && firstFunction < endArray)) {
		return [];
	} else {
		// JSON.parse would choke on a lot of things (comments, single quotes, etc)
		return eval(arrayStr);
	}
}

function parseModuleBindings(source) {
	var firstFunction = source.indexOf('function');
	var startList = source.indexOf('(', firstFunction);
	var endList = source.indexOf(')', startList);

	var listStr = source.slice(startList + 1, endList);

	if (listStr.indexOf(',') === -1) {
		return [];
	} else {
		return listStr.split(',').map(function (parameter) {
			return parameter.trim();
		});
	}
}

function getDependencies(fileName, callback) {
	fs.readFile(fileName, 'utf8', function (err, source) {
		if (err) { throw err; }

		var modulePaths = parseModulePaths(source);

		var properFileName = getProperFileName(fileName);

		callback(properFileName, modulePaths);
	});
}

function getTree(rootPath, callback) {
	tree = {};
	countdown = new Countdown(1, callback.bind(null, tree));

	var solvedDependencies = function (properFileName, array) {
		var trimmed = trimPrefix(properFileName, rootPath);
		tree[trimmed] = array;
		countdown.solve();
	};

	file.walk(rootPath, function (unused, dirPath, dirs, files) {
		// solve a dir
		countdown.enqueue(dirs.length);
		countdown.enqueue(files.length);
		countdown.solve();

		files.forEach(function (file) { getDependencies(file, solvedDependencies); });
	});
}

function getDependants(rootPath, fileName, callback) {
	getTree(rootPath, function (tree) {
		var trimmed = trimSuffix(trimPrefix(fileName, rootPath), '.js');
		var dependants = [];

		for (var moduleName in tree) {
			var module = tree[moduleName];

			if (module.indexOf(trimmed) !== -1) {
				dependants.push(moduleName);
			}
		}

		var properFileName = getProperFileName(fileName);

		callback(properFileName, dependants);
	});
}

exports.getTree = getTree;
exports.getDependencies = getDependencies;
exports.getDependants = getDependants;
exports.parseModulePaths = parseModulePaths;
exports.parseModuleBindings = parseModuleBindings;