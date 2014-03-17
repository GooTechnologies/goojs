var fs = require('fs');
var colors = require('colors');
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

		var properFileName = fileName.replace(/\\/g, '/');

		callback(properFileName, array);
	});
}

function getTree(rootPath, callback) {
	tree = {};
	countdown = new Countdown(1, callback.bind(null, tree));

	var solvedDependencies = function (properFileName, array) {
		tree[properFileName] = array;
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

exports.Dependency = {
	getTree: getTree,
	getDependencies: getDependencies
};