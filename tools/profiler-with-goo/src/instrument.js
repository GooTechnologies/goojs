var fs = require('fs');
var glob = require('glob');
var mkpath = require('mkpath');

var coverage = require('./coverage.js');

var basePath = 'projects/goojs';

var files = glob.sync(basePath + '/**/*.js');

function processPath(file) {
	var match = file.match(/(.+)\/(\w+)\.js$/);
	return {
		directory: match[1],
		fileName: match[2]
	}
}

var newBasePath = basePath + '-ins';

function getNewFile(file) {
	return newBasePath + file.slice(basePath.length);
}

var totalEntries = 0;
var byFiles = {};

files.forEach(function (file) {
	var newFile = getNewFile(file);

	var source = fs.readFileSync(file, 'utf8');

	var result = coverage.instrument(source, totalEntries);
	byFiles[file] = {
		offset: totalEntries,
		mapping: result.mapping
	};
	totalEntries += result.mapping.length;

	var path = processPath(newFile);

	mkpath.sync(path.directory);

	fs.writeFileSync(newFile, result.source);
});

var jsonStr = JSON.stringify(byFiles);

fs.writeFileSync(newBasePath + '/mapping.json', jsonStr);