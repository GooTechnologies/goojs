module.exports = function (grunt) {
	var glob = require('glob');
	var path = require('path');
	var fs = require('fs');

	grunt.registerMultiTask('toc', 'Makes a table of contents', function () {
		var pattern = this.data.pattern;
		var title = this.data.title;
		var outFile = this.data.outFile;
		var relPath = this.data.relPath;

		var files = getFilesSync(pattern);
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			files[i] = path.relative(relPath, file);
		}
		var tree = makeTree(files);
		var content = '<html>\n<head>\n	<title>' + title + '</title>\n</head>\n<body>\n<h1>Contents</h1>';
		content += printTree(tree);
		content += '</body>\n</html>';
		fs.writeFileSync(outFile, content);
	});

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

	function getFilesSync(pattern) {
		return glob.sync(pattern);
	}
};