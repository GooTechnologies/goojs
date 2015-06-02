(function () {
	'use strict';

	function createNodes(elements) {
		return elements.reduce(function (nodes, element) {
			nodes.push({
				id: element.attributes.id,
				type: element.attributes.nodeType
			});
			return nodes;
		}, []);
	}

	function toMap(array, idProperty) {
		return array.reduce(function (map, element) {
			map.set(element[idProperty], element);
			return map;
		}, new Map());
	}

	function addConnections(structure, links) {
		var nodesById = toMap(structure, 'id');

		links.forEach(function (link) {
			var sourceNode = nodesById.get(link.attributes.source.id);
			sourceNode.outputsTo = sourceNode.outputsTo || [];
			sourceNode.outputsTo.push({
				output: link.attributes.source.port,
				to: link.attributes.target.id,
				input: link.attributes.target.port
			});
		});
	}

	function toStructure(graph) {
		var elements = graph.getElements();

		var structure = createNodes(elements);

		var links = graph.getLinks();

		addConnections(structure, links);

		console.log(structure);
		return structure;
	}

	window.graphToStructure = window.graphToStructure || {};
	window.graphToStructure.toStructure = toStructure;
})();