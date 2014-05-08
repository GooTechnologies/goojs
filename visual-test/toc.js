var glob = require('glob');
var path = require('path');
var fs = require('fs');

function makeTree(files) {
	var tree = {};
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		var parts = file.split('/');
		var branch = tree;
		for (var idx = 0; idx < parts.length; idx++) {
			var part = parts[idx];
			if (idx === parts.length - 1) {
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
}

function printTree(tree) {
	var ret = '<ul>\n';
	for (var branch in tree) {
		var link = tree[branch];
		ret += '<li>';
		if (typeof link === 'string') {
			ret += "<a href=\"" + link + "\">" + branch + "</a>";
		} else {
			ret += branch;
			ret += printTree(link);
		}
		ret += '</li>\n';
	}
	ret += '</ul>\n';
	return ret;
}

exports.getFiles = function (callback) {
	return glob(__dirname + '/**/!(index).html', function(err, files) {
		return callback(err, files);
	});
};

exports.getFilesSync = function(pattern) {
	return glob.sync(pattern);
};

exports.getFilePathsSync = function() {
	return glob.sync(__dirname + '/**/!(index).html');
};

exports.run = function(options) {
	options = options || {};

	options.pattern = options.pattern || __dirname + '/**/!(index).html';
	options.title = options.title || 'Visual tests';
	options.outFile = options.outFile || path.resolve('visual-test', 'index.html');
	options.relPath = options.relPath || __dirname;

	var files = exports.getFilesSync(options.pattern);
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		files[i] = path.relative(options.relPath, file);
	}
	var tree = makeTree(files);
	var content = '<html>\n<head>\n	<title>'+options.title+'</title>\n</head>\n<body>\n<h1>Contents</h1>';
	content += printTree(tree);
	content += '</body>\n</html>';
	return fs.writeFileSync(options.outFile, content);
};