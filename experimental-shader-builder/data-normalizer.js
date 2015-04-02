(function () {
	'use strict';

	function normalizeNodeTypes(nodeTypes) {
		if (!nodeTypes) { return {}; }

		Object.keys(nodeTypes).forEach(function (key) {
			var nodeType = nodeTypes[key];

			nodeType.inputs = nodeType.inputs || [];
			nodeType.outputs = nodeType.outputs || [];
		});

		return nodeTypes;
	}

	function normalizeStructure(structure) {
		if (!structure) { return []; }

		structure.forEach(function (node) {
			node.externalInputs = node.externalInputs || [];
			node.outputsTo = node.outputsTo || [];
		});

		return structure;
	}

	window.dataNormalizer = {};
	window.dataNormalizer.normalizeNodeTypes = normalizeNodeTypes;
	window.dataNormalizer.normalizeStructure = normalizeStructure;
})();
