var Dependency = require('./dependency').Dependency;
var topoSort = require('./topo-sort');
var derequire = require('./derequire-module');
var fs = require('fs');
var esprima = require('esprima');
var escodegen = require('escodegen');


var rootPath = 'src/';



function stripJS(string) {
	return string.substring(0, -3);
}

function graphise(dependencies) {
	var keys = Object.keys(dependencies);

	var graph = {};
	keys.forEach(function (key) {
		graph[stripJS(key)] = dependencies[key];
	});

	return graph;
}

function filterObj(obj, predicate) {
	var keys = Object.keys(obj);

	var filtered = {};
	keys.forEach(function (key) {
		if (predicate(obj[key], key)) {
			filtered[key] = obj[key];
		}
	});

	return filtered;
}

function getProgram(body) {
	return {
		"type": "Program",
		"body": [{
			"type": "ExpressionStatement",
			"expression": body
		}]
	};
}

/*
var graph = {
	'a': [],
	'b': ['a'],
	'c': ['a'],
	'd': ['b', 'c'],
	'e': ['d']
};
* /
var graph = {
	'c': [],
	'b': ['c'],
	'a': ['c','b']
};
var order = topoSort.sort(graph);
console.log(order);

return;
*/

var generatorOptions = {
	format: {
		indent: {
			style: ''
		}
	},
	newline: '',
	space: '',
	compact: true
};

Dependency.getTree(rootPath, function (dependencies) {
	var graph = graphise(dependencies);
	graph = filterObj(graph, function (obj, key) { return key.indexOf('pack') === -1 && key !== 'goo'; });

	var order = topoSort.sort(graph);


	var processedModules = order.map(function (modulePath) {
		var source = fs.readFileSync(rootPath + modulePath + '.js', 'utf8');

		var tree = esprima.parse(source);
		var strippedModule = derequire.transform(modulePath, tree.body[0].expression);

		var program = getProgram(strippedModule);

		return escodegen.generate(program/*, generatorOptions*/);
	});

	var totalSource = processedModules.reduce(function (prev, cur) {
		return prev + '\n' + cur;
	}, 'window.goo = {};');


	fs.writeFileSync('out/non-min.js', totalSource);
});