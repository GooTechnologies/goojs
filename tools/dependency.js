/*jshint strict: false, evil: true */
/* global exports */
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

function getDependencies(fileName, callback) {
	fs.readFile(fileName, 'utf8', function (err, data) {
		if (err) { throw err; }

		var startArray = data.indexOf('[');
		var endArray = data.indexOf(']');
		var firstFunction = data.indexOf('function');

		var arrayStr = data.substring(startArray, endArray + 1);

		/*
		// this will choke on a lot of stuff (extra comma at the end, comments, ...)
		arrayStr = arrayStr.replace(/'/g, '"');
		try {
			var array = JSON.parse(arrayStr);
		} catch(e) {
			console.log('--- error ---');
			console.log(arrayStr);
			throw e;
		}
		*/

		var array;
		if (endArray === -1 || (endArray > -1 && firstFunction < endArray)) {
			array = [];
		} else {
			array = eval(arrayStr);
		}

		var properFileName = getProperFileName(fileName);

		callback(properFileName, array);
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

exports.Dependency = {
	getTree: getTree,
	getDependencies: getDependencies,
	getDependants: getDependants
};