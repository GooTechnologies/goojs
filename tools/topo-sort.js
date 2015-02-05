function invert(graph) {
	var inverted = {};

	var keys = Object.keys(graph);
	keys.forEach(function (key) {
		graph[key].forEach(function (dependency) {
			if (!inverted[dependency]) {
				inverted[dependency] = [];
			}

			inverted[dependency].push(key);
		});
	});

	return inverted;
}

function getDegrees(graph) {
	var degrees = {};

	var keys = Object.keys(graph);
	keys.forEach(function (key) {
		degrees[key] = graph[key].length;
	});

	return degrees;
}


function sort(graph) {

	function bfs(queue) {
		var visited = {};
		var order = [];

		while (queue.length) {
			var current = queue.shift();
			if (!visited[current]) {
				visited[current] = true;
				order.push(current);

				if (inverted[current]) {
					for (var i = 0; i < inverted[current].length; i++) {
						degrees[inverted[current][i]]--;
						if (degrees[inverted[current][i]] === 0) {
							queue.push(inverted[current][i]);
						}
					}
				}
			}
		}

		return order;
	}


	var degrees = getDegrees(graph);
	var inverted = invert(graph);


	var nodeNames = Object.keys(graph);
	var startNodes = nodeNames.filter(function (nodeName) {
		return graph[nodeName].length === 0;
	});

	var order = bfs(startNodes);

	return order;
}


exports.sort = sort;