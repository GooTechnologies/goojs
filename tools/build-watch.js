// jshint node:true
'use strict';

var exec = require('child_process').exec;
var watch = require('node-watch');

var minifier = require('./minifier');


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
	console.log('Minifying the engine...');
	exec('grunt minify-engine-dev', null, function (error, stdout, stderr) {
		if (error) { throw error; }
		console.log('Done');
	});
}

function buildPack(packName, packPath) {
	console.log('Minifying pack ' + packName + '...');
	minifier.run(
		'src',
		packPath,
		'out/' + packName + '.js',
		{ minifyLevel: null },
		function () {
			console.log('Done');
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