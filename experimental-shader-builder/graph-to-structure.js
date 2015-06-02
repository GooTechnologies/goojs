(function () {
	'use strict';

	function createNodes(elements) {
		return elements.reduce(function (nodes, element) {
			var node = {
				id: element.attributes.id,
				type: element.attributes.nodeType
			};

			if (element.attributes.external) {
				node.external = element.attributes.external;
			}

			if (element.attributes.defines) {
				node.defines = element.attributes.defines;
			}

			nodes.push(node);

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

		return structure;
	}

	window.graphToStructure = window.graphToStructure || {};
	window.graphToStructure.toStructure = toStructure;
})();