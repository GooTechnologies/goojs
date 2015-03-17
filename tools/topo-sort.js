// jshint node:true
'use strict';

function sort(graph) {
	//! AT: switch to Sets when node supports them
	var unvisited = {};
	var visited = {};
	var order = [];

	function df(nodeName) {
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

//console.log(sort({
//	'2': [],
//	'3': ['8', '10'],
//	'5': ['11'],
//	'7': ['11', '8'],
//	'8': ['9'],
//	'9': [],
//	'10': [],
//	'11': ['2', '9']
//}));

//console.log(sort({
//	'a': ['b', 'c'],
//	'b': ['d'],
//	'c': ['d'],
//	'd': []
//}));