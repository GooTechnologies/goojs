// jshint node:true
'use strict';

var Dependency = require('./dependency');

function extractModuleName(s) {
	var slash = s.lastIndexOf('/');
	var dot = s.lastIndexOf('.');

	// pattern matching!
	if (slash === -1) {
		if (dot === -1) {
			return s;
		} else {
			return s.substr(0, dot);
		}
	} else {
		if (dot === -1) {
			return s.substr(slash + 1);
		} else {
			return s.substring(slash + 1, dot);
		}
	}
}

/**
 * Replaces full paths with module names in a graph structure
 * @param {Graph} graph
 * @returns {Graph}
 */
function getNiceGraph(graph) {
	var niceGraph = {};
	for (var key in graph) {
		var niceName = extractModuleName(key);
		niceGraph[niceName] = graph[key].map(extractModuleName);
	}
	return niceGraph;
}

function checkCycles(graph) {
	// check for cycles in the graph
	var traversed;

	// bad, slow alg to check for cycles
	function walk(nodeName, startNode, path) {
		if (nodeName === startNode) {
			process.stdout.write('Cycle detected!\n' + path);
			process.exit(1);
		}
		if (startNode === null) { startNode = nodeName; }

		if (traversed[nodeName]) { return; }

		traversed[nodeName] = true;

		if (graph[nodeName]) {
			graph[nodeName].forEach(function (next) {
				walk(next, startNode, path + ' - ' + next);
			});
		}
	}

	// start walking from every node
	for (var key in graph) {
		if (key !== 'goo') {
			traversed = {};
			walk(key, null, key);
		}
	}

	console.log('No cycles found'.green);
}

// ---
function cycleDetector() {
	// do the whole tree
	Dependency.getTree(rootPath, function (graph) {
		// get the nice graph - without paths
		graph = getNiceGraph(graph);

		// check for cycles
		checkCycles(graph);
	});
}

function dependencies(fileName) {
	Dependency.getDependencies(fileName, function (properFileName, dependencies) {
		console.log(properFileName, 'is dependant on\n', dependencies);
	});
}

function dependants(fileName) {
	Dependency.getDependants(rootPath, fileName, function (properFileName, dependants) {
		console.log(properFileName, 'is required by\n', dependants);
	});
}

function help() {
	var helpString = [
		"Usage:",
		" --cycles",
		" --dependencies <modulepath>",
		" --dependants <modulepath>"
	].join('\n');

	console.log(helpString);
}

var rootPath;

function main() {
	rootPath = 'src/';
	var args = process.argv;
	if (args.length === 2) {
		cycleDetector();
	} else {
		if (args[2] === '--cycles' && args.length === 3) {
			cycleDetector();
		} else if (args[2] === '--dependencies' && args.length === 4) {
			dependencies(args[3]);
		} else if (args[2] === '--dependants' && args.length === 4) {
			dependants(args[3]);
		} else {
			 help();
		}
	}
}

main();