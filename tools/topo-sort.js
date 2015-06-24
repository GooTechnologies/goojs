// jshint node:true
'use strict';

/**
 * Returns an order of traversal for the nodes of the supplied graph such that all dependencies are met
 * @param graph
 * @returns {Array}
 * @example
 * sort({
	'2': [],
	'3': ['8', '10'],
	'5': ['11'],
	'7': ['11', '8'],
	'8': ['9'],
	'9': [],
	'10': [],
	'11': ['2', '9']
   })); // -> ['2', '9', '8', '10', '3', '11', '5', '7']
 */
function sort(graph) {
	//! AT: switch to Sets when node supports them
	var unvisited = {};
	var visited = {};
	var order = [];

	function df(nodeName) {
		if (!graph[nodeName]) {
			console.warn('topo-sort: node ' + nodeName + ' does not exist');
			return;
		}

		if (visited[nodeName]) { return; }

		graph[nodeName].forEach(df);
		visited[nodeName] = true;
		delete unvisited[nodeName];
		order.push(nodeName);
	}

	Object.keys(graph).forEach(function (nodeName) { unvisited[nodeName] = true; });

	var remaining = Object.keys(unvisited);
	while (remaining.length) {
		df(remaining[0]);
		remaining = Object.keys(unvisited);
	}

	return order;
}

exports.sort = sort;