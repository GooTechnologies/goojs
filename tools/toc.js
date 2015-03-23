'use strict';

var glob = require('glob');
var path = require('path');
var fs = require('fs');

var makeTree = function (files) {
	var tree = {};

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var parts = file.split('/');
		var branch = tree;
		for (var j = 0; j < parts.length; j++) {
			var part = parts[j];
			if (j === parts.length - 1) {
				branch[part] = file;
				break;
			}
			if (!branch[part]) {
				branch[part] = {};
			}
			branch = branch[part];
		}
	}

	return tree;
};

var printTree = function (tree) {
	var ret = '<ul>\n';

	for (var branch in tree) {
		var link = tree[branch];
		ret += '<li>';
		if (typeof link === 'string') {
			ret += '<a href="' + link + '">' + branch + '</a>';
		} else {
			ret += branch;
			ret += printTree(link);
		}
		ret += '</li>\n';
	}

	ret += '</ul>\n';

	return ret;
};

exports.getFiles = function (path, callback) {
	return glob(path + '/**/!(index).html', function (err, files) {
		return callback(err, files);
	});
};

exports.getFilesSync = function (path) {
	return glob.sync(path + '/**/!(index).html');
};

exports.run = function (rootPath, title) {
	var files = exports.getFilesSync(rootPath);
	files = files.filter(function (fileName) {
		return fileName.indexOf('carousel') === -1;
	});

	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		files[i] = path.relative(rootPath, file).replace(/\\/g, '/');
	}

	var tree = makeTree(files);

	var content = '';

	content += [
		'<html>',
		'<head>',
		'<title>' + title + '</title>',
		'<link rel="stylesheet" type="text/css" href="style.css">',
		'</head>',
		'<body>',
		'<article class="container">',
		'<h1>Contents</h1>'
	].join('\n');
	
	content += printTree(tree);

	content += [
		'</article>',
		'</body>',
		'</html>'
	].join('\n');

	fs.writeFileSync(path.resolve(rootPath + '/index.html'), content);
};
