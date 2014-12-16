'use strict';

var fs = require('fs');
var glob = require('glob');
var mustache = require('mustache');
var _ = require('underscore');
var marked = require('marked');

var extractor = require('./extractor');
var indoctrinate = require('./indoctrinate');
var util = require('./util');


function processArguments() {
	if (process.argv.length < 6) {
		console.log('Usage: node modoc.js <sourcePath> <templatesPath> <staticsPath> <outPath>');
	}

	var sourcePath = process.argv[2];
	var templatesPath = process.argv[3];
	var staticsPath = process.argv[4];
	var outPath = process.argv[5];

	return {
		sourcePath: sourcePath,
		templatesPath: templatesPath,
		staticsPath: staticsPath,
		outPath: outPath
	};
}

// extract this into its own file ---
function getDifferentiatorIndex(strings) {
	var minLength = strings.reduce(function (prev, cur) {
		return Math.min(prev, cur.length);
	}, strings[0].length);

	for (var i = 0; i < minLength; i++) {
		for (var j = 0; j < strings.length; j++) {
			var string = strings[j];
			if (string[i] !== strings[0][i]) {
				return i;
			}
		}
	}
}

function getIndex(files) {
	var differentiator = getDifferentiatorIndex(files);

	var groups = _.groupBy(files, function (file) {
		return file.substring(differentiator, file.indexOf('/', differentiator));
	});

	var mapping = {};
	var index = Object.keys(groups).map(function (name) {
		var group = groups[name];
		return {
			name: name,
			classes: group.map(function (file) {
				var fileName = util.getFileName(file);
				var path = file.substring(differentiator, file.length - 3);
				var entry = {
					name: fileName,
					path: path,
					link: fileName + HTML_SUFFIX
				};
				mapping[file] = entry;
				return entry
			})
		}
	});

	return {
		index: index,
		mapping: mapping
	}
}
// --- --- ---

var getFiles = function (sourcePath, ignore) {
	if (/\.js$/.test(sourcePath)) {
		return [sourcePath];
	}

	return glob.sync(sourcePath + '/**/*.js').filter(function (file) {
		return ignore.every(function (term) {
			return file.indexOf(term) === -1;
		});
	});
};

var HTML_SUFFIX = '-doc.html'

var args = processArguments();

var template = fs.readFileSync(args.templatesPath + '/t1.mustache', { encoding: 'utf8' });

var files = getFiles(args.sourcePath, ['goo.js', 'pack', '+']);

var indexAndMapping = getIndex(files, 'goo');
var index = indexAndMapping.index;
var mapping = indexAndMapping.mapping;

function copyStaticFiles(callback) {
	require('child_process')
		.exec('cp -r ' + args.staticsPath + '/. ' + args.outPath, function (error, stdout, stderr) {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
			callback();
		});
}

function filterPrivates(class_) {
	var predicate = function (entry) {
		return entry.comment && !(entry.comment.private || entry.comment.hidden);
	};

	class_.members = class_.members.filter(predicate);
	class_.methods = class_.methods.filter(predicate);
	class_.statics = class_.statics.filter(predicate);
}

function buildDoc() {
	files.forEach(function (file) {
		var source = fs.readFileSync(file, { encoding: 'utf8' });

		var data = {};
		data.index = index;

		data.class = extractor.extract(source, file);

		// skipping files which lack a class for now (poor SystemBus)
		// if no constructor is found then the extractor will have to extract the first @class comment
		if (data.class.constructor) {
			indoctrinate.all(data.class, files);

			filterPrivates(data.class);

			data.class.path = mapping[file].path;

			mapping[file].current = true;
			var result = mustache.render(template, data);
			mapping[file].current = false;

			fs.writeFileSync(args.outPath + '/' + data.class.constructor.name + HTML_SUFFIX, result);

			console.log('done writing ' + args.outPath + '/' + data.class.constructor.name + HTML_SUFFIX);
		}
	});
}

function buildChangelog(file) {
	var changelog = fs.readFileSync(file, { encoding: 'utf8' });
	var formatted = marked(changelog);

	var template = fs.readFileSync(args.templatesPath + '/changelog.mustache', { encoding: 'utf8' });
	var data = { content: formatted };
	var result = mustache.render(template, data);

	fs.writeFileSync(args.outPath + '/changelog.html', result);
}

copyStaticFiles(function () {
	buildDoc();
	buildChangelog('../goojs/CHANGES');
});