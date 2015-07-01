define(function () {
	'use strict';

	function normalizeNodeTypes(nodeTypes) {
		if (!nodeTypes) { return {}; }

		Object.keys(nodeTypes).forEach(function (key) {
			var nodeType = nodeTypes[key];

			nodeType.inputs = nodeType.inputs || [];
			nodeType.outputs = nodeType.outputs || [];
			nodeType.defines = nodeType.defines || {};
		});

		return nodeTypes;
	}

	function safenIdentifier(string) {
		return string.replace(/-/g, '_');
	}

	function normalizeStructure(structure) {
		if (!structure) { return []; }

		structure.forEach(function (node) {
			node.id = safenIdentifier(node.id);

			if (node.outputsTo) {
				node.outputsTo.forEach(function (entry) {
					entry.to = safenIdentifier(entry.to);
				});
			} else {
				node.outputsTo = [];
			}

			if (node.type === 'external-input' || node.type === 'external-output') {
				node.external = node.external || {};
			} else {
				node.defines = node.defines || {};
			}
		});

		return structure;
	}

	return {
		normalizeNodeTypes: normalizeNodeTypes,
		normalizeStructure: normalizeStructure
	};
});
