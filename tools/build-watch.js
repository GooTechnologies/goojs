// jshint node:true
'use strict';

var exec = require('child_process').exec;
var watch = require('node-watch');

var minifier = require('./minifier');


var lastTime;
function getTime() {
	var now = Date.now();
	var delta = now - lastTime;
	lastTime = now;
	return (delta / 1000).toFixed(2);
}



function isPack(file) {
	return file.indexOf('pack') !== -1;
}

function getPackName(file) {
	return file.match(/\/(\w+pack)/)[1];
}

function getPackPath(file) {
	return file.slice(4, file.indexOf('pack') + 4);
}

function buildEngine() {
	getTime();
	console.log('Minifying the engine...');
	exec('grunt minify-engine-dev', null, function (error, stdout, stderr) {
		if (error) { throw error; }
		console.log('Done; completed in ' + getTime() + 's');
	});
}

function buildPack(packName, packPath) {
	getTime();
	console.log('Minifying pack ' + packName + '...');
	minifier.run(
		'src',
		packPath,
		'out/' + packName + '.js',
		{ minifyLevel: null },
		function () {
			console.log('Done; completed in ' + getTime() + 's');
		}
	);
}

function run() {
	watch('src', function (file) {
		if (isPack(file)) {
			var packName = getPackName(file);
			var packPath = getPackPath(file);
			buildPack(packName, packPath);
		} else {
			buildEngine();
		}
	});
}

exports.run = run;