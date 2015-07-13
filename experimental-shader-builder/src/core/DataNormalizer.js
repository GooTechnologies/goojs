define(function () {
	'use strict';

	/**
	 * Adds missing empty arrays or maps such that all entries have the same properties
	 * @param {NodeType[]} nodeTypes
	 * @returns {NodeType[]}
	 */
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

	/**
	 * Adds missing empty arrays or maps such that all entries have the same properties
	 * @param {NodeInstance[]} structure
	 * @returns {NodeInstance[]}
	 */
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

			// temporary adaptor to preserve backwards compatibility
			if (node.type === 'external') {
				node.type = 'external-input';
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
