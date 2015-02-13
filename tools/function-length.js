// jshint node:true
'use strict';

var fs = require('fs');
var glob = require('glob');
var esprima = require('esprima');
var estraverse = require('estraverse');

function averageForTree(tree) {
	var sum = 0, count = 0;

	estraverse.traverse(tree, {
		enter: function (node, parent) {
			if (
				(node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') &&
				node.body.body.length > 0
			) {
				var bodyRange = node.body.range;
				sum += bodyRange[1] - bodyRange[0];
				count++;
			}
		}
	});

	if (count > 0) {
		return sum / count;
	}
}

function getModuleBody(tree) {
	if (
		tree.body[0].type === 'ExpressionStatement' &&
		tree.body[0].expression.type === 'CallExpression' &&
		tree.body[0].expression.callee.name === 'define'
	) {
		var args = tree.body[0].expression.arguments;
		if (args.length === 1 && args[0].type === 'FunctionExpression') {
			return args[0].body;
		} else if (args.length === 2 && args[1].type === 'FunctionExpression') {
			return args[1].body;
		}
	}
}

function averageForSource(source) {
	var tree = esprima.parse(source, { range: true });

	var moduleBody = getModuleBody(tree);

	if (moduleBody) {
		return averageForTree(moduleBody);
	}
}

function getAverageLength(pattern, ignoreList) {
	pattern = pattern || 'src/goo/**/*.js';
	ignoreList = ignoreList || ['goo.js', 'pack.js'];

	var sum = 0, count = 0;

	var files = glob.sync(pattern);
	files = files.filter(function (file) {
		return ignoreList.every(function (ignoreItem) {
			return file.indexOf(ignoreItem) === -1;
		});
	});

	files.forEach(function (file) {
		var source = fs.readFileSync(file, { encoding: 'utf8' });
		var candidate = averageForSource(source);
		if (typeof candidate === 'number') {
			sum += candidate;
			count++;
		}
	});

	return sum / count;
}

exports.getAverageLength = getAverageLength;